import Image from "next/image";
import type { MediaMeta } from "@/lib/data";
import { cn } from "@/lib/utils";

type Props = {
  media: MediaMeta | undefined | null;
  alt?: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Fill the nearest positioned parent (default) or render at intrinsic ratio. */
  fill?: boolean;
};

/** Optimised, blur-up image backed by the media library. Renders a tasteful fallback when missing. */
export function MediaImage({ media, alt, sizes, className, priority, fill = true }: Props) {
  if (!media) {
    return (
      <div
        aria-hidden
        className={cn(
          "bg-[radial-gradient(circle_at_30%_20%,var(--accent-soft),var(--sand)_45%,var(--ink-soft))]",
          fill ? "absolute inset-0" : "aspect-[4/3] w-full",
          className,
        )}
      />
    );
  }
  const common = {
    src: media.src,
    sizes,
    priority,
    placeholder: media.blurDataUrl ? ("blur" as const) : ("empty" as const),
    blurDataURL: media.blurDataUrl ?? undefined,
  };
  return fill ? (
    <Image {...common} alt={alt ?? media.alt} fill className={cn("object-cover", className)} />
  ) : (
    <Image {...common} alt={alt ?? media.alt} width={media.width} height={media.height} className={cn("h-auto w-full", className)} />
  );
}
