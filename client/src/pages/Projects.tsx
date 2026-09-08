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
    label: "Sites profissionais",
    title: "Sua marca merece ser encontrada.",
    description: "Sites responsivos, claros e pensados para transformar presença digital em confiança. A primeira impressão do seu negócio começa na tela.",
    image: assets.sites,
    icon: Code2,
    accent: "yellow",
    benefits: ["Visual profissional e autoral", "Experiência perfeita no celular", "Estrutura pensada para gerar contato"],
  },
  {
    id: "sistemas",
    number: "02",
    label: "Sistemas personalizados",
    title: "Menos confusão. Mais controle.",
    description: "Sistemas feitos para a rotina real da sua empresa: organizam informações, reduzem tarefas repetitivas e ajudam você a tomar decisões melhores.",
    image: assets.systems,
    icon: Workflow,
    accent: "dark",
    benefits: ["Processos mais organizados", "Funcionalidades para a sua operação", "Informações em um só lugar"],
  },
  {
    id: "aplicativos",
    number: "03",
    label: "Aplicativos sob medida",
    title: "Uma ideia pode virar experiência.",
    description: "Aplicativos construídos para aproximar pessoas, serviços e oportunidades de um jeito simples, útil e fácil de usar.",
    image: assets.apps,
    icon: Smartphone,
    accent: "yellow",
    benefits: ["Fluxos simples para o usuário", "Interface pensada para mobile", "Produto digital com identidade"],
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
            <div className="detail-image"><img src={project.image} alt={project.label} /><div className="detail-icon"><Icon size={22} /></div></div>
            <div className="detail-copy"><span className="detail-label">{project.label}</span><h2>{project.title}</h2><p>{project.description}</p><div className="benefit-list">{project.benefits.map((benefit) => <div key={benefit}><Check size={14} />{benefit}</div>)}</div><a className="detail-cta" href={`${whatsapp}?text=Olá%20Lucas!%20Quero%20conversar%20sobre%20${encodeURIComponent(project.label)}`} target="_blank" rel="noreferrer">Falar sobre este projeto <ArrowUpRight size={16} /></a></div>
          </article>
        ); })}
      </section>

      <section className="projects-page-process"><div className="page-kicker">Como acontece</div><div className="process-page-grid"><h2>UMA IDEIA.<br /><span>UM CAMINHO.</span></h2><div><p>Você chega com uma necessidade. Eu ajudo a transformar isso em uma solução clara, bonita e possível.</p><div className="process-mini-list"><span><b>01</b> conversa</span><span><b>02</b> planejamento</span><span><b>03</b> construção</span><span><b>04</b> entrega</span></div></div></div></section>

      <section className="projects-page-contact"><div className="contact-mark"><MessageCircle size={18} /> próximo projeto</div><h2>O PRÓXIMO<br /><span>PODE SER O SEU.</span></h2><p>Me conte o que você precisa e vamos descobrir juntos o melhor caminho.</p><a className="page-big-cta" href={whatsapp} target="_blank" rel="noreferrer">Começar uma conversa <ArrowUpRight size={19} /></a></section>
      <footer className="projects-page-footer"><Link href="/">Lucas /dev</Link><span>Sites, sistemas e aplicativos feitos para pessoas reais.</span><a href="https://instagram.com/luccas.hgs" target="_blank" rel="noreferrer">Instagram <ExternalLink size={12} /></a></footer>
    </main>
  );
}
