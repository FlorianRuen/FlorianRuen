import {
  AmbitLogo,
  BarepapersLogo,
  BimLogo,
  CDGOLogo,
  ClevertechLogo,
  ConsultlyLogo,
  EvercastLogo,
  Howdy,
  JarockiMeLogo,
  JojoMobileLogo,
  Minimal,
  MobileVikingsLogo,
  MonitoLogo,
  NSNLogo,
  ParabolLogo,
  TastyCloudLogo,
  YearProgressLogo,
} from "@/images/logos";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons";

export const RESUME_DATA = {
  name: "Florian RUEN",
  initials: "FR",
  location: "Orléans, France",
  locationLink: "https://maps.app.goo.gl/ntqUULunKpJbANGx5",
  about:
    "Detail-oriented Full Stack Engineer dedicated to building high-quality products.",
  summary:
    "As a Full Stack Engineer, I specialize in taking products from concept to launch. I excel in leading teams and creating environments where individuals perform at their best. Currently, I work mostly with TypeScript, React, Node.js, and GraphQL. I have over 8 years of experience working remotely with companies worldwide.",
  avatarUrl: "https://avatars.githubusercontent.com/u/13837778?v=4",
  personalWebsiteUrl: "https://florianruen.fr",
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
      }
    ],
  },
  education: [
    {
      school: "Polytech Sorbonne",
      degree: "Diplôme d'ingénieur en électronique et informatique industrielle",
      start: "2015",
      end: "2018",
    },
    {
      school: "Lycée DURZY",
      degree: "BTS Conception de systèmes automatisés (CRSA)",
      start: "2013",
      end: "2015",
    },
    {
      school: "Lycée DURZY",
      degree: "Baccalauréat scientifique (option sciences de l'ingénieur SI)",
      start: "2010",
      end: "2013",
    }
  ],
  work: [
    {
      company: "CIDgravity",
      link: "https://cidgravity.com",
      badges: ["Remote"],
      title: "Head of software",
      logo: ConsultlyLogo,
      start: "2023",
      end: null,
      description:
        "Développement d'une solution web3 pour simplifier l'adoptation de l'internet decentralizé. Technologies: React, Go, Python, MongoDB",
    },
    {
      company: "Eyes'R",
      link: "https://eyesr.fr",
      badges: ["entrepreneur"],
      title: "CEO & CTO",
      logo: ParabolLogo,
      start: "2018",
      end: "2023",
      description:
        "Fondateur d'une entreprise qui développe un logiciel basé sur l'IA pour prévenir les accidents de travail. Technologies: Java, React, Python, Gradle, PostgreSQL",
    },
    {
      company: "Forvia Seating",
      link: "https://www.forvia.com/fr",
      badges: ["Remote"],
      title: "Ingénieur process (alternance)",
      logo: ClevertechLogo,
      start: "2015",
      end: "2018",
      description:
        "Participation à la création d'une formation soudure, ainsi qu'au développement de logiciels internes de suivi et d'archivage des programmes automates. Technologies: C#",
    }
  ],
  skills: [
    "C#",
    "VB.net",
    "React",
    "Go",
    "Java",
    "PHP",
    "Kotlin",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "Prototypage 3D",
    "Automates industriels",
    "Travail d'équipe",
    "Entreprenariat"
  ],
  projects: [
    {
      title: "Parabol",
      techStack: [
        "Full Stack Developer",
        "TypeScript",
        "React",
        "Node.js",
        "GraphQL",
      ],
      description:
        "The Agile meeting co-pilot that delivers better meetings with less effort",
      logo: ParabolLogo,
      link: {
        label: "github.com",
        href: "https://parabol.co/",
      },
    }
  ],
} as const;
