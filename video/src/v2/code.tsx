import type React from "react";
import { MONO } from "../theme";
import { K } from "./theme";

type Lang = "go" | "yaml";
type Tok = { text: string; color: string };

const KEYWORDS: Record<Lang, Set<string>> = {
  go: new Set(["package", "type", "struct", "var", "func", "return", "import", "const"]),
  yaml: new Set(["true", "false", "null"]),
};
const BUILTIN_TYPES = new Set(["string", "int", "bool", "error"]);

const PATTERNS: Record<Lang, RegExp> = {
  go: /(\/\/.*$)|("[^"]*"?)|(\b\d+\b)|([A-Za-z_][\w.]*)|(\s+)|(.)/g,
  yaml: /(#.*$)|("[^"]*"?)|(\b\d+\b)|([A-Za-z_][\w.-]*)|(\s+)|(.)/g,
};

/** A tiny, good-enough highlighter for the Go and YAML snippets of the video. */
export function tokenize(line: string, lang: Lang): Tok[] {
  const out: Tok[] = [];
  for (const m of line.matchAll(PATTERNS[lang])) {
    const [text, comment, str, num, ident] = m;
    const rest = line.slice((m.index ?? 0) + text.length);
    let color = K.fg;
    if (comment) color = K.comment;
    else if (str) color = K.string;
    else if (num) color = K.number;
    else if (ident) {
      if (KEYWORDS[lang].has(ident)) color = K.keyword;
      else if (lang === "yaml" && /^\s*:/.test(rest)) color = K.key;
      else if (lang === "go" && BUILTIN_TYPES.has(ident)) color = K.type;
      else if (lang === "go" && /^\(/.test(rest)) color = K.func;
      else if (lang === "go" && /^[A-Z]/.test(ident)) color = K.type;
    } else if (/[{}()[\]]/.test(text)) color = K.dim;
    out.push({ text, color });
  }
  return out;
}

/** Total characters (newlines included) to fully type `lines`. */
export const charCount = (lines: string[]) => lines.reduce((n, l) => n + l.length + 1, 0);

/**
 * Highlighted code with line numbers, typed up to `chars` characters.
 * `activeLine` gets the current-line background (defaults to the cursor line).
 */
export const Code: React.FC<{
  lines: string[];
  lang: Lang;
  chars?: number;
  fontSize?: number;
  cursor?: boolean;
  frame: number;
  highlightLine?: number;
}> = ({ lines, lang, chars = Number.POSITIVE_INFINITY, fontSize = 26, cursor = true, frame, highlightLine }) => {
  let left = chars;
  let cursorLine = -1;
  const lh = Math.round(fontSize * 1.55);
  return (
    <div style={{ fontFamily: MONO, fontSize, lineHeight: `${lh}px` }}>
      {lines.map((line, i) => {
        const visible = Math.max(0, Math.min(line.length, left));
        const typedAll = left > line.length;
        if (left >= 0 && !typedAll && cursorLine === -1) cursorLine = i;
        left -= line.length + 1;
        if (visible === 0 && !typedAll && cursorLine !== i) return null;
        let shown = visible;
        const toks = tokenize(line, lang);
        const isCur = cursorLine === i || highlightLine === i;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
          <div key={i} style={{ display: "flex", background: isCur ? K.line : "transparent" }}>
            <span style={{ width: 70, flexShrink: 0, paddingRight: 24, textAlign: "right", color: isCur ? K.dim : K.faint }}>
              {i + 1}
            </span>
            <span style={{ whiteSpace: "pre" }}>
              {toks.map((tk, j) => {
                if (shown <= 0) return null;
                const text = tk.text.slice(0, shown);
                shown -= tk.text.length;
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                  <span key={j} style={{ color: tk.color, fontStyle: tk.color === K.comment ? "italic" : "normal" }}>
                    {text}
                  </span>
                );
              })}
              {cursor && cursorLine === i && (
                <span
                  style={{
                    display: "inline-block",
                    width: 3,
                    height: fontSize * 1.15,
                    marginBottom: -fontSize * 0.2,
                    background: K.cyan,
                    opacity: frame % 20 < 12 ? 1 : 0.15,
                  }}
                />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};
