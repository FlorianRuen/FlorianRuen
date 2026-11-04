import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { RESUME_DATA as D } from "@/data/resume-data";
import { type Lang, t } from "@/lib/i18n";
import { clamp, popAt } from "../../components";
import { MONO, SANS } from "../../theme";
import type { Copy2 } from "../copy";
import { beat, K } from "../theme";

const SOFT = D.skills[0].items;
const NODES = 3;
/** Isometric projection: grid units → screen px. */
const U = 96;
const CX = Math.cos(Math.PI / 6) * U;
const CY = Math.sin(Math.PI / 6) * U;
const iso = (gx: number, gy: number, z = 0) => [(gx - gy) * CX, (gx + gy) * CY - z * U] as const;
const poly = (pts: (readonly [number, number])[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const POD_STEP = 1.6;
const NODE_STEP = 2.2;
const POD_H = 0.85;

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** An isometric box from (gx, gy, z) with footprint w × d and height h. */
const IsoBox: React.FC<{ gx: number; gy: number; z?: number; w: number; d: number; h: number; color: string; glow?: number; top?: number }> = ({
  gx,
  gy,
  z = 0,
  w,
  d,
  h,
  color,
  glow = 0,
  top = 0.9,
}) => {
  const P = (x: number, y: number, zz: number) => iso(gx + x, gy + y, z + zz);
  const a = (o: number) => Math.round(o * 255).toString(16).padStart(2, "0");
  return (
    <g style={{ filter: glow ? `drop-shadow(0 0 ${14 * glow}px ${color})` : undefined }}>
      {/* +gy face (front-left) */}
      <polygon points={poly([P(0, d, 0), P(w, d, 0), P(w, d, h), P(0, d, h)])} fill={`${color}${a(top * 0.45)}`} stroke={color} strokeWidth={2} />
      {/* +gx face (front-right) */}
      <polygon points={poly([P(w, 0, 0), P(w, d, 0), P(w, d, h), P(w, 0, h)])} fill={`${color}${a(top * 0.3)}`} stroke={color} strokeWidth={2} />
      {/* top */}
      <polygon points={poly([P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)])} fill={`${color}${a(top * 0.75)}`} stroke={color} strokeWidth={2} />
    </g>
  );
};

/** Bars 20-25: an isometric cluster; each soft skill is a pod that drops in and turns Running. */
export const Cluster: React.FC<{ copy: Copy2; lang: Lang }> = ({ copy, lang }) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 25) * 6;
  const podAt = (i: number) => beat(2) + i * beat(1.5);
  const running = SOFT.filter((_, i) => frame >= podAt(i) + 14).length;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* kubectl get pods (left) */}
      <div style={{ position: "absolute", left: 34, top: 28, width: 640, fontFamily: MONO, fontSize: 18, lineHeight: "32px", zIndex: 2 }}>
        <div style={{ color: K.dim, display: "flex" }}>
          <span style={{ width: 400 }}>NAME</span>
          <span style={{ width: 80 }}>READY</span>
          <span>STATUS</span>
        </div>
        {SOFT.map((s, i) => {
          if (frame < podAt(i)) return null;
          const ok = frame >= podAt(i) + 14;
          return (
            <div key={s.en} style={{ display: "flex" }}>
              <span style={{ width: 400, color: K.fg, whiteSpace: "nowrap" }}>{slug(t(s, lang))}-7f9c</span>
              <span style={{ width: 80, color: ok ? K.fg : K.dim }}>{ok ? "1/1" : "0/1"}</span>
              <span style={{ color: ok ? K.green : K.yellow }}>{ok ? "Running" : "ContainerCreating"}</span>
            </div>
          );
        })}
      </div>

      {/* isometric cluster */}
      <svg aria-hidden="true"
        viewBox="-480 -170 900 760"
        style={{ position: "absolute", left: 680, right: 0, top: 0, bottom: 0, width: "calc(100% - 680px)", height: "100%", overflow: "visible", transform: `translateY(${float}px)` }}
      >
        {/* node slabs */}
        {Array.from({ length: NODES }).map((_, n) => {
          const nodeIn = popAt(frame, n * 4, 12);
          const gy = n * NODE_STEP - 0.35;
          const [lx, ly] = iso(-0.35, gy + 1.65, 0.12);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static nodes
            <g key={n} opacity={Math.min(1, Math.max(0, nodeIn))} transform={`translate(0 ${(1 - nodeIn) * 60})`}>
              <IsoBox gx={-0.35} gy={gy} w={3 * POD_STEP + 0.1} d={1.7} h={0.12} color={K.blue} glow={0.6} top={0.5} />
              <text x={lx + 10} y={ly + 24} fill={K.key} fontFamily={MONO} fontSize={17} transform={`rotate(-30 ${lx + 10} ${ly + 24})`}>
                node-{["paris", "lyon", "nantes"][n]}-0{n + 1}
              </text>
            </g>
          );
        })}
        {/* pods, back to front */}
        {SOFT.map((s, i) => ({ s, i, gx: Math.floor(i / NODES) * POD_STEP, gy: (i % NODES) * NODE_STEP }))
          .sort((a, b) => a.gx + a.gy - (b.gx + b.gy))
          .map(({ s, i, gx, gy }) => {
            const start = podAt(i);
            if (frame < start) return null;
            const drop = interpolate(frame, [start, start + 10], [5, 0], { ...clamp, easing: (x) => x * x });
            const bounce = frame >= start + 10 ? Math.sin(Math.min(1, (frame - start - 10) / 8) * Math.PI) * 0.18 : 0;
            const ok = frame >= start + 14;
            return <IsoBox key={s.en} gx={gx} gy={gy} z={0.12 + drop + bounce} w={1} d={1} h={POD_H} color={ok ? K.green : K.yellow} glow={ok ? 1 : 0.4} />;
          })}
        {/* labels on top of everything */}
        {SOFT.map((s, i) => {
          const start = podAt(i);
          const o = interpolate(frame, [start + 8, start + 14], [0, 1], clamp);
          const [x, y] = iso(Math.floor(i / NODES) * POD_STEP + 0.5, (i % NODES) * NODE_STEP + 0.5, 0.12 + POD_H);
          const label = t(s, lang);
          const w = label.length * 13.5 + 28;
          return (
            <g key={s.en} opacity={o} transform={`translate(${x} ${y - 46 - (1 - o) * 10})`}>
              <line x1={0} y1={18} x2={0} y2={40} stroke={K.green} strokeWidth={2} />
              <rect x={-w / 2} y={-18} width={w} height={36} rx={18} fill="rgba(10,12,19,0.92)" stroke={K.green} strokeWidth={2} />
              <text x={0} y={7} textAnchor="middle" fill={K.fg} fontFamily={SANS} fontWeight={800} fontSize={22}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 34,
          bottom: 30,
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 64,
          color: K.fg,
          display: "flex",
          alignItems: "baseline",
          gap: 16,
        }}
      >
        <span style={{ color: K.green }}>
          {running}/{SOFT.length}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: 28, color: K.dim }}>{copy.podsRunning}</span>
      </div>
    </div>
  );
};
