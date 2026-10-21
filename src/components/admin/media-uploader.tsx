"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadMedia } from "@/app/actions/admin/media";
import { cn } from "@/lib/utils";

export function MediaUploader() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [drag, setDrag] = useState(false);

  const send = (files: File[]) => {
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    start(async () => {
      const res = await uploadMedia(fd);
      setMsg({ ok: res.ok, text: res.message ?? "" });
      router.refresh();
    });
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); send(Array.from(e.dataTransfer.files)); }}
        className={cn("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors", drag ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-ink/40")}
      >
        {pending ? <Loader2 className="size-6 animate-spin text-accent" /> : <Upload className="size-6 text-accent" />}
        <span className="font-semibold">{pending ? "Uploading…" : "Drop images here or click to upload"}</span>
        <span className="text-xs text-muted">JPEG, PNG, WebP or AVIF up to 12 MB. Photos are resized and stripped of location data.</span>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { send(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      </label>
      {msg && <p role="status" className={cn("mt-3 text-sm", msg.ok ? "text-forest" : "text-[#a63d26]")}>{msg.text}</p>}
    </div>
  );
}
