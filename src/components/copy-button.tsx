"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

/** Small icon button that copies a value and confirms with a check mark for 2s. */
export function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or permission): the mailto link next to it still works.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
      className="relative -m-1 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden"
    >
      {copied ? (
        <CheckIcon className="pop-in size-3.5 text-primary" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
      <span
        aria-live="polite"
        className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 font-sans text-[10px] whitespace-nowrap text-background transition-all duration-200 ${
          copied ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
