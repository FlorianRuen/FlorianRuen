import { GitHubIcon, LinkedInIcon } from "@/components/icons";

/** A string translated in every supported language. */
export type Localized = { fr: string; en: string };

/**
 * Dates are "YYYY" or "YYYY-MM" strings. A month is displayed when given
 * ("nov. 2024" / "Nov 2024"), otherwise only the year.
 */
export const RESUME_DATA = {
  name: "Florian Ruen",
  initials: "FR",
  location: { fr: "Paris, France", en: "Paris, France" },
  locationLink:
    "https://www.google.com/maps/search/?api=1&query=Paris%2C+France",
  /** Served from /public, so it is fast and can't change by accident. */
  avatarUrl: "/avatar.jpg",

  headline: {
    fr: "IT Technical Leader chez OVHcloud",
    en: "IT Technical Leader at OVHcloud",
  },
  tagline: {
    fr: "Ingénieur logiciel et entrepreneur, passionné par l'IA, l'innovation et les produits qui partent de zéro.",
    en: "Software engineer and founder, passionate about AI, innovation and building products from zero.",
  },
  /** Search-result snippet: name, role and city first, under ~155 characters. */
  seoDescription: {
    fr: "Florian Ruen, IT Technical Leader chez OVHcloud à Paris. Ingénieur logiciel et fondateur d'une startup d'IA primée, 8+ ans à construire des produits.",
    en: "Florian Ruen, IT Technical Leader at OVHcloud in Paris. Software engineer and founder of an award-winning AI startup, 8+ years building products.",
  },
  summary: {
    fr: "Ingénieur informatique, j'ai passé plus de 8 ans à concevoir et lancer des produits : d'abord en fondant et dirigeant ma propre startup d'IA, primée pour son innovation, puis en prenant la direction technique d'une solution Web3, avant de rejoindre OVHcloud, où j'occupe aujourd'hui le poste d'IT Technical Leader. J'aime transformer des idées en produits concrets, robustes et utiles, accompagner les équipes dans leurs choix techniques et explorer ce que l'IA change dans notre façon de construire des logiciels.",
    en: "I'm a computer engineer who has spent 8+ years designing and launching products: first by founding and running my own award-winning AI startup, then by leading software at a Web3 company, before joining OVHcloud, where I'm now an IT Technical Leader. I love turning ideas into concrete, reliable and useful products, helping teams make sound technical decisions, and exploring how AI is changing the way we build software.",
  },

  /**
   * Key figures, shown in two groups on the page: the career, and what the
   * products I built handle in production. `group` drives the split.
   */
  highlights: [
    {
      group: "career",
      value: { fr: "8+", en: "8+" },
      label: {
        fr: "ans à construire des logiciels",
        en: "years building software",
      },
    },
    {
      group: "career",
      value: { fr: "5 ans", en: "5 years" },
      label: {
        fr: "à fonder et diriger une startup d'IA",
        en: "founding and running an AI startup",
      },
    },
    {
      group: "career",
      value: { fr: "3", en: "3" },
      label: {
        fr: "postes de direction technique : CTO, Head of Software, Tech Leader",
        en: "technical leadership roles: CTO, Head of Software, Tech Leader",
      },
    },
    {
      group: "product",
      value: { fr: "~1M", en: "~1M" },
      label: {
        fr: "requêtes par jour traitées par l'API que je développe chez OVHcloud",
        en: "requests per day handled by the API I build at OVHcloud",
      },
    },
    {
      group: "product",
      value: { fr: "~58M", en: "~58M" },
      label: {
        fr: "transactions de stockage traitées par la passerelle CIDgravity",
        en: "storage transactions processed by the CIDgravity gateway",
      },
    },
    {
      group: "product",
      value: { fr: "~9,3 Po", en: "~9.3 PB" },
      label: {
        fr: "de fichiers stockés sur le web décentralisé",
        en: "of files stored on the decentralised web",
      },
    },
  ],

  contact: {
    email: "florian.ruen@gmail.com",
    tel: "+33610556771",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/FlorianRuen",
        icon: GitHubIcon,
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/florianruen/",
        icon: LinkedInIcon,
      },
    ],
  },

  work: [
    {
      company: "OVHcloud",
      link: "https://www.ovhcloud.com",
      summary: {
        fr: "API interne qui abstrait la complexité de consommation des services cloud (serveurs, réseau, vRack, BGP peerings…) pour les équipes produit au contact des clients finaux. ~1 million de requêtes par jour en moyenne.",
        en: "Internal API that abstracts away the complexity of consuming cloud services (servers, networking, vRack, BGP peerings…) for the product teams serving end customers. ~1 million requests per day on average.",
      },
      roles: [
        {
          title: { fr: "IT Technical Leader", en: "IT Technical Leader" },
          start: "2025-09",
          end: null,
          bullets: [
            {
              fr: "Leadership technique de l'équipe : architecture, choix technologiques, revues de code et accompagnement des développeurs.",
              en: "Technical leadership of the team: architecture, technology choices, code reviews and mentoring developers.",
            },
            {
              fr: "Garant de la qualité, de la fiabilité et de l'industrialisation des applications (CI/CD, observabilité, bonnes pratiques).",
              en: "Accountable for the quality, reliability and industrialisation of our applications (CI/CD, observability, best practices).",
            },
            {
              fr: "Promotion de l'usage de l'IA dans les pratiques de développement de l'équipe.",
              en: "Driving the adoption of AI in the team's development workflow.",
            },
          ],
        },
        {
          title: { fr: "Software Engineer", en: "Software Engineer" },
          start: "2024-11",
          end: "2025-08",
          bullets: [
            {
              fr: "Conception et développement de l'API, pour que les équipes produit consomment serveurs, réseau, vRack et BGP peerings sans en maîtriser toute la complexité.",
              en: "Designed and built the API so product teams can consume servers, networking, vRack and BGP peerings without having to master all of their complexity.",
            },
            {
              fr: "Centralisation dans un même service de l'expertise et des règles métier nécessaires à la consommation des services cloud.",
              en: "Centralised the expertise and business rules required to consume cloud services into a single service.",
            },
          ],
        },
      ],
      tech: [
        "Go",
        "CI/CD",
        "Kubernetes",
        "PostgreSQL",
        "Artifactory",
        "Bitbucket",
        "Grafana",
        "Claude Code",
      ],
    },
    {
      company: "CIDgravity",
      link: "https://cidgravity.com",
      summary: {
        fr: "Une passerelle simple vers le web décentralisé : une application de stockage de fichiers basée sur Nextcloud et adossée à la blockchain Filecoin et à IPFS. Fichiers immuables pendant au moins 18 mois, intégrité vérifiée chaque jour sur la blockchain et accessibilité contrôlée toutes les 6 heures, données répliquées chez des dizaines de fournisseurs de stockage dans le monde. ~58 millions de transactions et ~9,3 Po de fichiers stockés.",
        en: "A seamless gateway to the decentralised web: a file storage application built on Nextcloud and backed by the Filecoin blockchain and IPFS. Files are immutable for at least 18 months, their integrity is verified on-chain every day and their retrievability probed every 6 hours, and data is replicated across dozens of storage providers worldwide. ~58 million transactions and ~9.3 PB of files stored.",
      },
      roles: [
        {
          title: { fr: "Head of Software", en: "Head of Software" },
          start: "2023",
          end: "2024-08",
          bullets: [
            {
              fr: "Direction du développement de la passerelle, conçue à partir de zéro.",
              en: "Led the development of the gateway, built from scratch.",
            },
            {
              fr: "Développement en Go d'une application de gestion des transactions pour les fournisseurs de stockage : règles de tarification par client, puis acceptation ou refus automatique des transactions selon leurs propres critères.",
              en: "Built a Go transaction-management application for storage providers: per-client pricing rules, then automatic acceptance or rejection of transactions based on their own criteria.",
            },
          ],
        },
      ],
      tech: [
        "Go",
        "React",
        "Python",
        "MongoDB",
        "Nextcloud",
        "Filecoin",
        "IPFS",
      ],
    },
    {
      company: "Eyes'R",
      link: "https://youtu.be/acfvShQqWko?si=pAX3L_QDqrDQl6di",
      roles: [
        {
          title: { fr: "Fondateur, CEO & CTO", en: "Founder, CEO & CTO" },
          start: "2018",
          end: "2023",
          bullets: [
            {
              fr: "Création d'une startup qui utilise l'IA et la vision par ordinateur pour détecter les situations à risque et prévenir les accidents du travail.",
              en: "Founded a startup using AI and computer vision to detect risky situations and prevent workplace accidents.",
            },
            {
              fr: "Lauréat du Prix de l'innovation Préventica 2021 et finaliste du concours La Tribune « 10 000 startups pour changer le monde ».",
              en: 'Winner of the 2021 Préventica Innovation Award and finalist of La Tribune\'s "10,000 startups to change the world" competition.',
            },
            {
              fr: "Direction de l'entreprise et de la technique, du premier prototype jusqu'au produit, dont une application de remontée des situations à risque.",
              en: "Led both the business and the technology, from the first prototype to the product, including an app for reporting hazardous situations.",
            },
          ],
        },
      ],
      tech: ["Java", "React", "Python", "Gradle", "PostgreSQL"],
      press: {
        label: { fr: "Dans les médias", en: "In the press" },
        items: [
          { name: "Europe 1 · La France bouge", url: null },
          {
            name: "Ouest-France",
            url: "https://www.ouest-france.fr/economie/entreprises/entreprise-eyes-r-la-startup-francaise-leader-de-la-prevention-des-risques-au-travail-7608639",
          },
          {
            name: "Maddyness",
            url: "https://www.maddyness.com/2022/06/09/maddytools-eyesr-cameras-detecter-risques-accident-entreprise/",
          },
          {
            name: "Radio France",
            url: "https://www.radiofrance.fr/ici/podcasts/la-nouvelle-eco/la-nouvelle-eco-eye-sr-l-intelligence-artificielle-au-service-de-la-securite-des-salaries-7693925",
          },
          {
            name: "La République du Centre",
            url: "https://www.larep.fr/montargis-45200/economie/eyes-r-la-societe-creatrice-de-la-camera-qui-repere-si-le-port-du-masque-est-respecte-au-sein-des-entreprises-uniquement_13895438",
          },
          {
            name: "Prévention BTP",
            url: "https://www.preventionbtp.fr/actualites/equipements/une-application-de-remontee-de-situations-a-risque_22dXZLYbQ8a7peHPXW56yk",
          },
          {
            name: "Inforisque",
            url: "https://inforisque.fr/actualites/detail/34214-lancement-de-lapplication-de-remontee-des-situations-a-risques-eyesr/",
          },
        ],
      },
    },
    {
      company: "Forvia Seating",
      link: "https://www.forvia.com",
      roles: [
        {
          title: {
            fr: "Ingénieur process (alternance)",
            en: "Process Engineer (work-study)",
          },
          start: "2015",
          end: "2018",
          bullets: [
            {
              fr: "Projet principal : participation au développement d'un logiciel interne en C# de suivi et d'archivage des programmes automates (robots, lignes de production automatisées). Versionnage, historique et téléchargement garantissent que la dernière version est toujours disponible pour les maintenances et les mises à jour, y compris lors des interventions des nombreux prestataires extérieurs.",
              en: "Main project: helped build an internal C# tool to track and archive PLC programs for robots and automated production lines. Versioning, history and downloads ensure the latest program is always available for maintenance and updates, including when the many external contractors step in.",
            },
            {
              fr: "Participation au développement d'un logiciel interne en C# de suivi de la production pour le responsable d'unité : saisie quotidienne des objectifs et du réalisé par ligne, et rapports automatiques des écarts au jour, à la semaine ou au mois, en remplacement de fichiers Excel sans calcul automatique.",
              en: "Helped build an internal C# production-tracking tool for the unit manager: daily entry of targets and actual output per line, with automatic daily, weekly and monthly variance reports, replacing Excel files with no automated calculations.",
            },
            {
              fr: "Contribution au programme de formation à la soudure.",
              en: "Contributed to the welding training programme.",
            },
          ],
        },
      ],
      tech: ["C#"],
    },
  ],

  skills: [
    {
      category: { fr: "Savoir-être", en: "Soft skills" },
      items: [
        { fr: "Leadership", en: "Leadership" },
        { fr: "Mentorat", en: "Mentoring" },
        { fr: "Communication claire", en: "Clear communication" },
        { fr: "Prise de décision", en: "Decision-making" },
        { fr: "Esprit entrepreneurial", en: "Entrepreneurial mindset" },
        { fr: "Travail d'équipe", en: "Teamwork" },
        { fr: "Adaptabilité", en: "Adaptability" },
        { fr: "Autonomie", en: "Autonomy" },
        { fr: "Esprit critique", en: "Critical thinking" },
      ],
    },
    {
      category: { fr: "Langages", en: "Languages" },
      items: [
        "Go",
        "TypeScript",
        "Python",
        "Java",
        "Kotlin",
        "C#",
        "PHP",
        "VB.net",
      ],
    },
    {
      category: { fr: "Frontend", en: "Frontend" },
      items: ["React", "Next.js", "Tailwind CSS"],
    },
    {
      category: { fr: "Backend & données", en: "Backend & data" },
      items: [
        "REST APIs",
        { fr: "Architecture logicielle", en: "Software architecture" },
        "PostgreSQL",
        "MongoDB",
        "Gradle",
      ],
    },
    {
      category: { fr: "Cloud & DevOps", en: "Cloud & DevOps" },
      items: ["OVHcloud", "AWS", "Kubernetes", "Docker", "CI/CD", "Grafana"],
    },
    {
      category: { fr: "IA", en: "AI" },
      items: [
        "Machine Learning",
        "LLMs",
        "Claude Code",
        "AI-assisted development",
      ],
    },
    {
      category: { fr: "Industrie", en: "Industry" },
      items: [
        { fr: "Automates industriels", en: "Industrial PLCs" },
        { fr: "Prototypage 3D", en: "3D prototyping" },
      ],
    },
  ],

  education: [
    {
      school: "Polytech Sorbonne",
      degree: {
        fr: "Diplôme d'ingénieur en électronique et informatique industrielle",
        en: "Engineering degree in Electronics & Industrial Computing",
      },
      start: "2015",
      end: "2018",
    },
    {
      school: "Lycée Durzy",
      degree: {
        fr: "BTS Conception et réalisation de systèmes automatiques (CRSA)",
        en: "Higher technical diploma in automated systems design (BTS CRSA)",
      },
      start: "2013",
      end: "2015",
    },
    {
      school: "Lycée Durzy",
      degree: {
        fr: "Baccalauréat scientifique, option sciences de l'ingénieur",
        en: "Scientific baccalaureate, engineering sciences",
      },
      start: "2010",
      end: "2013",
    },
  ],

  projects: [
    {
      title: "Viva Technology",
      tags: [
        { fr: "Management", en: "Management" },
        { fr: "Bénévolat", en: "Volunteering" },
      ],
      description: {
        fr: "Gestion et management d'une équipe de bénévoles lors du salon Viva Technology 2018.",
        en: "Managed a team of volunteers at the Viva Technology 2018 show.",
      },
      link: undefined,
    },
    {
      title: "CFA UPMC",
      tags: [
        { fr: "BDE", en: "Student union" },
        { fr: "Bénévolat", en: "Volunteering" },
      ],
      description: {
        fr: "Président du bureau des étudiants : gestion, organisation des événements et des voyages.",
        en: "President of the student union: management, events and trips.",
      },
      link: undefined,
    },
    {
      title: "Heol",
      tags: [
        { fr: "Prototypage", en: "Prototyping" },
        { fr: "Java", en: "Java" },
      ],
      description: {
        fr: "Association spécialisée dans la conception de robots humanoïdes à usage éducatif.",
        en: "Non-profit designing humanoid robots for educational purposes.",
      },
      link: undefined,
    },
  ],

  interests: [
    { fr: "Investissement dans les startups", en: "Startup investing" },
    { fr: "Tennis", en: "Tennis" },
    { fr: "VTT", en: "Mountain biking" },
    { fr: "Musique", en: "Music" },
    { fr: "Cuisine", en: "Cooking" },
  ],
} as const;
