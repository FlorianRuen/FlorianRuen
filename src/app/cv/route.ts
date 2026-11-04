import { toText } from "@/lib/resume-formats";

// Built once at deploy time: a static file, no server needed.
export const dynamic = "force-static";

/** `curl florianruen.fr/cv` – the resume as plain text, in English. */
export function GET() {
  return new Response(toText("en"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
