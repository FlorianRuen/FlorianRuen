import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import type { Lang } from "@/lib/i18n";
import { clamp } from "../../components";
import { MONO } from "../../theme";
import { Code, charCount } from "../code";
import type { Copy2 } from "../copy";
import { bar, K } from "../theme";

export function yamlSource(copy: Copy2) {
  return [
    "apiVersion: apps/v1",
    "kind: Deployment",
    "metadata:",
    "  name: florian",
    "  labels:",
    '    role: "tech-leader"',
    '    city: "paris"',
    "spec:",
    `  replicas: 1  ${copy.yamlReplicas}`,
    "  template:",
    "    spec:",
    "      containers:",
    "        - name: florian",
    `          image: "${D.contact.social[0].url.replace("https://", "")}:latest"`,
    "          resources:",
    '            coffee: "3/day"',
  ];
}

/** Bars 18-20 (musical break): the deployment manifest, then kubectl apply. */
export const Apply: React.FC<{ copy: Copy2; lang: Lang }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const lines = yamlSource(copy);
  const chars = interpolate(frame, [0, bar(1.2)], [0, charCount(lines)], clamp);
  const cmdAt = bar(1.25);
  const out = (k: number) => frame >= cmdAt + 10 + k * 6;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div style={{ flex: 1, paddingTop: 22 }}>
        <Code lines={lines} lang="yaml" chars={chars} frame={frame} fontSize={25} />
      </div>
      <div
        style={{
          width: 640,
          background: K.chrome,
          borderLeft: `1px solid ${K.border}`,
          padding: "26px 30px",
          fontFamily: MONO,
          fontSize: 22,
          lineHeight: 1.75,
          opacity: interpolate(frame, [cmdAt - 4, cmdAt + 4], [0, 1], clamp),
        }}
      >
        <div style={{ color: K.dim, fontSize: 15, letterSpacing: 2, marginBottom: 12 }}>TERMINAL</div>
        <div>
          <span style={{ color: K.green }}>➜ </span>
          <span style={{ color: K.fg }}>kubectl apply -f florian.yaml</span>
        </div>
        {out(0) && (
          <div>
            deployment.apps/florian <span style={{ color: K.green }}>{copy.created}</span>
          </div>
        )}
        {out(1) && (
          <div>
            service/leadership <span style={{ color: K.green }}>{copy.configured}</span>
          </div>
        )}
        {out(2) && (
          <div>
            ingress/florianruen.fr <span style={{ color: K.green }}>{copy.configured}</span>
          </div>
        )}
        {out(3) && (
          <div style={{ marginTop: 10 }}>
            <span style={{ color: K.green }}>➜ </span>
            <span style={{ color: K.fg }}>kubectl get pods -w</span>
            <span style={{ display: "inline-block", width: 12, height: 24, marginLeft: 6, background: K.cyan, verticalAlign: "middle", opacity: frame % 20 < 12 ? 1 : 0.2 }} />
          </div>
        )}
      </div>
    </div>
  );
};
