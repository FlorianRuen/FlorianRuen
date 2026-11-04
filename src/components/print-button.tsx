"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";

/** Opens the browser print dialog; the print stylesheet produces a clean PDF. */
export function PrintButton({ label }: { label: string }) {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <DownloadIcon className="mr-2 size-4" />
      {label}
    </Button>
  );
}
