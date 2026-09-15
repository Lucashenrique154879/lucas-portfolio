import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".nf-hero, .nf-code, .nf-message, .nf-actions, .nf-footer-strip"
      )
    );
    elements.forEach((element, index) => {
      element.classList.add("zoom-reveal");
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index, 3) * 110}ms`
      );
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            element.classList.add("zoom-visible");
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="projects-page">
      <div className="projects-page-bg" aria-hidden="true" />
      <div className="paper-mark mark-top">
        L<span>•</span>
      </div>
      <div className="paper-mark mark-bottom">404</div>

      <header className="projects-page-nav">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> voltar ao início
        </Link>
        <span className="page-mark">LUCAS / PÁGINA NÃO ENCONTRADA</span>
        <a
          href="https://wa.me/5533998542100"
          target="_blank"
          rel="noreferrer"
          className="page-contact"
        >
          Vamos conversar <ArrowUpRight size={14} />
        </a>
      </header>

      <section
        className="projects-page-hero"
        style={{ paddingBottom: 55, paddingTop: 95 }}
      >
        <div className="page-kicker nf-hero">Erro · página perdida</div>
        <div className="projects-hero-grid" style={{ marginTop: 46 }}>
          <div>
            <h1 className="nf-code">
              ESSA
              <br />
              <span>PÁGINA</span>
              <br />
              NÃO EXISTE<b>.</b>
            </h1>
          </div>
          <div className="projects-hero-copy nf-message">
            <p>
              O endereço que você tentou acessar saiu do ar, foi movido ou
              nunca existiu mesmo. A próxima página certa pode ser a inicial
              — ou a lista completa de projetos.
            </p>
            <Link href="/" className="page-scroll">
              voltar para o início <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div
          className="project-count nf-actions"
          style={{ marginTop: 78, gap: 22, alignItems: "center" }}
        >
          <strong style={{ fontSize: 52, lineHeight: 0.9 }}>404</strong>
          <span>
            você chegou aqui<br />por um link quebrado
          </span>
          <Link
            href="/projetos"
            className="detail-cta"
            style={{ marginTop: 0 }}
          >
            Ver projetos <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <section className="projects-list nf-footer-strip">
        <article
          className="project-detail dark"
          style={{ minHeight: 0, padding: "68px 0 72px" }}
        >
          <div className="detail-number">00</div>
          <div className="detail-image-button" style={{ display: "contents" }}>
            <div className="detail-image empty-project-image">
              <div className="image-placeholder">
                <Home size={32} />
                <strong>Começar de novo</strong>
                <span>Tudo certo do lado de lá</span>
              </div>
              <div className="detail-icon">
                <Home size={22} />
              </div>
            </div>
          </div>
          <div className="detail-copy">
            <span className="detail-label">página inicial</span>
            <h2>O portfólio continua aqui.</h2>
            <p>
              Volte para a página inicial, navegue pelos serviços ou abra a
              lista completa de projetos. Se chegou aqui por um link interno,
              pode avisar que eu já arrumo.
            </p>
            <div className="benefit-list">
              <div>
                <ArrowUpRight size={14} /> sites, sistemas e aplicativos
              </div>
              <div>
                <ArrowUpRight size={14} /> processo claro e personalizado
              </div>
              <div>
                <ArrowUpRight size={14} /> próximo projeto pode ser o seu
              </div>
            </div>
            <Link href="/" className="detail-cta detail-open">
              Ir para o início <ArrowUpRight size={16} />
            </Link>
          </div>
        </article>
      </section>

      <footer className="projects-page-footer">
        <Link href="/">Lucas /dev</Link>
        <span>
          Esta página não foi encontrada, mas todo o resto continua no ar.
        </span>
        <Link href="/projetos">
          Ver projetos <ArrowUpRight size={12} />
        </Link>
      </footer>
    </main>
  );
}
