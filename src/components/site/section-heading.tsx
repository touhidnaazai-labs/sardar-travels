import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AccentText } from "./accent-text";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  light,
  className,
  as: H = "h2",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  light?: boolean;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Reveal className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className={cn("eyebrow mb-4", light && "eyebrow-light")}>{eyebrow}</p>}
        <H
          className={cn(
            "text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] font-semibold",
            light ? "on-dark text-ivory" : "text-ink",
          )}
        >
          <AccentText text={title} />
        </H>
        {intro && (
          <p className={cn("mt-5 max-w-xl text-[1.05rem] leading-relaxed", light ? "text-ivory/75" : "text-muted")}>
            {intro}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
