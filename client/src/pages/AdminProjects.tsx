import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, ImagePlus, LogOut, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@shared/const";

type FormState = {
  id?: number;
  slug: string;
  number: string;
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  accent: "yellow" | "dark";
  challenge: string;
  solution: string;
  result: string;
  benefits: string;
  sortOrder: string;
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

function formFromProject(project: any): FormState {
  return {
    id: project.id,
    slug: project.slug,
    number: project.number,
    label: project.label,
    title: project.title,
    description: project.description,
    imageUrl: project.imageUrl ?? "",
    accent: project.accent,
    challenge: project.challenge ?? "",
    solution: project.solution ?? "",
    result: project.result ?? "",
    benefits: project.benefits.join("\n"),
    sortOrder: String(project.sortOrder),
    published: Boolean(project.published),
  };
}

function safeFileName(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalized.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminProjects() {
  const { user, loading, logout } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<{ email?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin" || supabaseUser?.email?.trim().toLowerCase() === ADMIN_EMAIL;
  const projectsQuery = trpc.projects.adminList.useQuery(undefined, { enabled: isAdmin, retry: false });
  const createProject = trpc.projects.create.useMutation({ onSuccess: () => { toast.success("Projeto salvo no Supabase."); setForm(emptyForm); utils.projects.adminList.invalidate(); utils.projects.list.invalidate(); }, onError: (error) => toast.error(error.message) });
  const updateProject = trpc.projects.update.useMutation({ onSuccess: () => { toast.success("Projeto atualizado no Supabase."); setForm(emptyForm); utils.projects.adminList.invalidate(); utils.projects.list.invalidate(); }, onError: (error) => toast.error(error.message) });
  const removeProject = trpc.projects.remove.useMutation({ onSuccess: () => { toast.success("Projeto removido."); utils.projects.adminList.invalidate(); utils.projects.list.invalidate(); }, onError: (error) => toast.error(error.message) });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSupabaseUser(data.session?.user ?? null); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setSupabaseUser(session?.user ?? null); setAuthLoading(false); });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false);
    if (result.error) { setAuthError("Email ou senha inválidos."); return; }
    setPassword("");
  };

  const signOut = async () => { await supabase.auth.signOut(); await logout(); };
  const updateField = (field: keyof FormState, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem."); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 50 MB."); return; }
    setUploadingImage(true);
    const fileName = `${Date.now()}-${safeFileName(file.name) || "projeto"}`;
    const filePath = `portfolio/projects/${fileName}`;
    const { error } = await supabase.storage.from("portfolio-images").upload(filePath, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) {
      setUploadingImage(false);
      toast.error(`Não foi possível enviar a imagem: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);
    updateField("imageUrl", data.publicUrl);
    setUploadingImage(false);
    toast.success("Imagem enviada para o Supabase Storage.");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      slug: form.slug.trim(),
      number: form.number.trim(),
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
    if (form.id) updateProject.mutate({ id: form.id, ...payload });
    else createProject.mutate(payload);
  };

  if (loading || authLoading) return <div className="admin-shell admin-loading">Carregando acesso seguro...</div>;
  if (!supabaseUser && !user) return <div className="admin-shell admin-gate"><div><span className="admin-kicker">Lucas /dev · gerenciamento</span><h1>Entre para<br /><em>continuar.</em></h1><p>Acesse com o email autorizado e sua senha para gerenciar o portfólio.</p><form className="admin-login-form" onSubmit={signIn}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{authError && <small className="admin-auth-error">{authError}</small>}<button className="admin-primary" disabled={authBusy}>{authBusy ? "Entrando..." : "Entrar"}</button></form><Link href="/" className="admin-back">Voltar ao portfólio</Link></div></div>;
  if (!isAdmin) return <div className="admin-shell admin-gate"><div><span className="admin-kicker">acesso restrito</span><h1>Esta área é<br /><em>privada.</em></h1><p>Somente o email autorizado pode gerenciar os projetos deste portfólio.</p><button className="admin-primary" onClick={signOut}>Sair da conta atual</button><Link href="/" className="admin-back">Voltar ao portfólio</Link></div></div>;

  const busy = createProject.isPending || updateProject.isPending || uploadingImage;
  return <main className="admin-shell"><header className="admin-header"><Link href="/" className="admin-back"><ArrowLeft size={16} /> portfólio</Link><div className="admin-brand">LUCAS <span>/ PROJETOS</span></div><button className="admin-logout" onClick={signOut}><LogOut size={14} /> sair</button></header><section className="admin-intro"><div><span className="admin-kicker">painel privado · Supabase</span><h1>Seus projetos,<br /><em>sempre salvos.</em></h1><p>Cadastre, organize e atualize seus trabalhos. Os dados são persistidos no banco Supabase e as imagens ficam no Supabase Storage.</p></div><div className="admin-stat"><strong>{projectsQuery.data?.length ?? 0}</strong><span>projetos<br />cadastrados</span></div></section><div className="admin-layout"><form className="admin-form" onSubmit={submit}><div className="admin-form-top"><span>{form.id ? "editar projeto" : "novo projeto"}</span>{form.id && <button type="button" className="admin-icon-button" onClick={() => setForm(emptyForm)} aria-label="Cancelar edição"><X size={16} /></button>}</div><div className="admin-form-grid"><label>Nome interno / slug<input required value={form.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="meu-site-profissional" /></label><label>Número<input required value={form.number} onChange={(event) => updateField("number", event.target.value)} placeholder="01" /></label><label className="wide">Categoria<select value={form.label} onChange={(event) => updateField("label", event.target.value)}><option>Site profissional</option><option>Site institucional</option><option>Landing page</option><option>Sistema personalizado</option><option>Aplicativo mobile</option><option>Aplicativo sob medida</option></select></label><label className="wide">Título do projeto<input required value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Nome que o cliente vai ver" /></label><label className="wide">Resumo<textarea required rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Explique rapidamente o que foi criado." /></label><div className="wide admin-image-field"><span className="label-with-icon"><ImagePlus size={14} /> Imagem do projeto</span><div className="admin-upload-row"><button type="button" className="admin-upload-button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}>{uploadingImage ? <><Upload size={15} className="admin-upload-spin" /> Enviando imagem...</> : <><ImagePlus size={15} /> Escolher da galeria</>}</button><input ref={imageInputRef} className="admin-file-input" type="file" accept="image/*" onChange={uploadImage} /><span className="admin-upload-hint">PNG, JPG ou WEBP · até 50 MB</span></div>{uploadingImage && <div className="admin-upload-status" role="status"><span className="admin-upload-spinner" /> Upload em andamento. Não feche esta página.</div>}{form.imageUrl && <div className="admin-image-preview"><img src={form.imageUrl} alt="Prévia do projeto" /><button type="button" className="admin-icon-button" onClick={() => updateField("imageUrl", "")} aria-label="Remover imagem"><X size={15} /></button></div>}<input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} placeholder="ou cole uma URL pública do Supabase Storage" /><small>Imagens de até 50 MB são enviadas ao bucket portfolio-images. Ao substituir ou eliminar um projeto, a imagem anterior também é removida do Storage.</small></div><label>Estilo<select value={form.accent} onChange={(event) => updateField("accent", event.target.value as "yellow" | "dark")}><option value="yellow">Amarelo</option><option value="dark">Escuro</option></select></label><label>Ordem<input type="number" min="0" value={form.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} /></label></div><div className="admin-details"><span className="admin-subtitle">detalhes para o modal</span><label>O desafio<textarea rows={2} value={form.challenge} onChange={(event) => updateField("challenge", event.target.value)} placeholder="Qual problema precisava ser resolvido?" /></label><label>A solução<textarea rows={2} value={form.solution} onChange={(event) => updateField("solution", event.target.value)} placeholder="O que você desenvolveu?" /></label><label>O resultado<textarea rows={2} value={form.result} onChange={(event) => updateField("result", event.target.value)} placeholder="Qual benefício foi gerado?" /></label><label>Benefícios <small>(um por linha)</small><textarea rows={3} value={form.benefits} onChange={(event) => updateField("benefits", event.target.value)} placeholder={"Experiência simples\nVisual profissional\nMais organização"} /></label></div><div className="admin-form-actions"><label className="admin-switch"><input type="checkbox" checked={form.published} onChange={(event) => updateField("published", event.target.checked)} /><span>{form.published ? <><Eye size={14} /> Publicado</> : <><EyeOff size={14} /> Rascunho</>}</span></label><button className="admin-primary" disabled={busy}>{busy ? "Salvando..." : <><Save size={15} /> {form.id ? "Salvar alterações" : "Salvar projeto"}</>}</button></div></form><section className="admin-list"><div className="admin-list-head"><span>conteúdo salvo no Supabase</span><button className="admin-new" onClick={() => setForm(emptyForm)}><Plus size={15} /> novo projeto</button></div>{projectsQuery.isLoading && <div className="admin-empty">Lendo o Supabase...</div>}{projectsQuery.error && <div className="admin-empty">Não foi possível ler os projetos agora.</div>}{!projectsQuery.isLoading && !projectsQuery.error && !projectsQuery.data?.length && <div className="admin-empty">Ainda não há projetos salvos. Use o formulário para criar o primeiro.</div>}{projectsQuery.data?.map((project) => <article className={`admin-project-row ${project.accent}`} key={project.id}>{project.imageUrl ? <img className="admin-project-thumb" src={project.imageUrl} alt="" /> : <div className="admin-project-number">{project.number}</div>}<div className="admin-project-main"><span>{project.label}</span><h2>{project.title}</h2><small>{project.published ? "Publicado na página pública" : "Rascunho privado"}</small></div><div className="admin-row-actions"><button onClick={() => setForm(formFromProject(project))} aria-label={`Editar ${project.title}`}><Pencil size={15} /></button><button onClick={() => { if (window.confirm("Excluir este projeto e sua imagem do Storage?")) removeProject.mutate({ id: project.id }); }} aria-label={`Excluir ${project.title}`}><Trash2 size={15} /></button></div></article>)}</section></div></main>;
}
