import type { Lang } from "@/lib/i18n";

/**
 * Video-only wording. Everything factual (names, dates, skills, schools...)
 * comes from the website's resume data; this file only holds short, punchy
 * lines that fit on screen.
 */
export const COPY = {
  en: {
    bootCmd: "./florian --mode=build",
    bootLines: [
      ["loading experience", "8+ years"],
      ["compiling ambition", "done"],
      ["booting founder mode", "ready"],
      ["connecting to AI", "online"],
    ],
    path: ["Engineer", "Founder", "Tech Leader"],
    numbersKicker: "in numbers",
    shipping: "still shipping 🚀",
    journeyKicker: "the journey",
    companies: {
      "Forvia Seating": "Where it all started: industrial software & automation.",
      "Eyes'R": "Founded an AI startup: computer vision that prevents workplace accidents.",
      CIDgravity: "Led the software of a gateway to Web3 & decentralised storage.",
      OVHcloud: "Leading the API that makes cloud services simple for product teams.",
    } as Record<string, string>,
    award: "Préventica Innovation Award 2021",
    press: "Seen in",
    promoted: "promoted",
    perDay: "requests / day",
    humanKicker: "the human side",
    humanQuote: "Turning ideas into concrete, reliable and useful products.",
    stackKicker: "the toolbox",
    aiLine: "Exploring how AI changes the way we build software.",
    eduKicker: "education",
    beyondKicker: "beyond code",
    outroTitle: ["Let's build", "what's next."],
    outroSub: "Software engineer · Founder · Tech leader",
  },
  fr: {
    bootCmd: "./florian --mode=build",
    bootLines: [
      ["chargement de l'expérience", "8+ ans"],
      ["compilation de l'ambition", "ok"],
      ["démarrage mode fondateur", "prêt"],
      ["connexion à l'IA", "en ligne"],
    ],
    path: ["Ingénieur", "Fondateur", "Tech Leader"],
    numbersKicker: "en chiffres",
    shipping: "et ça continue 🚀",
    journeyKicker: "le parcours",
    companies: {
      "Forvia Seating": "Là où tout a commencé : logiciel industriel & automatismes.",
      "Eyes'R": "Création d'une startup d'IA : la vision par ordinateur contre les accidents du travail.",
      CIDgravity: "Direction logicielle d'une passerelle vers le Web3 et le stockage décentralisé.",
      OVHcloud: "À la tête de l'API qui simplifie les services cloud pour les équipes produit.",
    } as Record<string, string>,
    award: "Prix de l'innovation Préventica 2021",
    press: "Vu dans",
    promoted: "promu",
    perDay: "requêtes / jour",
    humanKicker: "le côté humain",
    humanQuote: "Transformer des idées en produits concrets, robustes et utiles.",
    stackKicker: "la boîte à outils",
    aiLine: "J'explore ce que l'IA change dans notre façon de construire des logiciels.",
    eduKicker: "formation",
    beyondKicker: "au-delà du code",
    outroTitle: ["Construisons", "la suite."],
    outroSub: "Ingénieur logiciel · Fondateur · Tech leader",
  },
} satisfies Record<Lang, unknown>;

export type Copy = (typeof COPY)["en"];
