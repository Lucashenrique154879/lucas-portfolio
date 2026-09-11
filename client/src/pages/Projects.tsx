import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, Check, Code2, ExternalLink, LayoutPanelTop, MessageCircle, Smartphone, Workflow, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const whatsapp = "https://wa.me/5533998542100";

type Project = {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  image: string;
  icon: typeof Code2;
  accent: "yellow" | "dark";
  benefits: string[];
  challenge?: string | null;
  solution?: string | null;
  result?: string | null;
  links?: { label: string; url: string }[];
};

const projectList: Project[] = [
  { id: "site-01", number: "01", label: "Site profissional", title: "Nome do site aqui.", description: "Adicione um resumo curto: para quem foi feito, qual era o objetivo e qual solução você criou.", image: "", icon: Code2, accent: "yellow", benefits: ["Desafio do projeto", "Solução desenvolvida", "Resultado para o cliente"] },
  { id: "landing-01", number: "02", label: "Landing page", title: "Nome da landing page aqui.", description: "Apresente a campanha, produto ou serviço e explique como a página foi pensada para gerar ação.", image: "", icon: LayoutPanelTop, accent: "dark", benefits: ["Objetivo da campanha", "Estrutura da página", "Ação esperada do visitante"] },
  { id: "site-02", number: "03", label: "Site institucional", title: "Nome do projeto aqui.", description: "Conte como o site ajudou a empresa a apresentar seus serviços, sua história e seus diferenciais.", image: "", icon: Code2, accent: "yellow", benefits: ["Necessidade do negócio", "Páginas e recursos", "Benefício gerado"] },
  { id: "system-01", number: "04", label: "Sistema personalizado", title: "Nome do sistema aqui.", description: "Adicione o contexto do sistema: qual problema existia, o que foi construído e como a solução melhorou a rotina.", image: "", icon: Workflow, accent: "dark", benefits: ["Problema que precisava resolver", "Funcionalidades principais", "Benefício gerado"] },
  { id: "app-01", number: "05", label: "Aplicativo mobile", title: "Nome do aplicativo aqui.", description: "Conte a história do aplicativo: a ideia inicial, o público e a experiência criada para os usuários.", image: "", icon: Smartphone, accent: "yellow", benefits: ["Público do aplicativo", "Recursos mais importantes", "Impacto da solução"] },
  { id: "app-02", number: "06", label: "Aplicativo sob medida", title: "Nome do app aqui.", description: "Use este espaço para explicar a jornada do usuário e como o aplicativo tornou uma tarefa mais simples.", image: "", icon: Smartphone, accent: "dark", benefits: ["Experiência do usuário", "Fluxo principal", "Resultado alcançado"] },
];

function ProjectImage({ project, compact = false }: { project: Project; compact?: boolean }) {
  const Icon = project.icon;
  return <div className={`detail-image ${project.image ? "has-image" : "empty-project-image"} ${compact ? "compact-image" : ""}`}>{project.image ? <img src={project.image} alt={project.label} /> : <div className="image-placeholder"><Icon size={30} /><strong>Imagem do projeto</strong><span>Adicione seus prints ou fotos aqui</span></div>}<div className="detail-icon"><Icon size={22} /></div></div>;
}

function iconForProject(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("aplicativo") || normalized.includes("app")) return Smartphone;
  if (normalized.includes("landing")) return LayoutPanelTop;
  if (normalized.includes("sistema")) return Workflow;
  return Code2;
}

