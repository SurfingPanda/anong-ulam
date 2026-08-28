"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Download, Copy, Check, Share2, Loader2 } from "lucide-react";

import {
  renderShareCard,
  shareCaption,
  type ShareCardInput,
} from "@/lib/share-card";

interface TipidShareCardProps {
  data: ShareCardInput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TipidShareCard({
  data,
  open,
  onOpenChange,
}: TipidShareCardProps) {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const [rendering, setRendering] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open || !data) return;
    let cancelled = false;
    setRendering(true);
    setDataUrl(null);
    renderShareCard(data)
      .then((res) => {
        if (cancelled) return;
        setDataUrl(res.dataUrl);
        setBlob(res.blob);
      })
      .catch(() => {})
      .finally(() => !cancelled && setRendering(false));
    return () => {
      cancelled = true;
    };
  }, [open, data]);

  const caption = data ? shareCaption(data) : "";
  const fileName = data
    ? `tipid-${data.dish.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`
    : "tipid-card.png";

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    if (!blob || !data) return;
    const file = new File([blob], fileName, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: caption });
      } else {
        await navigator.share?.({ text: caption });
      }
    } catch {
      /* user cancelled or unsupported */
    }
  }

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 bg-background p-5 shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-foreground">
              Tipid Breakdown Card
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="overflow-hidden rounded-xl border bg-secondary/40">
            {rendering || !dataUrl ? (
              <div className="flex aspect-square items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="Tipid breakdown card"
                className="aspect-square w-full object-contain"
              />
            )}
          </div>

          <p className="mt-3 rounded-lg bg-secondary/60 p-2.5 text-sm text-foreground">
            {caption}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={dataUrl ?? "#"}
              download={fileName}
              aria-disabled={!dataUrl}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 aria-disabled:pointer-events-none aria-disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              I-download
            </a>
            <button
              type="button"
              onClick={copyCaption}
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-border px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Nakopya!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Kopyahin ang Text
                </>
              )}
            </button>
            {canNativeShare ? (
              <button
                type="button"
                onClick={nativeShare}
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-border px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
