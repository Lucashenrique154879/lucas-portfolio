import { startLogin } from "@/const";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  FileImage,
  ImagePlus,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@shared/const";
import type { projects } from "@shared/types";

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

type Accent = "yellow" | "dark";

type FormState = {
  id?: number;
  slug: string;
  number: string;
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  accent: Accent;
  challenge: string;
  solution: string;
  result: string;
  benefits: string;
  sortOrder: string;
  published: boolean;
};

type ProjectRow = Omit<typeof projects.$inferSelect, "benefits" | "published" | "id"> & {
  id: number;
  benefits: string[];
  published: boolean;
};

const emptyForm: FormState = {
  slug: "",
  number: "01",
  label: "Site profissional",
  title: "",
  description: "",
  imageUrl: "",
  accent: "yellow",
  challenge: "",
  solution: "",
  result: "",
  benefits: "",
  sortOrder: "0",
  published: true,
};

function formFromProject(project: ProjectRow): FormState {
  const benefits = Array.isArray(project.benefits) ? project.benefits : [];
  return {
    id: project.id,
    slug: project.slug,
    number: project.number,
    label: project.label,
    title: project.title,
    description: project.description,
    imageUrl: project.imageUrl ?? "",
    accent: project.accent as Accent,
    challenge: project.challenge ?? "",
    solution: project.solution ?? "",
    result: project.result ?? "",
    benefits: benefits.join("\n"),
    sortOrder: String(project.sortOrder),
    published: Boolean(project.published),
  };
}

