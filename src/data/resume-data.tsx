import { GitHubIcon, LinkedInIcon } from "@/components/icons";

export const RESUME_DATA = {
  name: "Florian RUEN",
  initials: "FR",
  location: "Orléans, France",
  locationLink: "https://maps.app.goo.gl/ntqUULunKpJbANGx5",
  about: "Entrepreneur et ingénieur informatique passionné, transformant des idées innovantes en produits concrets.",
  summary: "En tant qu'ingénieur informatique et développeur logiciel, je suis passionné par l'innovation et la transformation numérique. Avec plus de 8 ans d'expérience, je me suis spécialisé dans la conception et le lancement de nouveaux produits dans des environnements technologiques variés et évolutifs. Habitué au télétravail, j'ai collaboré avec des entreprises de toutes tailles, apportant des solutions robustes et innovantes.",
  avatarUrl: "https://avatars.githubusercontent.com/u/13837778?v=4",
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
      badges: [],
      title: "Head of software",
      start: "2023",
      end: null,
      description: "Développement d'une solution permettant de créer une passerelle vers le web3.0 (stockage de fichiers decentralisé). Technologies utilisées: React, Go, Python, MongoDB",
    },
    {
      company: "Eyes'R",
      link: "https://youtu.be/acfvShQqWko?si=pAX3L_QDqrDQl6di",
      badges: [],
      title: "CEO & CTO",
      start: "2018",
      end: "2023",
      description: "Fondateur d'une entreprise qui développe un logiciel basé sur l'IA pour prévenir les accidents de travail. Technologies utilisées: Java, React, Python, Gradle, PostgreSQL",
    },
    {
      company: "Forvia Seating",
      link: "https://www.forvia.com",
      badges: [],
      title: "Ingénieur process (alternance)",
      start: "2015",
      end: "2018",
      description: "Participation à la création d'une formation soudure, ainsi qu'au développement de logiciels internes de suivi et d'archivage des programmes automates. Technologies utilisées: C#",
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
      title: "Viva technology",
      techStack: [
        "Management",
        "Bénévolat"
      ],
      description: "Gestion et management d'une équipe de volontaire lors du salon Viva Technology 2018",
      link: {
        href: undefined
      }
    },
    {
      title: "CFA UPMC",
      techStack: [
        "BDE",
        "Bénévolat"
      ],
      description: "Président du bureau des étudiants (gestion, organisation des évènements et de voyages)",
      link: {
        href: undefined
      }
    },
    {
      title: "Heol",
      techStack: [
        "Prototypage",
        "Java"
      ],
      description: "Association spécialisée dans la conception de robot humanoïdes à usage purement éducatif",
      link: {
        href: undefined
      }
    }
  ],
} as const;
