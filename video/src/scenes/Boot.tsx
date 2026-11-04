import { interpolate, useCurrentFrame } from "remotion";
import { clamp, SceneShell } from "../components";
import type { Copy } from "../copy";
import { C, MONO, SCENES } from "../theme";

/** 0-6 s: a terminal boots "Florian" while the music builds up. */
export const Boot: React.FC<{ copy: Copy }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const cmd = copy.bootCmd;
  const typed = Math.floor(interpolate(frame, [8, 38], [0, cmd.length], clamp));
  const progress = interpolate(frame, [110, 168], [0, 1], clamp);
  const zoom = interpolate(frame, [150, 180], [1, 1.25], clamp);

  return (
    <SceneShell duration={SCENES.boot.duration}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom})`,
        }}
      >
        <div
          style={{
            width: 1180,
            borderRadius: 18,
            border: `1px solid ${C.border}`,
            background: "rgba(10,12,22,0.85)",
            boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 80px ${C.primary}33`,
            overflow: "hidden",
            fontFamily: MONO,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "18px 22px",
              borderBottom: `1px solid ${C.border}`,
              alignItems: "center",
            }}
          >
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
            ))}
            <div style={{ marginLeft: 16, color: C.muted, fontSize: 20 }}>~/florian-ruen</div>
          </div>
          <div style={{ padding: "34px 40px 40px", fontSize: 34, lineHeight: 1.65 }}>
            <div>
              <span style={{ color: C.green }}>➜ </span>
              <span style={{ color: C.cyan }}>~ </span>
              <span style={{ color: C.fg }}>{cmd.slice(0, typed)}</span>
              {typed < cmd.length && (
                <span style={{ background: C.fg, opacity: frame % 14 < 7 ? 1 : 0 }}>&nbsp;</span>
              )}
            </div>
            {copy.bootLines.map(([label, status], i) => {
              const at = 45 + i * 15; // one line per beat
              if (frame < at) return null;
              const dots = ".".repeat(Math.max(2, 32 - label.length));
              return (
                <div key={label} style={{ color: C.muted }}>
                  <span style={{ color: C.blue }}>[{String(i + 1).padStart(2, "0")}]</span> {label}
                  <span style={{ opacity: 0.4 }}> {dots} </span>
                  <span style={{ color: frame - at < 4 ? C.fg : C.green, fontWeight: 700 }}>
                    {status}
                  </span>
                </div>
              );
            })}
            {frame >= 105 && (
              <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 24 }}>
                <div
                  style={{
                    flex: 1,
                    height: 16,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progress * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${C.cyan}, ${C.blue}, ${C.violet})`,
                      boxShadow: `0 0 24px ${C.cyan}`,
                    }}
                  />
                </div>
                <div style={{ color: C.fg, width: 110, textAlign: "right" }}>
                  {Math.round(progress * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
