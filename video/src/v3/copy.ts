import type { Lang } from "@/lib/i18n";
import { COPY2 } from "../v2/copy";

/**
 * Wording for video v3: everything from v2, plus the "who I am" chapter.
 * The soft skills themselves come from the resume data (skills[0]).
 */
export const COPY3 = {
  en: {
    ...COPY2.en,
    exitCmd: "exit",
    exitOut: ["logout", "↳ going offline for a ride 🚵"],
    trailKicker: "who I am",
    offTitle: ["Off the keyboard,", "on the trail."],
    shyLine: ["Quiet at first.", "All-in once I'm in."],
    likeAtWork: "On the bike, like at work:",
    softKicker: "soft skills",
    summit: ["Energetic.", "Ambitious.", "Generous."],
    offDuty: "off duty",
  },
  fr: {
    ...COPY2.fr,
    exitCmd: "exit",
    exitOut: ["déconnexion", "↳ parti rouler en VTT 🚵"],
    trailKicker: "qui je suis",
    offTitle: ["Loin du clavier,", "sur les sentiers."],
    shyLine: ["Discret au premier abord.", "À fond une fois lancé."],
    likeAtWork: "En VTT comme au travail :",
    softKicker: "savoir-être",
    summit: ["Énergique.", "Ambitieux.", "Généreux."],
    offDuty: "hors du boulot",
  },
} satisfies Record<Lang, unknown>;

export type Copy3 = (typeof COPY3)["en"];