function safeFileName(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalized.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function slugify(input: string) {
  const normalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

const LABELS = [
  "Site profissional",
  "Site institucional",
  "Landing page",
  "Sistema personalizado",
  "Aplicativo mobile",
  "Aplicativo sob medida",
];

export default function AdminProjects() {
  const { user, loading, logout } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<{ email?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string } | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [toDelete, setToDelete] = useState<ProjectRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin" || supabaseUser?.email?.trim().toLowerCase() === ADMIN_EMAIL;
  const adminServerSession = Boolean(user);

  const projectsQuery = trpc.projects.adminList.useQuery(undefined, { enabled: isAdmin, retry: false });
  const checkSlug = trpc.projects.checkSlug.useQuery(
    { slug: form.slug.trim(), excludeId: form.id },
    {
      enabled: isAdmin && editorOpen && form.slug.trim().length > 0,
      staleTime: 4000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (checkSlug.isFetching) setSlugStatus("checking");
    else if (checkSlug.isSuccess) setSlugStatus(checkSlug.data.available ? "available" : "taken");
    else if (checkSlug.isError) setSlugStatus("idle");
  }, [checkSlug.isFetching, checkSlug.isSuccess, checkSlug.isError, checkSlug.data?.available]);

  const uploadImageMutation = trpc.projects.uploadImage.useMutation({
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto criado e publicado no portfólio.");
      setForm(emptyForm);
      setSlugStatus("idle");
      setEditorOpen(false);
      utils.projects.adminList.invalidate();
      utils.projects.list.invalidate();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Alterações salvas no banco de dados.");
      setForm(emptyForm);
      setSlugStatus("idle");
      setEditorOpen(false);
      utils.projects.adminList.invalidate();
      utils.projects.list.invalidate();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const removeMutation = trpc.projects.remove.useMutation({
    onSuccess: () => {
      toast.success("Projeto excluído.");
      setToDelete(null);
      setDeleteBusy(false);
      if (form.id === toDelete?.id) {
        setForm(emptyForm);
        setEditorOpen(false);
      }
      utils.projects.adminList.invalidate();
      utils.projects.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
      setDeleteBusy(false);
    },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: { user: { email?: string } | null } | null } | null }) => {
      setSupabaseUser(data?.session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user: { email?: string } | null } | null) => {
      setSupabaseUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false);
    if (result.error) {
      setAuthError(result.error.message === "Invalid login credentials" ? "Email ou senha inválidos." : result.error.message);
      setPassword("");
      return;
    }
    setPassword("");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await logout();
  };

  const openNew = () => {
    if (uploadingImage) return;
    setForm(emptyForm);
    setImageMeta(null);
    setSlugStatus("idle");
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (project: ProjectRow) => {
    if (uploadingImage) return;
    setForm(formFromProject(project));
    setImageMeta(null);
    setSlugStatus("idle");
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    if (uploadingImage) return;
    setForm(emptyForm);
    setSlugStatus("idle");
    setEditorOpen(false);
  };

  const updateField = (field: keyof FormState, value: string | boolean) =>
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && typeof value === "string" && !current.id && (!current.slug || current.slug === slugify(current.title || ""))) {
        next.slug = slugify(value);
      }
      if (field === "slug" && typeof value === "string") {
        next.slug = slugify(value);
        setSlugStatus("checking");
      }
      return next;
    });

  const processImageFile = async (file?: File) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error("Formato não suportado. Use PNG, JPG, WEBP ou GIF.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("A imagem deve ter no máximo 15 MB.");
      return;
    }
    setImageMeta({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` });
    setUploadingImage(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await uploadImageMutation.mutateAsync({
        base64,
        contentType: file.type,
        fileName: file.name,
        size: file.size,
      });
      updateField("imageUrl", result.publicUrl);
      toast.success("Imagem enviada para o portfólio.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar a imagem.");
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    await processImageFile(file);
  };

  const handleImageDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    await processImageFile(event.dataTransfer.files?.[0]);
  };

  const removeCurrentImage = () => {
    if (uploadingImage) return;
    updateField("imageUrl", "");
    setImageMeta(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteBusy(true);
    removeMutation.mutate({ id: toDelete.id });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Informe o título do projeto.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Defina um nome interno (slug) para o projeto.");
      return;
    }
    if (slugStatus === "taken") {
      toast.error("Este slug já está em uso por outro projeto.");
      return;
    }
    const payload = {
      slug: form.slug.trim(),
      number: form.number.trim() || "01",
      label: form.label.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || null,
      accent: form.accent,
      challenge: form.challenge.trim() || null,
      solution: form.solution.trim() || null,
      result: form.result.trim() || null,
      benefits: form.benefits.split("\n").map((item) => item.trim()).filter(Boolean),
      sortOrder: Number(form.sortOrder) || 0,
      published: form.published,
    };
    if (form.id) updateMutation.mutate({ id: form.id, ...payload });
    else createMutation.mutate(payload);
  };

  const projects = projectsQuery.data ?? [];
  const publishedCount = projects.filter((p) => p.published).length;
  const draftCount = projects.length - publishedCount;

  const filteredProjects = projects
    .filter((p) => (filter === "published" ? p.published : filter === "draft" ? !p.published : true))
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return `${p.title} ${p.label} ${p.slug} ${p.description}`.toLowerCase().includes(q);
    })
    .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder) || a.id - b.id);

  if (loading || authLoading) {
    return (
      <div className="admin-shell admin-loading">
        <Loader2 size={18} className="admin-upload-spin" /> Carregando acesso seguro...
      </div>
    );
  }

  if (!supabaseUser && !user) {
    return (
      <div className="admin-shell admin-gate">
        <div>
          <span className="admin-kicker">Lucas /dev · gerenciamento</span>
          <h1>
            Entre para
            <br />
            <em>continuar.</em>
          </h1>
          <p>Acesse com o email autorizado e sua senha para gerenciar o portfólio.</p>
          <form className="admin-login-form" onSubmit={signIn}>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
            </label>
            <label>
              Senha
              <span className="admin-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="admin-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </label>
            {authError && <small className="admin-auth-error">{authError}</small>}
            <button className="admin-primary" disabled={authBusy}>
              {authBusy ? "Entrando..." : "Entrar"}
            </button>
            {import.meta.env.VITE_OAUTH_PORTAL_URL && (
              <button type="button" className="admin-secondary" onClick={() => startLogin()}>
                Entrar via plataforma
              </button>
            )}
          </form>
          <Link href="/" className="admin-back">
            Voltar ao portfólio
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-shell admin-gate">
        <div>
          <span className="admin-kicker">acesso restrito</span>
          <h1>
            Esta área é
            <br />
            <em>privada.</em>
          </h1>
          <p>Somente o email autorizado pode gerenciar os projetos deste portfólio.</p>
          <button className="admin-primary" onClick={signOut}>
            Sair da conta atual
          </button>
          <Link href="/" className="admin-back">
            Voltar ao portfólio
          </Link>
        </div>
      </div>
    );
  }

  const busySaving = createMutation.isPending || updateMutation.isPending;
  const slugChecking = slugStatus === "checking" || checkSlug.isFetching;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-back">
          <ArrowLeft size={16} /> portfólio
        </Link>
        <div className="admin-brand">
          LUCAS <span>/ GERENCIAMENTO</span>
        </div>
        <button className="admin-logout" onClick={signOut}>
          <LogOut size={14} /> sair
        </button>
      </header>

      <section className="admin-intro">
        <div>
          <span className="admin-kicker">painel privado · dados no Supabase</span>
          <h1>
            Projetos,
            <br />
            <em>sob controle.</em>
          </h1>
          <p>
            Adicione, edite ou remova projetos. Tudo é salvo no banco de dados e publicado na página de projetos do
            portfólio em tempo real.
          </p>
        </div>
        <div className="admin-stats">
          <div className="admin-stat">
            <strong>{projects.length}</strong>
            <span>
              projetos
              <br />
              cadastrados
            </span>
          </div>
          <div className="admin-stat admin-stat-alt">
            <strong>{publishedCount}</strong>
            <span>
              publicados
              <br />no portfólio
            </span>
          </div>
          {draftCount > 0 && (
            <div className="admin-stat admin-stat-alt">
              <strong>{draftCount}</strong>
              <span>
                rascunhos
                <br />
                ocultos
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="admin-workspace" aria-label="Lista e edição de projetos">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={14} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar projeto..." aria-label="Buscar projeto" />
          </div>
          <div className="admin-filter" role="group" aria-label="Filtrar projetos">
            {(
              [
                { key: "all", label: "Todos" },
                { key: "published", label: "Publicados" },
                { key: "draft", label: "Rascunhos" },
              ] as const
            ).map(({ key, label }) => (
              <button key={key} className={filter === key ? "is-active" : ""} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
          <button className="admin-new" onClick={openNew} disabled={uploadingImage}>
            <Plus size={14} /> Novo projeto
          </button>
        </div>

        {projectsQuery.isError && (
          <div className="admin-banner admin-banner-error">
            Não foi possível carregar os projetos do banco de dados. Verifique se o Supabase está configurado corretamente.
          </div>
        )}

        {!adminServerSession && (
          <div className="admin-banner admin-banner-warn">
            Sessão de administrador (servidor) não detectada. As ações podem exigir autenticação via plataforma para
            salvar no banco.
          </div>
        )}

        {projectsQuery.isLoading ? (
          <div className="admin-empty">
            <Loader2 size={20} className="admin-upload-spin" />
            <span>Carregando projetos...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="admin-empty">
            <FileImage size={22} />
            <strong>{projects.length === 0 ? "Nenhum projeto cadastrado" : "Nada encontrado"}</strong>
            <span>
              {projects.length === 0
                ? "Clique em “Novo projeto” para começar a montar seu portfólio."
                : "Tente ajustar a busca ou o filtro."}
            </span>
          </div>
        ) : (
          <div className="admin-card-grid">
            {filteredProjects.map((project) => (
              <article className="admin-card" key={project.id}>
                <div className={`admin-card-media ${project.imageUrl ? "" : "admin-card-media-empty"}`}>
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} loading="lazy" decoding="async" />
                  ) : (
                    <span>Sem imagem</span>
                  )}
                  <span className={`admin-pill ${project.published ? "is-published" : "is-draft"}`}>
                    {project.published ? "Publicado" : "Rascunho"}
                  </span>
                  <span className="admin-card-number">{project.number}</span>
                </div>
                <div className="admin-card-body">
                  <span className="admin-card-label">{project.label}</span>
                  <h3>{project.title || "Projeto sem título"}</h3>
                  <p>{project.description}</p>
                  <div className="admin-card-meta">
                    <span>{project.slug}</span>
                    <span>ordem {project.sortOrder}</span>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => openEdit(project)} aria-label={`Editar ${project.title}`}>
                    <Pencil size={14} /> Editar
                  </button>
                  <a href={`/projetos#${project.slug}`} target="_blank" rel="noreferrer" aria-label={`Ver ${project.title} no portfólio`}>
                    <ArrowUpRight size={14} /> Ver
                  </a>
                  <button className="is-danger" onClick={() => setToDelete(project)} aria-label={`Excluir ${project.title}`}>
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editorOpen && (
        <section className="admin-editor" aria-label={form.id ? "Editar projeto" : "Novo projeto"}>
          <div className="admin-editor-head">
            <div>
              <span className="admin-kicker">{form.id ? "editando projeto" : "novo projeto"}</span>
              <h2>{form.id ? "Ajustes precisos." : "Cadastre um novo projeto."}</h2>
            </div>
            <button className="admin-icon-button" onClick={cancelEdit} aria-label="Fechar editor">
              <X size={18} />
            </button>
          </div>

          <form className="admin-form" onSubmit={submit}>
            <div className="admin-form-grid">
              <div className="admin-form-section wide">
                <span className="admin-form-section-title">Identificação</span>
                <label className="wide">
                  <span className="admin-label-row">
                    Nome interno / slug
                    {form.slug.trim() && (
                      <small
                        className="admin-slug-state"
                        style={{
                          color:
                            slugStatus === "available" ? "#6aa84f" : slugStatus === "taken" ? "#c0392b" : slugChecking ? "#d99500" : "#777a75",
                        }}
                      >
                        {slugStatus === "available" ? "✓ disponível" : slugStatus === "taken" ? "✕ já em uso" : slugChecking ? "verificando…" : ""}
                      </small>
                    )}
                  </span>
                  <input
                    required
                    value={form.slug}
                    onChange={(event) => updateField("slug", event.target.value)}
                    placeholder="meu-site-profissional"
                    className={slugStatus === "taken" ? "is-invalid" : slugStatus === "available" ? "is-valid" : ""}
                  />
                  <small className="admin-hint">Preenchimento automático a partir do título. Use apenas letras, números e hífens.</small>
                </label>
                <label>
                  Número
                  <input required value={form.number} onChange={(event) => updateField("number", event.target.value)} placeholder="01" />
                </label>
                <label>
                  Categoria
                  <select value={form.label} onChange={(event) => updateField("label", event.target.value)}>
                    {LABELS.map((label) => (
                      <option key={label}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Título do projeto
                  <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Nome que o cliente vai ver" />
                </label>
                <label className="wide">
                  Resumo
                  <textarea required rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Explique rapidamente o que foi criado." />
                </label>
              </div>

              <div className="admin-form-section wide">
                <span className="admin-form-section-title">Imagem de capa</span>
                <div className="wide admin-image-field">
                  <div
                    className={`admin-dropzone ${isDraggingImage ? "is-dragging" : ""}`}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={(event) => {
                      if (event.currentTarget === event.target) setIsDraggingImage(false);
                    }}
                    onDrop={handleImageDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") imageInputRef.current?.click();
                    }}
                  >
                    <Upload size={22} />
                    <strong>{isDraggingImage ? "Solte a imagem aqui" : "Arraste uma imagem para cá"}</strong>
                    <span>ou escolha um arquivo da galeria</span>
                    <button type="button" className="admin-upload-button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}>
                      {uploadingImage ? (
                        <>
                          <Loader2 size={15} className="admin-upload-spin" /> Enviando imagem...
                        </>
                      ) : (
                        <>
                          <ImagePlus size={15} /> Escolher imagem
                        </>
                      )}
                    </button>
                    <input
                      ref={imageInputRef}
                      className="admin-file-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={uploadImage}
                    />
                  </div>
                  {form.imageUrl ? (
                    <div className="admin-image-preview">
                      <img src={form.imageUrl} alt="Pré-visualização da capa" />
                      {imageMeta && (
                        <span>
                          {imageMeta.name} · {imageMeta.size}
                        </span>
                      )}
                      <button type="button" className="admin-icon-button" onClick={removeCurrentImage} aria-label="Remover imagem" disabled={uploadingImage}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    imageMeta && (
                      <div className="admin-image-meta">
                        <span>{imageMeta.name}</span>
                        <b>{imageMeta.size}</b>
                      </div>
                    )
                  )}
                  <small className="admin-hint">PNG, JPG, WEBP ou GIF · até 15 MB. A imagem é armazenada no Supabase Storage.</small>
                </div>
              </div>

              <div className="admin-form-section wide">
                <span className="admin-form-section-title">Conteúdo do case</span>
                <label className="wide">
                  Desafio
                  <textarea rows={3} value={form.challenge} onChange={(event) => updateField("challenge", event.target.value)} placeholder="Qual necessidade ou problema existia?" />
                </label>
                <label className="wide">
                  Solução
                  <textarea rows={3} value={form.solution} onChange={(event) => updateField("solution", event.target.value)} placeholder="O que foi criado para resolver o desafio." />
                </label>
                <label className="wide">
                  Resultado
                  <textarea rows={3} value={form.result} onChange={(event) => updateField("result", event.target.value)} placeholder="Benefício ou transformação gerada." />
                </label>
                <label className="wide">
                  <span className="admin-label-row">
                    <span>Benefícios do projeto</span>
                    <small className="admin-hint">um por linha</small>
                  </span>
                  <textarea rows={4} value={form.benefits} onChange={(event) => updateField("benefits", event.target.value)} placeholder={"Resultado rápido\nRelatórios claros\nEquipe treinada"} />
                </label>
              </div>

              <div className="admin-form-section wide">
                <span className="admin-form-section-title">Publicação</span>
                <label>
                  Ordem de exibição
                  <input type="number" min={0} value={form.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} placeholder="0" />
                  <small className="admin-hint">Menor valor aparece primeiro na página pública.</small>
                </label>
                <label>
                  Destaque
                  <select value={form.accent} onChange={(event) => updateField("accent", event.target.value)}>
                    <option value="yellow">Amarelo</option>
                    <option value="dark">Escuro</option>
                  </select>
                </label>
                <label className="wide admin-publish-row">
                  <span>
                    <strong>Projeto publicável</strong>
                    <small className="admin-hint">Rascunhos só aparecem para você no painel.</small>
                  </span>
                  <input type="checkbox" className="admin-switch" checked={form.published} onChange={(event) => updateField("published", event.target.checked)} />
                </label>
              </div>
            </div>

            <div className="admin-form-actions">
              <span className={form.id ? "admin-edit-mode is-on" : "admin-edit-mode"}>
                <Check size={13} /> {form.id ? `Editando "${form.id ? projects.find((p) => p.id === form.id)?.title ?? form.title : form.title}"` : "Modo criação"}
              </span>
              <button type="button" className="admin-ghost" onClick={cancelEdit} disabled={busySaving || uploadingImage}>
                Cancelar
              </button>
              <button className="admin-primary" disabled={busySaving || uploadingImage || slugStatus === "checking"}>
                {busySaving ? (
                  <>
                    <Loader2 size={15} className="admin-upload-spin" /> Salvando...
                  </>
                ) : form.id ? (
                  <>
                    <Save size={15} /> Salvar alterações
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Criar projeto
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {toDelete && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setToDelete(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="admin-modal-icon">
              <AlertTriangle size={22} />
            </div>
            <h3 id="delete-title">Excluir projeto?</h3>
            <p>
              O projeto <strong>{toDelete.title || "sem título"}</strong> e sua imagem serão removidos do banco de dados e
              deixarão de aparecer no portfólio. Esta ação não pode ser desfeita.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-ghost" onClick={() => setToDelete(null)} disabled={deleteBusy}>
                Cancelar
              </button>
              <button className="admin-danger" onClick={confirmDelete} disabled={deleteBusy}>
                {deleteBusy ? (
                  <>
                    <Loader2 size={15} className="admin-upload-spin" /> Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Excluir definitivamente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}