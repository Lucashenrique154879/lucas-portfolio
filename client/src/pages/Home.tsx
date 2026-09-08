import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  ExternalLink,
  Instagram,
  LayoutPanelTop,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const assets = {
  portrait: "/manus-storage/Rostoumpoucomaisvis_vel_18019ad1.webp",
  sites: "/manus-storage/instagram_post_01_sites_6a74c4c2.png",
  systems: "/manus-storage/instagram_post_02_sistemas_4b42bf39.png",
  apps: "/manus-storage/instagram_post_03_aplicativos_6e251183.png",
  development: "/manus-storage/instagram_rotina_01_desenvolvimento_51809ba1.png",
  planning: "/manus-storage/instagram_rotina_02_planejamento_a0616b7a.png",
  delivery: "/manus-storage/instagram_rotina_03_entrega_fa585bc4.png",
};

const whatsapp = "https://wa.me/5533998542100";

const projects = [
  {
    number: "01",
    title: "Presença digital",
    category: "Sites profissionais",
    description: "Interfaces responsivas que apresentam sua marca com clareza e transformam visitas em conversas.",
    image: assets.sites,
    tone: "blue",
  },
  {
    number: "02",
    title: "Operação organizada",
    category: "Sistemas sob medida",
    description: "Ferramentas pensadas para reduzir tarefas manuais e deixar a rotina do negócio mais leve.",
    image: assets.systems,
    tone: "green",
  },
  {
    number: "03",
    title: "Ideias em movimento",
    category: "Aplicativos personalizados",
    description: "Experiências mobile que aproximam serviços, clientes e oportunidades em um só lugar.",
    image: assets.apps,
    tone: "gold",
  },
];

