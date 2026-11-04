import { toJsonResume } from "@/lib/resume-formats";

export const dynamic = "force-static";

/** The resume in the JSON Resume standard (https://jsonresume.org/schema). */
export function GET() {
  return Response.json(toJsonResume("en"), {
    headers: { "access-control-allow-origin": "*" },
  });
}