function linksForProject(slug: string) {
  if (slug !== "zalu-aplicativo-gestao-salao") return [];
  return [
    { label: "Acessar Zalu", url: "https://zalusalao.online" },
    { label: "Abrir versão alternativa", url: "https://zalusalao.site" },
  ];
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { data: persistedProjects } = trpc.projects.list.useQuery();
  const projects = persistedProjects?.length ? persistedProjects.map((project) => ({ ...project, id: String(project.id), image: project.imageUrl ?? "", icon: iconForProject(project.label), links: linksForProject(project.slug), benefits: project.benefits, accent: project.accent as "yellow" | "dark" })) : projectList;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedProject(null); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [selectedProject]);

  return (
    <main className="projects-page">
      <div className="projects-page-bg" aria-hidden="true" />
      <header className="projects-page-nav"><Link href="/" className="back-link"><ArrowLeft size={16} /> voltar ao portfólio</Link><span className="page-mark">LUCAS / PROJETOS</span><a href={whatsapp} target="_blank" rel="noreferrer" className="page-contact">Vamos conversar <ArrowUpRight size={14} /></a></header>

      <section className="projects-page-hero"><div className="page-kicker">Portfólio / seleção de soluções</div><div className="projects-hero-grid"><h1>PROJETOS<br /><span>QUE GERAM</span><br />MOVIMENTO<b>.</b></h1><div className="projects-hero-copy"><p>Sites, landing pages, sistemas e aplicativos. Cada projeto tem seu espaço, sua história e seu próximo passo.</p><a href="#projetos-lista" className="page-scroll">explorar projetos <ArrowUpRight size={16} /></a></div></div><div className="project-count"><strong>{String(projects.length).padStart(2, "0")}</strong><span>{persistedProjects?.length ? "projetos" : "espaços"}<br />{persistedProjects?.length ? "publicados" : "para projetos"}</span></div></section>

      <section className="projects-list" id="projetos-lista">
        {projects.map((project) => { const Icon = project.icon; return <article className={`project-detail ${project.accent}`} id={project.id} key={project.id}><div className="detail-number">{project.number}</div><button className="detail-image-button" onClick={() => setSelectedProject(project)} aria-label={`Abrir detalhes de ${project.label}`}><ProjectImage project={project} /></button><div className="detail-copy"><span className="detail-label">{project.label}</span><h2>{project.title}</h2><p>{project.description}</p><div className="detail-sections"><div><strong>O desafio</strong><span>{project.challenge || "Conte aqui qual necessidade ou problema existia."}</span></div><div><strong>A solução</strong><span>{project.solution || "Explique o que você criou para resolver o desafio."}</span></div><div><strong>O resultado</strong><span>{project.result || "Descreva o benefício ou a transformação gerada."}</span></div></div><div className="benefit-list">{project.benefits.map((benefit) => <div key={benefit}><Check size={14} />{benefit}</div>)}</div>{project.links?.length ? <div className="project-live-links">{project.links.map((link) => <a key={link.url} className="project-live-link" href={link.url} target="_blank" rel="noreferrer">{link.label}<ExternalLink size={13} /></a>)}</div> : null}<button className="detail-cta detail-open" onClick={() => setSelectedProject(project)}>Abrir detalhes <ArrowUpRight size={16} /></button></div></article>; })}
      </section>

      <section className="projects-page-process"><div className="page-kicker">Como acontece</div><div className="process-page-grid"><h2>UMA IDEIA.<br /><span>UM CAMINHO.</span></h2><div><p>Você chega com uma necessidade. Eu ajudo a transformar isso em uma solução clara, bonita e possível.</p><div className="process-mini-list"><span><b>01</b> conversa</span><span><b>02</b> planejamento</span><span><b>03</b> construção</span><span><b>04</b> entrega</span></div></div></div></section>
      <section className="projects-page-contact"><div className="contact-mark"><MessageCircle size={18} /> próximo projeto</div><h2>O PRÓXIMO<br /><span>PODE SER O SEU.</span></h2><p>Me conte o que você precisa e vamos descobrir juntos o melhor caminho.</p><a className="page-big-cta" href={whatsapp} target="_blank" rel="noreferrer">Começar uma conversa <ArrowUpRight size={19} /></a></section>
      <footer className="projects-page-footer"><Link href="/">Lucas /dev</Link><span>Sites, landing pages, sistemas e aplicativos feitos para pessoas reais.</span><a href="https://instagram.com/luccas.hgs" target="_blank" rel="noreferrer">Instagram <ExternalLink size={12} /></a></footer>

      {selectedProject && <div className="project-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProject(null); }}><section className={`project-modal ${selectedProject.accent}`} role="dialog" aria-modal="true" aria-labelledby="project-modal-title"><button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Fechar detalhes"><X size={20} /></button><div className="modal-number">{selectedProject.number} / detalhes do projeto</div><div className="modal-grid"><ProjectImage project={selectedProject} compact /><div className="modal-content"><span className="detail-label">{selectedProject.label}</span><h2 id="project-modal-title">{selectedProject.title}</h2><p>{selectedProject.description}</p><div className="modal-info"><div><strong>O desafio</strong><span>{selectedProject.challenge || "Adicione aqui o problema ou necessidade que deu origem ao projeto."}</span></div><div><strong>A solução</strong><span>{selectedProject.solution || "Explique como você pensou e desenvolveu esta solução."}</span></div><div><strong>O resultado</strong><span>{selectedProject.result || "Descreva o impacto, benefício ou aprendizado do trabalho."}</span></div></div>{selectedProject.links?.length ? <div className="project-live-links">{selectedProject.links.map((link) => <a key={link.url} className="project-live-link" href={link.url} target="_blank" rel="noreferrer">{link.label}<ExternalLink size={13} /></a>)}</div> : null}<a className="detail-cta" href={`${whatsapp}?text=Olá%20Lucas!%20Quero%20conversar%20sobre%20${encodeURIComponent(selectedProject.label)}`} target="_blank" rel="noreferrer">Conversar sobre este projeto <ArrowUpRight size={16} /></a></div></div></section></div>}
    </main>
  );
}