const steps = [
  {
    icon: MessageCircle,
    index: "01",
    title: "Eu escuto",
    text: "Entendo o momento do negócio, o público e o problema que precisa ser resolvido.",
  },
  {
    icon: Workflow,
    index: "02",
    title: "Eu organizo",
    text: "Transformo a ideia em um plano claro, com prioridades, estrutura e próximos passos.",
  },
  {
    icon: Code2,
    index: "03",
    title: "Eu construo",
    text: "Desenvolvo a solução com atenção à experiência, aos detalhes e ao uso no dia a dia.",
  },
  {
    icon: Check,
    index: "04",
    title: "Eu entrego",
    text: "Testo, ajusto e acompanho a entrega para que tudo funcione de verdade.",
  },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className={`topbar ${menuOpen ? "topbar-open" : ""}`}>
        <a className="brand" href="#inicio" onClick={() => setMenuOpen(false)} aria-label="Lucas, voltar ao início">
          <span className="brand-mark">L<span>.</span></span>
          <span className="brand-word">lucas<span>/dev</span></span>
        </a>

        <nav className={`desktop-nav ${menuOpen ? "mobile-nav-visible" : ""}`} aria-label="Navegação principal">
          <button onClick={() => goTo("projetos")}>Projetos</button>
          <button onClick={() => goTo("processo")}>Processo</button>
          <button onClick={() => goTo("sobre")}>Sobre mim</button>
          <button onClick={() => goTo("contato")}>Contato</button>
        </nav>

        <a className="nav-cta" href={whatsapp} target="_blank" rel="noreferrer">
          Vamos conversar <ArrowUpRight size={15} />
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <section className="hero section-pad" id="inicio">
        <div className="hero-copy reveal-up">
          <div className="eyebrow"><span className="eyebrow-dot" /> Web &amp; App Developer <span className="eyebrow-line" /> Lucas</div>
          <h1>Ideias claras.<br /><em>Soluções</em> que<br />movem negócios.</h1>
          <p className="hero-text">Eu transformo necessidades reais em sites, sistemas e aplicativos que fazem sentido para pessoas e negócios.</p>
          <div className="hero-actions">
            <a className="button button-primary" href={whatsapp} target="_blank" rel="noreferrer">Começar um projeto <ArrowUpRight size={17} /></a>
            <button className="button button-quiet" onClick={() => scrollToSection("projetos")}>Ver projetos <ArrowDownRight size={17} /></button>
          </div>
          <div className="hero-proof"><span className="proof-avatars"><span>LH</span><span>+</span></span><span>Projetos pensados<br />para a vida real.</span></div>
        </div>

        <div className="hero-visual reveal-up delay-one">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="portrait-frame"><img src={assets.portrait} alt="Lucas, desenvolvedor web e de aplicativos" /></div>
          <div className="floating-card card-status"><span className="status-pulse" /> disponível para novos projetos <ArrowUpRight size={13} /></div>
          <div className="floating-card card-code"><span className="code-symbol">&lt;/&gt;</span><span><b>criando</b><br />com propósito</span></div>
          <div className="hero-number">01<span>/04</span></div>
        </div>
        <button className="scroll-cue" onClick={() => scrollToSection("projetos")} aria-label="Rolar para projetos"><span>scroll para explorar</span><ChevronDown size={18} /></button>
      </section>

      <section className="intro-strip section-pad" id="sobre">
        <div className="section-kicker">01 / sobre o trabalho</div>
        <div className="intro-grid">
          <h2>Mais do que<br /><span>código.</span></h2>
          <div className="intro-body"><p>Eu acredito que tecnologia boa é aquela que simplifica. Por isso, cada projeto começa com uma conversa e termina com uma solução que você consegue usar, entender e sentir como sua.</p><p className="muted-copy">Do primeiro rascunho ao último teste, você acompanha o processo de perto. Sem complicação. Sem promessas vazias.</p><a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">Conhecer meu jeito de trabalhar <ArrowUpRight size={16} /></a></div>
        </div>
      </section>

      <section className="projects-section section-pad" id="projetos">
        <div className="section-heading"><div><div className="section-kicker">02 / trabalhos selecionados</div><h2>O que eu <span>construo.</span></h2></div><p>Algumas das formas de transformar uma ideia em presença digital, organização e novas possibilidades.</p></div>
        <div className="projects-grid">{projects.map((project) => <article className={`project-card ${project.tone}`} key={project.number}><div className="project-image-wrap"><img src={project.image} alt={project.category} /><div className="project-index">{project.number}</div><a href={whatsapp} target="_blank" rel="noreferrer" className="project-link" aria-label={`Conversar sobre ${project.category}`}><ArrowUpRight size={19} /></a></div><div className="project-meta"><div><span className="project-category">{project.category}</span><h3>{project.title}</h3></div><p>{project.description}</p></div></article>)}</div>
      </section>

      <section className="process-section section-pad" id="processo">
        <div className="process-header"><div className="section-kicker">03 / por trás da tela</div><h2>Meu trabalho<br /><span>é humano.</span></h2><p>O processo importa tanto quanto o resultado. É assim que uma boa ideia deixa de ser só uma ideia.</p></div>
        <div className="steps-grid">{steps.map((step) => { const Icon = step.icon; return <div className="step" key={step.index}><div className="step-top"><span>{step.index}</span><Icon size={20} strokeWidth={1.5} /></div><h3>{step.title}</h3><p>{step.text}</p></div>; })}</div>
        <div className="routine-gallery"><div className="routine-intro"><Sparkles size={20} /><span>um pouco da rotina</span><p>Entre uma reunião, um café e alguns testes, é aqui que as soluções ganham vida.</p></div><div className="routine-image routine-tall"><img src={assets.development} alt="Lucas trabalhando no desenvolvimento de um projeto" /></div><div className="routine-image"><img src={assets.planning} alt="Planejamento de um projeto com cliente" /></div><div className="routine-image"><img src={assets.delivery} alt="Testes de um site em diferentes dispositivos" /></div></div>
      </section>

      <section className="services-section section-pad"><div className="services-heading"><div className="section-kicker">04 / como posso ajudar</div><h2>Seu próximo<br /><span>passo digital.</span></h2></div><div className="service-list"><div className="service-row"><span>01</span><div><h3>Sites profissionais</h3><p>Uma presença digital que apresenta seu negócio e abre portas.</p></div><LayoutPanelTop size={23} /></div><div className="service-row"><span>02</span><div><h3>Sistemas personalizados</h3><p>Processos mais organizados, pensados para a sua operação.</p></div><Workflow size={23} /></div><div className="service-row"><span>03</span><div><h3>Aplicativos sob medida</h3><p>Experiências móveis construídas para aproximar pessoas e serviços.</p></div><MonitorSmartphone size={23} /></div></div></section>

      <section className="contact-section section-pad" id="contato"><div className="contact-grid"><div><div className="section-kicker">05 / vamos conversar</div><h2>Tem uma ideia<br />na cabeça?</h2><p>Me conta. A gente organiza juntos o primeiro passo para tirar ela do papel.</p></div><div className="contact-action"><a className="contact-button" href={whatsapp} target="_blank" rel="noreferrer"><span>Falar comigo pelo WhatsApp</span><ArrowUpRight size={25} /></a><span className="contact-note">Resposta direta, sem formulários complicados.</span></div></div></section>

      <footer className="footer section-pad"><a className="brand" href="#inicio"><span className="brand-mark">L<span>.</span></span><span className="brand-word">lucas<span>/dev</span></span></a><div className="footer-center">Sites, sistemas e aplicativos<br /><span>feitos para pessoas reais.</span></div><div className="footer-right"><a href="https://instagram.com/luccas.hgs" target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram</a><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a></div><div className="footer-bottom"><span>© 2026 Lucas. Todos os direitos reservados.</span><span>Construído com intenção.</span></div></footer>
    </main>
  );
}
