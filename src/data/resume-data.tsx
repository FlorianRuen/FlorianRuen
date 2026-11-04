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
  location: { fr: "Orléans, France", en: "Orléans, France" },
  locationLink: "https://maps.app.goo.gl/ntqUULunKpJbANGx5",
  avatarUrl: "https://avatars.githubusercontent.com/u/13837778?v=4",

  headline: {
    fr: "IT Technical Leader chez OVHcloud",
    en: "IT Technical Leader at OVHcloud",
  },
  tagline: {
    fr: "Ingénieur logiciel et entrepreneur, passionné par l'IA, l'innovation et les produits qui partent de zéro.",
    en: "Software engineer and founder, passionate about AI, innovation and building products from zero.",
  },
  summary: {
    fr: "Ingénieur informatique, j'ai passé plus de 8 ans à concevoir et lancer des produits : d'abord en fondant et dirigeant ma propre startup d'IA, puis en prenant la direction technique d'une solution Web3, avant de rejoindre OVHcloud, où j'occupe aujourd'hui le poste d'IT Technical Leader. J'aime transformer des idées en produits concrets, robustes et utiles, accompagner les équipes dans leurs choix techniques et explorer ce que l'IA change dans notre façon de construire des logiciels.",
    en: "I'm a computer engineer who has spent 8+ years designing and launching products: first by founding and running my own AI startup, then by leading software at a Web3 company, before joining OVHcloud, where I'm now an IT Technical Leader. I love turning ideas into concrete, reliable and useful products, helping teams make sound technical decisions, and exploring how AI is changing the way we build software.",
  },

  highlights: [
    {
      value: { fr: "8+", en: "8+" },
      label: { fr: "ans à construire des logiciels", en: "years building software" },
    },
    {
      value: { fr: "0 → 1", en: "0 → 1" },
      label: {
        fr: "produits lancés de l'idée au marché",
        en: "products taken from idea to market",
      },
    },
    {
      value: { fr: "IA · Cloud · Web3", en: "AI · Cloud · Web3" },
      label: { fr: "domaines explorés", en: "domains explored" },
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
              fr: "Conception et développement d'applications et d'API au sein du leader européen du cloud.",
              en: "Designed and built applications and APIs at Europe's leading cloud provider.",
            },
          ],
        },
      ],
      tech: ["Go", "TypeScript", "React", "PostgreSQL", "CI/CD"],
    },
    {
      company: "CIDgravity",
      link: "https://cidgravity.com",
      roles: [
        {
          title: { fr: "Head of Software", en: "Head of Software" },
          start: "2023",
          end: "2024-08",
          bullets: [
            {
              fr: "Direction du développement d'une passerelle vers le Web3 et le stockage de fichiers décentralisé.",
              en: "Led development of a gateway to Web3 and decentralised file storage.",
            },
          ],
        },
      ],
      tech: ["React", "Go", "Python", "MongoDB"],
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
              fr: "Création d'une startup développant un logiciel basé sur l'IA pour prévenir les accidents du travail.",
              en: "Founded a startup building AI-powered software to prevent workplace accidents.",
            },
            {
              fr: "Direction de l'entreprise et de la technique, du premier prototype jusqu'au produit.",
              en: "Led both the business and the technology, from the first prototype to the product.",
            },
          ],
        },
      ],
      tech: ["Java", "React", "Python", "Gradle", "PostgreSQL"],
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
              fr: "Création d'une formation soudure et développement de logiciels internes de suivi et d'archivage des programmes automates.",
              en: "Built a welding training programme and developed internal tools to track and archive PLC programs.",
            },
          ],
        },
      ],
      tech: ["C#"],
    },
  ],

  skills: [
    {
      category: { fr: "Langages", en: "Languages" },
      items: ["Go", "TypeScript", "Python", "Java", "Kotlin", "C#", "PHP", "VB.net"],
    },
    {
      category: { fr: "Frontend", en: "Frontend" },
      items: ["React", "Next.js", "Tailwind CSS"],
    },
    {
      category: { fr: "Backend & données", en: "Backend & data" },
      items: ["REST APIs", "PostgreSQL", "MongoDB", "Gradle"],
    },
    {
      category: { fr: "Cloud & DevOps", en: "Cloud & DevOps" },
      items: ["OVHcloud", "AWS", "Docker", "CI/CD"],
    },
    {
      category: { fr: "IA", en: "AI" },
      items: ["Machine Learning", "LLMs", "AI-assisted development"],
    },
    {
      category: { fr: "Leadership", en: "Leadership" },
      items: [
        { fr: "Leadership technique", en: "Technical leadership" },
        { fr: "Architecture logicielle", en: "Software architecture" },
        { fr: "Entrepreneuriat", en: "Entrepreneurship" },
        { fr: "Travail d'équipe", en: "Teamwork" },
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
} as const;
