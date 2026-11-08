import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { RESUME_DATA } from "@/data/resume-data";
import { toVCard } from "@/lib/resume-formats";

// Built once at deploy time: a static file, no server needed.
export const dynamic = "force-static";

/** /vcard.vcf – contact card (.vcf) with photo, to save me in a phone's contacts. */
export async function GET() {
  const avatar = await readFile(join(process.cwd(), "public/avatar.jpg"));
  const fileName = `${RESUME_DATA.name.replace(/\s+/g, "-")}.vcf`;
  return new Response(toVCard(avatar.toString("base64")), {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName}"`,
    },
  });
}
