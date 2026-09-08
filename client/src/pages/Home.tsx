import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Blocks,
  Camera,
  Check,
  Code2,
  ExternalLink,
  LayoutPanelTop,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Palette,
  PenTool,
  Smartphone,
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

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const contents = [
  { icon: Palette, label: "Sites", text: "presença digital" },
  { icon: Workflow, label: "Sistemas", text: "rotina organizada" },
  { icon: Smartphone, label: "Aplicativos", text: "ideias em movimento" },
  { icon: Code2, label: "Processo", text: "do rascunho à entrega" },
];

const projects = [
  { title: "Sites que conectam", tag: "01 / presença digital", image: assets.sites, copy: "Interfaces que apresentam sua marca com clareza e transformam visitas em conversas." },
  { title: "Sistemas sob medida", tag: "02 / operação organizada", image: assets.systems, copy: "Ferramentas pensadas para reduzir tarefas manuais e deixar a rotina mais leve." },
  { title: "Aplicativos reais", tag: "03 / ideias em movimento", image: assets.apps, copy: "Experiências mobile construídas para aproximar pessoas, serviços e oportunidades." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const goTo = (id: string) => { setMenuOpen(false); scrollToSection(id); };

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(
      ".about-section, .contents-section, .projects-editorial, .process-editorial, .editorial-contact, .trust-strip > div, .content-card, .project-editorial-card, .process-steps > div"
    ));

    elements.forEach((element, index) => {
      element.classList.add("zoom-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          element.classList.add("zoom-visible");
        } else if (entry.boundingClientRect.top > 0) {
          element.classList.remove("zoom-visible");
        }
      });
    }, { threshold: 0.14, rootMargin: "-8% 0px -8% 0px" });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="portfolio-page">
      <div className="paper-mark mark-top">L<span>•</span></div>
      <div className="paper-mark mark-bottom">2026</div>

      <header className="editorial-nav">
        <a className="editorial-logo" href="#inicio">LU<span>CAS</span><small>/DEV</small></a>
        <div className="nav-rule" />
        <nav className={menuOpen ? "nav-open" : ""}>
          <button onClick={() => goTo("sobre")}>Sobre</button>
          <button onClick={() => goTo("conteudo")}>Conteúdo</button>
          <button onClick={() => goTo("projetos")}>Projetos</button>
          <button onClick={() => goTo("contato")}>Contato</button>
        </nav>
        <a className="mini-contact" href={whatsapp} target="_blank" rel="noreferrer">Vamos conversar <ArrowUpRight size={14} /></a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <section className="editorial-hero" id="inicio">
        <div className="hero-topline"><span>Portfólio pessoal</span><span>Web / App / Design</span><span className="year-vertical">Lucas Henrique Gomes de Souza</span></div>
        <div className="hero-layout">
          <div className="hero-title-block">
            <div className="sticker">Web &amp; App<br />Developer</div>
            <h1>IDEIAS<br /><span>CLARAS</span><b>.</b></h1>
            <div className="hero-under-title"><span>sites, sistemas<br />e aplicativos</span><ArrowDownRight size={28} /></div>
            <p className="hero-promise">Tecnologia bonita, simples e pensada para fazer seu negócio avançar.</p>
          </div>
          <div className="hero-person-wrap">
            <div className="yellow-block hero-yellow" />
            <div className="portrait-circle"><img src={assets.portrait} alt="Lucas, desenvolvedor web" /></div>
            <div className="hero-caption">Soluções digitais<br />pensadas para pessoas reais.</div>
            <div className="hero-outline" />
          </div>
        </div>
        <div className="hero-bottom"><a className="scroll-pill" href="#sobre"><span>↓</span> conhecer o trabalho</a><span className="signature">L.</span></div>
      </section>

      <section className="trust-strip" aria-label="Benefícios de trabalhar com Lucas">
        <div><span>01</span><strong>Clareza no processo</strong><p>Você sabe o que está sendo criado e por quê.</p></div>
        <div><span>02</span><strong>Solução sob medida</strong><p>Nada de modelos prontos que não combinam com sua rotina.</p></div>
        <div><span>03</span><strong>Foco no resultado</strong><p>O projeto precisa ser bonito, útil e ajudar seu negócio.</p></div>
      </section>

      <section className="about-section" id="sobre">
        <div className="section-line-label"><span>Sobre</span><div /><span>01</span></div>
        <div className="about-layout">
          <div className="about-portrait"><div className="yellow-block" /><img src={assets.portrait} alt="Retrato de Lucas" /><div className="portrait-label">Lucas / Desenvolvedor</div></div>
          <div className="about-copy"><div className="hello-mark">“</div><h2>Olá<span>.</span></h2><p className="lead">Eu sou o Lucas. Ajudo empresas e empreendedores a transformar ideias em sites, sistemas e aplicativos que geram mais confiança, organização e oportunidades.</p><p>Você não precisa entender de tecnologia para tirar um projeto do papel. Eu traduzo sua necessidade, organizo o caminho e construo uma solução que faça sentido para o seu negócio.</p><a className="yellow-link" href={whatsapp} target="_blank" rel="noreferrer">Vamos trabalhar juntos <ArrowUpRight size={16} /></a></div>
          <div className="about-details"><div><h3>Foco</h3><p>Experiências simples<br />e funcionais.</p></div><div><h3>Atuação</h3><p>Sites, sistemas<br />e aplicativos.</p></div><div><h3>Base</h3><p>Minas Gerais<br />&amp; projetos remotos.</p></div></div>
        </div>
      </section>

      <section className="contents-section" id="conteudo">
        <div className="section-line-label"><span>Índice</span><div /><span>02</span></div>
        <div className="contents-heading"><span className="quote-dot">“</span><h2>O QUE EU<br /><span>CONSTRUO</span><b>.</b></h2><p>Um pouco do que existe por trás de cada entrega.</p></div>
        <div className="content-cards">{contents.map((item, index) => { const Icon = item.icon; return <button className="content-card" key={item.label} onClick={() => index === 3 ? goTo("processo") : goTo("projetos")}><div className="card-icon"><Icon size={37} strokeWidth={1.65} /></div><strong>{item.label}</strong><span>{item.text}</span><ArrowUpRight className="card-arrow" size={18} /></button>; })}</div>
      </section>

      <section className="projects-editorial" id="projetos">
        <div className="section-line-label"><span>Projetos</span><div /><span>03</span></div>
        <div className="projects-editorial-title"><span className="mini-label">soluções para negócios</span><h2>FEITO<br /><span>PARA FUNCIONAR</span><b>.</b></h2><p>Projetos que unem boa apresentação, experiência simples e uma finalidade clara: ajudar você a avançar.</p></div>
        <div className="project-editorial-grid">{projects.map((project) => <article className="project-editorial-card" key={project.title}><div className="project-art"><img src={project.image} alt={project.title} /><span>{project.tag}</span><a href={whatsapp} target="_blank" rel="noreferrer"><ArrowUpRight size={20} /></a></div><h3>{project.title}</h3><p>{project.copy}</p></article>)}</div>
      </section>

      <section className="process-editorial" id="processo">
        <div className="section-line-label"><span>Processo</span><div /><span>04</span></div>
        <div className="process-editorial-grid"><div><span className="mini-label">por trás da tela</span><h2>DO CAFÉ<br />AO <span>CÓDIGO</span><b>.</b></h2><p>Uma rotina real, feita de escuta, planejamento, criação e testes.</p></div><div className="process-images"><img src={assets.development} alt="Lucas desenvolvendo um projeto" /><img src={assets.planning} alt="Lucas planejando um projeto" /><img src={assets.delivery} alt="Lucas testando um projeto" /></div></div>
        <div className="process-steps"><div><b>01</b><h3>Entender</h3><p>O problema vem antes da solução.</p></div><div><b>02</b><h3>Organizar</h3><p>Ideias claras para decisões melhores.</p></div><div><b>03</b><h3>Construir</h3><p>Design e tecnologia lado a lado.</p></div><div><b>04</b><h3>Entregar</h3><p>Testar também faz parte.</p></div></div>
      </section>

      <section className="editorial-contact" id="contato"><div className="contact-stamp"><Sparkles size={19} /> aberto para projetos</div><h2>VAMOS<br /><span>CRIAR?</span></h2><p>Se você tem uma ideia, uma necessidade ou apenas uma pergunta, me chama. A próxima página pode começar aqui.</p><a className="big-yellow-button" href={whatsapp} target="_blank" rel="noreferrer">Falar pelo WhatsApp <ArrowUpRight size={20} /></a></section>

      <footer className="editorial-footer"><div className="footer-logo">L<span>UCAS</span><small>/DEV</small></div><div className="footer-links"><a href="https://instagram.com/luccas.hgs" target="_blank" rel="noreferrer"><MessageCircle size={15} /> Instagram</a><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a></div><div className="footer-copy">© 2026 Lucas<br />feito com intenção.</div></footer>
    </main>
  );
}
