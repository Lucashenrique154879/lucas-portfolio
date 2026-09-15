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

const storageBase = "https://tkbekfarnsfvfgndlxfb.supabase.co/storage/v1/object/public/portfolio-images/portfolio";
const projectsBase = "https://tkbekfarnsfvfgndlxfb.supabase.co/storage/v1/object/public/portfolio-images/projects";

const projectList: Project[] = [
  {
    id: "granja-de-bolso-gestao-granjas",
    number: "01",
    label: "Sistema personalizado",
    title: "Granja de Bolso.",
    description:
      "Plataforma de gestão completa para granjas de aves de postura: controle de estoque de ração, registro diário de produção, cadastro de lotes e relatórios com visualizações simples para quem está no dia a dia da granja.",
    image: `${projectsBase}/granja-de-bolso-capa.png`,
    icon: Workflow,
    accent: "yellow",
    benefits: [
      "Controle preciso de produção diária",
      "Gestão de lotes e ciclo das aves",
      "Relatórios exportáveis para decisão",
      "Acesso em múltiplas unidades",
    ],
    challenge:
      "O produtor precisava substituir planilhas espalhadas por uma ferramenta que reunisse produção, estoque de ração, lotes e histórico sem precisar de treinamento complexo para a equipe operacional.",
    solution:
      "Desenvolvi um sistema web responsivo com cadastro de granjas e lotes, registro diário de ovos e mortalidade, consumo de ração vinculado a cada lote e dashboards semanais com indicadores chave. A navegação foi pensada para ser usada direto no celular, dentro da granja mesmo.",
    result:
      "A rotina de fechamento diário saiu de quase 1 hora com planilhas para cerca de 10 minutos. O histórico consolidado ajuda a negociar melhor com fornecedores e o produtor consegue visualizar rapidamente qual lote está mais produtivo.",
    links: [
      { label: "Acessar Granja de Bolso", url: "https://granjadebolso.online" },
      { label: "Abrir versão alternativa", url: "https://granjadebolso.shop" },
    ],
  },
  {
    id: "zalu-aplicativo-gestao-salao",
    number: "02",
    label: "Aplicativo sob medida",
    title: "Zalu — salão em ordem.",
    description:
      "Aplicativo de gestão para salão de beleza com agendamento de serviços, cadastro de clientes, comissões de profissionais, registro financeiro e lembretes automáticos para quem atende e para quem agenda horário.",
    image: `${projectsBase}/zalu-salao-capa.png`,
    icon: Smartphone,
    accent: "dark",
    benefits: [
      "Agenda colaborativa em tempo real",
      "Comissões calculadas automaticamente",
      "Histórico completo por cliente",
      "Fechamento diário simplificado",
    ],
    challenge:
      "O salão cresceu e a agenda de papel mais as anotações em WhatsApp começaram a gerar horários duplicados, atrasos e dificuldade para saber quanto cada profissional deveria receber no fim do mês.",
    solution:
      "Construí um app progressivo com agenda diária por profissional, serviços cadastrados com valores padrão, ficha técnica do cliente, controle de pagamentos em múltiplas formas e fechamento mensal com comissões já calculadas. O lembrete por WhatsApp reduz faltas e o dono do salão consegue conferir tudo de qualquer lugar.",
    result:
      "O número de horários perdidos por desencontro caiu, o fechamento do mês ficou transparente para a equipe e a experiência do cliente melhorou porque o atendente já sabe o histórico antes de começar o serviço.",
    links: [
      { label: "Acessar Zalu", url: "https://zalusalao.online" },
      { label: "Abrir versão alternativa", url: "https://zalusalao.site" },
    ],
  },
  {
    id: "landing-servicos-locais",
    number: "03",
    label: "Landing page",
    title: "Página que agenda e converte.",
    description:
      "Landing page para prestador de serviços locais com foco em captação via WhatsApp: estrutura que apresenta o trabalho, lista os principais serviços, mostra provas sociais e deixa o caminho curto para quem quer agendar no mesmo instante.",
    image: "",
    icon: LayoutPanelTop,
    accent: "yellow",
    benefits: [
      "Mensagem clara já na primeira dobra",
      "Botões de WhatsApp estrategicamente posicionados",
      "Seção de serviços com valores orientativos",
      "Provas sociais e diferenciais do prestador",
    ],
    challenge:
      "O prestador tinha presença apenas em redes sociais e perdia clientes que buscavam um canal mais profissional, com informações organizadas e um caminho direto para agendar sem ter que esperar resposta no direct.",
    solution:
      "Montei uma landing page editorial e objetiva com hero forte, bloco de serviços detalhados, prova social em formato de depoimentos, FAQ para dúvidas frequentes e múltiplos pontos de contato com WhatsApp já com mensagem pronta.",
    result:
      "O número de mensagens qualificadas aumentou porque o visitante chega no WhatsApp já sabendo o que quer e quanto vai pagar, reduzindo o tempo gasto explicando serviço por serviço na conversa.",
  },
  {
    id: "site-institucional-escritorio",
    number: "04",
    label: "Site institucional",
    title: "Escritório com presença digital.",
    description:
      "Site institucional para escritório de serviços com apresentação da equipe, áreas de atuação, estrutura do atendimento, publicações e canal de contato integrado, pensado para transmitir credibilidade desde a primeira visita.",
    image: "",
    icon: Code2,
    accent: "dark",
    benefits: [
      "Apresentação profissional dos sócios",
      "Áreas de atuação explicadas em linguagem simples",
      "Blog/publicações integrado",
      "Formulário + WhatsApp para contato",
    ],
    challenge:
      "O escritório não tinha um ponto central de referência na internet. Os clientes buscavam no Google, encontravam perfis desatualizados e não conseguiam entender claramente quais serviços eram prestados e como funcionava o primeiro atendimento.",
    solution:
      "Criei um site institucional com navegação clara, páginas para cada área de atuação, seção de equipe com fotos e trajetórias, publicações para demonstrar conhecimento e um fluxo de contato dividido entre formulário estruturado e WhatsApp para casos mais urgentes.",
    result:
      "O escritório passou a aparecer melhor nas buscas locais e recebeu contatos mais alinhados com o perfil de cliente que quer atender, além de ter um canal oficial para enviar nas propostas comerciais.",
  },
  {
    id: "app-rotina-pequenos-negocios",
    number: "05",
    label: "Aplicativo mobile",
    title: "Rotina na palma da mão.",
    description:
      "Aplicativo de organização operacional para pequenos negócios de bairro: controle de pedidos, lista de clientes, registro de gastos e um painel simples que mostra se o dia ficou no verde ou no vermelho.",
    image: "",
    icon: Smartphone,
    accent: "yellow",
    benefits: [
      "Pedidos registrados sem perder papel",
      "Carteira de clientes organizada",
      "Controle de caixa simplificado",
      "Visão diária do faturamento",
    ],
    challenge:
      "O dono do negócio anotava tudo em cadernos e na hora de fechar o mês não conseguia saber com clareza quais produtos vendiam mais, quem era o cliente mais frequente e se o resultado do dia estava bom ou ruim.",
    solution:
      "Desenvolvi um app mobile first com fluxo rápido de lançamento de pedidos, cadastro simplificado de clientes, lançamento de gastos fixos e variáveis e um painel diário com comparação entre entrada e saída. Tudo pensado para ser usado no balcão, com uma mão só.",
    result:
      "A rotina de fechamento ficou mais rápida e o dono do negócio começou a tomar decisões com base no que realmente estava sendo vendido, ajustando mix de produtos e compras de estoque de acordo com a demanda.",
  },
  {
    id: "site-pessoal-freelancer",
    number: "06",
    label: "Site profissional",
    title: "Portfólio que apresenta de verdade.",
    description:
      "Site profissional para autônomos e freelancers com apresentação pessoal, portfólio de trabalhos, depoimentos, serviços e uma página de contato que deixa claro como começar uma parceria.",
    image: "",
    icon: Code2,
    accent: "dark",
    benefits: [
      "Apresentação autoral e diferenciada",
      "Portfólio com cases organizados",
      "Lista de serviços com escopo claro",
      "Caminho curto para orçamento",
    ],
    challenge:
      "O profissional enviava currículo e prints separados por e-mail ou WhatsApp. O processo era demorado, não transmitia consistência visual e faltava um canal único para mostrar repertório, valores e forma de trabalho.",
    solution:
      "Construí um site com linguagem editorial, seção de serviços explicando cada entrega, portfólio em formato de cases, depoimentos em destaque e uma página de contato já com perguntas estruturadas que agilizam o primeiro orçamento.",
    result:
      "O freelancer passou a compartilhar apenas um link em propostas e redes. A taxa de resposta positiva aumentou porque o cliente consegue entender estilo, experiência e forma de contratação antes mesmo da primeira conversa.",
  },
];

