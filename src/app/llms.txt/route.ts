import { toLlmsTxt } from "@/lib/resume-formats";

// Built once at deploy time: a static file, no server needed.
export const dynamic = "force-static";

/** /llms.txt – the resume as Markdown for AI assistants (https://llmstxt.org). */
export function GET() {
  return new Response(toLlmsTxt(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
