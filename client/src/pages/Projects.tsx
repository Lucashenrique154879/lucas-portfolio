import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, Check, Code2, ExternalLink, MessageCircle, Smartphone, Workflow } from "lucide-react";

const whatsapp = "https://wa.me/5533998542100";
const assets = {
  sites: "/manus-storage/instagram_post_01_sites_6a74c4c2.png",
  systems: "/manus-storage/instagram_post_02_sistemas_4b42bf39.png",
  apps: "/manus-storage/instagram_post_03_aplicativos_6e251183.png",
};

const projectList = [
  {
    id: "sites",
    number: "01",
    label: "Projeto de site",
    title: "Nome do projeto aqui.",
    description: "Adicione aqui um resumo curto do projeto: para quem foi feito, qual era o objetivo e qual solução você criou.",
    image: "",
    icon: Code2,
    accent: "yellow",
    benefits: ["Desafio do projeto", "Solução desenvolvida", "Resultado para o cliente"],
  },
  {
    id: "sistemas",
    number: "02",
    label: "Projeto de sistema",
    title: "Nome do projeto aqui.",
    description: "Adicione aqui o contexto do sistema: qual problema existia, o que foi construído e como a solução melhorou a rotina.",
    image: "",
    icon: Workflow,
    accent: "dark",
    benefits: ["Problema que precisava resolver", "Funcionalidades principais", "Benefício gerado"],
  },
  {
    id: "aplicativos",
    number: "03",
    label: "Projeto de aplicativo",
    title: "Nome do projeto aqui.",
    description: "Adicione aqui a história do aplicativo: a ideia inicial, o público e a experiência que você criou para os usuários.",
    image: "",
    icon: Smartphone,
    accent: "yellow",
    benefits: ["Público do aplicativo", "Recursos mais importantes", "Impacto da solução"],
  },
];

export default function Projects() {
  return (
    <main className="projects-page">
      <div className="projects-page-bg" aria-hidden="true" />
      <header className="projects-page-nav">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> voltar ao portfólio</Link>
        <span className="page-mark">LUCAS / PROJETOS</span>
        <a href={whatsapp} target="_blank" rel="noreferrer" className="page-contact">Vamos conversar <ArrowUpRight size={14} /></a>
      </header>

      <section className="projects-page-hero">
        <div className="page-kicker">Portfólio / seleção de soluções</div>
        <div className="projects-hero-grid">
          <h1>PROJETOS<br /><span>QUE GERAM</span><br />MOVIMENTO<b>.</b></h1>
          <div className="projects-hero-copy"><p>Não apresento apenas telas. Apresento o raciocínio, o cuidado e o propósito por trás de cada solução.</p><a href="#projetos-lista" className="page-scroll">explorar projetos <ArrowUpRight size={16} /></a></div>
        </div>
        <div className="project-count"><strong>03</strong><span>soluções<br />em destaque</span></div>
      </section>

      <section className="projects-list" id="projetos-lista">
        {projectList.map((project, index) => { const Icon = project.icon; return (
          <article className={`project-detail ${project.accent}`} id={project.id} key={project.id}>
            <div className="detail-number">{project.number}</div>
            <div className={`detail-image ${project.image ? "has-image" : "empty-project-image"}`}>{project.image ? <img src={project.image} alt={project.label} /> : <div className="image-placeholder"><Icon size={30} /><strong>Imagem do projeto</strong><span>Adicione seus prints ou fotos aqui</span></div>}<div className="detail-icon"><Icon size={22} /></div></div>
            <div className="detail-copy"><span className="detail-label">{project.label}</span><h2>{project.title}</h2><p>{project.description}</p><div className="detail-sections"><div><strong>O desafio</strong><span>Conte aqui qual necessidade ou problema existia.</span></div><div><strong>A solução</strong><span>Explique o que você criou para resolver o desafio.</span></div><div><strong>O resultado</strong><span>Descreva o benefício ou a transformação gerada.</span></div></div><div className="benefit-list">{project.benefits.map((benefit) => <div key={benefit}><Check size={14} />{benefit}</div>)}</div><a className="detail-cta" href={`${whatsapp}?text=Olá%20Lucas!%20Quero%20conversar%20sobre%20${encodeURIComponent(project.label)}`} target="_blank" rel="noreferrer">Falar sobre este projeto <ArrowUpRight size={16} /></a></div>
          </article>
        ); })}
      </section>

      <section className="projects-page-process"><div className="page-kicker">Como acontece</div><div className="process-page-grid"><h2>UMA IDEIA.<br /><span>UM CAMINHO.</span></h2><div><p>Você chega com uma necessidade. Eu ajudo a transformar isso em uma solução clara, bonita e possível.</p><div className="process-mini-list"><span><b>01</b> conversa</span><span><b>02</b> planejamento</span><span><b>03</b> construção</span><span><b>04</b> entrega</span></div></div></div></section>

      <section className="projects-page-contact"><div className="contact-mark"><MessageCircle size={18} /> próximo projeto</div><h2>O PRÓXIMO<br /><span>PODE SER O SEU.</span></h2><p>Me conte o que você precisa e vamos descobrir juntos o melhor caminho.</p><a className="page-big-cta" href={whatsapp} target="_blank" rel="noreferrer">Começar uma conversa <ArrowUpRight size={19} /></a></section>
      <footer className="projects-page-footer"><Link href="/">Lucas /dev</Link><span>Sites, sistemas e aplicativos feitos para pessoas reais.</span><a href="https://instagram.com/luccas.hgs" target="_blank" rel="noreferrer">Instagram <ExternalLink size={12} /></a></footer>
    </main>
  );
}