function ProjectImage({ project, compact = false }: { project: Project; compact?: boolean }) {
  const Icon = project.icon;
  return (
    <div className={`detail-image ${project.image ? "has-image" : "empty-project-image"} ${compact ? "compact-image" : ""}`}>
      {project.image ? (
        <img src={project.image} alt={project.label} loading="lazy" decoding="async" />
      ) : (
        <div className="image-placeholder">
          <Icon size={30} />
          <strong>Imagem do projeto</strong>
          <span>Adicione seus prints ou fotos aqui</span>
        </div>
      )}
      <div className="detail-icon">
        <Icon size={22} />
      </div>
    </div>
  );
}

function iconForProject(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("aplicativo") || normalized.includes("app")) return Smartphone;
  if (normalized.includes("landing")) return LayoutPanelTop;
  if (normalized.includes("sistema")) return Workflow;
  return Code2;
}

function linksForProject(slug: string) {
  if (slug === "granja-de-bolso-gestao-granjas") {
    return [
      { label: "Acessar Granja de Bolso", url: "https://granjadebolso.online" },
      { label: "Abrir versão alternativa", url: "https://granjadebolso.shop" },
    ];
  }
  if (slug !== "zalu-aplicativo-gestao-salao") return [];
  return [
    { label: "Acessar Zalu", url: "https://zalusalao.online" },
    { label: "Abrir versão alternativa", url: "https://zalusalao.site" },
  ];
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { data: persistedProjects } = trpc.projects.list.useQuery();
  const projectsReady = persistedProjects !== undefined;
  const projects: Project[] = projectsReady
    ? persistedProjects.map((project) => ({
        ...project,
        id: String(project.id),
        image: project.imageUrl ?? "",
        icon: iconForProject(project.label),
        links: linksForProject(project.slug),
        benefits: project.benefits,
        accent: project.accent as "yellow" | "dark",
      }))
    : [];

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".projects-page-nav, .projects-page-hero, .projects-list .project-detail, .projects-page-process, .projects-page-contact, .projects-page-footer, .project-count"
      )
    );
    elements.forEach((element, index) => {
      element.classList.add("zoom-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 90}ms`);
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
      { threshold: 0.12, rootMargin: "-6% 0px -6% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [projects.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProject(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  return (
    <main className="projects-page">
      <div className="projects-page-bg" aria-hidden="true" />
      <header className="projects-page-nav">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> voltar ao portfólio
        </Link>
        <span className="page-mark">LUCAS / PROJETOS</span>
        <a href={whatsapp} target="_blank" rel="noreferrer" className="page-contact">
          Vamos conversar <ArrowUpRight size={14} />
        </a>
      </header>

      <section className="projects-page-hero">
        <div className="page-kicker">Portfólio / seleção de soluções</div>
        <div className="projects-hero-grid">
          <h1>
            PROJETOS
            <br />
            <span>QUE GERAM</span>
            <br />
            MOVIMENTO<b>.</b>
          </h1>
          <div className="projects-hero-copy">
            <p>
              Sites, landing pages, sistemas e aplicativos. Cada projeto tem seu espaço, sua história e seu próximo passo.
            </p>
            <a href="#projetos-lista" className="page-scroll">
              explorar projetos <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <div className="project-count">
          <strong>{projectsReady ? String(projects.length).padStart(2, "0") : "••"}</strong>
          <span>
            {projectsReady ? "projetos" : "carregando"}
            <br />
            {projectsReady ? "do banco de dados" : "do portfólio"}
          </span>
        </div>
      </section>

      <section className="projects-list" id="projetos-lista">
        {!projectsReady ? (
          <div className="projects-list-state">
            <strong>Carregando projetos...</strong>
            <span>Buscando no banco de dados</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="projects-list-state">
            <strong>Nenhum projeto publicado ainda.</strong>
            <span>Volte em breve — novos projetos estão a caminho.</span>
          </div>
        ) : (
          projects.map((project) => {
          const Icon = project.icon;
          return (
            <article className={`project-detail ${project.accent}`} id={project.id} key={project.id}>
              <div className="detail-number">{project.number}</div>
              <button
                className="detail-image-button"
                onClick={() => setSelectedProject(project)}
                aria-label={`Abrir detalhes de ${project.label}`}
              >
                <ProjectImage project={project} />
              </button>
              <div className="detail-copy">
                <span className="detail-label">{project.label}</span>
                <h2>{project.title}</h2>
                <p>{project.description}</p>
                <div className="detail-sections">
                  <div>
                    <strong>O desafio</strong>
                    <span>{project.challenge || "Conte aqui qual necessidade ou problema existia."}</span>
                  </div>
                  <div>
                    <strong>A solução</strong>
                    <span>{project.solution || "Explique o que você criou para resolver o desafio."}</span>
                  </div>
                  <div>
                    <strong>O resultado</strong>
                    <span>{project.result || "Descreva o benefício ou a transformação gerada."}</span>
                  </div>
                </div>
                <div className="benefit-list">
                  {project.benefits.map((benefit) => (
                    <div key={benefit}>
                      <Check size={14} />
                      {benefit}
                    </div>
                  ))}
                </div>
                {project.links?.length ? (
                  <div className="project-live-links">
                    {project.links.map((link) => (
                      <a key={link.url} className="project-live-link" href={link.url} target="_blank" rel="noreferrer">
                        {link.label}
                        <ExternalLink size={13} />
                      </a>
                    ))}
                  </div>
                ) : null}
                <button className="detail-cta detail-open" onClick={() => setSelectedProject(project)}>
                  Abrir detalhes <ArrowUpRight size={16} />
                </button>
              </div>
            </article>
          );
        })
        )}
      </section>

      <section className="projects-page-process">
        <div className="page-kicker">Como acontece</div>
        <div className="process-page-grid">
          <h2>
            UMA IDEIA.
            <br />
            <span>UM CAMINHO.</span>
          </h2>
          <div>
            <p>
              Você chega com uma necessidade. Eu ajudo a transformar isso em uma solução clara, bonita e possível.
            </p>
            <div className="process-mini-list">
              <span>
                <b>01</b> conversa
              </span>
              <span>
                <b>02</b> planejamento
              </span>
              <span>
                <b>03</b> construção
              </span>
              <span>
                <b>04</b> entrega
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="projects-page-contact">
        <div className="contact-mark">
          <MessageCircle size={18} /> próximo projeto
        </div>
        <h2>
          O PRÓXIMO
          <br />
          <span>PODE SER O SEU.</span>
        </h2>
        <p>Me conte o que você precisa e vamos descobrir juntos o melhor caminho.</p>
        <a className="page-big-cta" href={whatsapp} target="_blank" rel="noreferrer">
          Começar uma conversa <ArrowUpRight size={19} />
        </a>
      </section>
      <footer className="projects-page-footer">
        <Link href="/">Lucas /dev</Link>
        <span>Sites, landing pages, sistemas e aplicativos feitos para pessoas reais.</span>
        <a href="https://instagram.com/luccas.hgs" target="_blank" rel="noreferrer">
          Instagram <ExternalLink size={12} />
        </a>
      </footer>

      {selectedProject && (
        <div
          className="project-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProject(null);
          }}
        >
          <section
            className={`project-modal ${selectedProject.accent}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            <button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Fechar detalhes">
              <X size={20} />
            </button>
            <div className="modal-number">{selectedProject.number} / detalhes do projeto</div>
            <div className="modal-grid">
              <ProjectImage project={selectedProject} compact />
              <div className="modal-content">
                <span className="detail-label">{selectedProject.label}</span>
                <h2 id="project-modal-title">{selectedProject.title}</h2>
                <p>{selectedProject.description}</p>
                <div className="modal-info">
                  <div>
                    <strong>O desafio</strong>
                    <span>
                      {selectedProject.challenge ||
                        "Adicione aqui o problema ou necessidade que deu origem ao projeto."}
                    </span>
                  </div>
                  <div>
                    <strong>A solução</strong>
                    <span>
                      {selectedProject.solution || "Explique como você pensou e desenvolveu esta solução."}
                    </span>
                  </div>
                  <div>
                    <strong>O resultado</strong>
                    <span>
                      {selectedProject.result ||
                        "Descreva o impacto, benefício ou aprendizado do trabalho."}
                    </span>
                  </div>
                </div>
                {selectedProject.links?.length ? (
                  <div className="project-live-links">
                    {selectedProject.links.map((link) => (
                      <a key={link.url} className="project-live-link" href={link.url} target="_blank" rel="noreferrer">
                        {link.label}
                        <ExternalLink size={13} />
                      </a>
                    ))}
                  </div>
                ) : null}
                <a
                  className="detail-cta"
                  href={`${whatsapp}?text=Olá%20Lucas!%20Quero%20conversar%20sobre%20${encodeURIComponent(selectedProject.label)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Conversar sobre este projeto <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
