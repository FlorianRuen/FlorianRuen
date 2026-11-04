import { toText } from "@/lib/resume-formats";

export const dynamic = "force-static";

/** `curl florianruen.fr/cv/fr` – the resume as plain text, in French. */
export function GET() {
  return new Response(toText("fr"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
