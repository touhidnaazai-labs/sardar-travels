import { Fragment } from "react";

/**
 * Renders "Plain words *italic accent*" — the starred phrase is highlighted
 * in the accent colour. Editors can use * in any heading.
 */
export function AccentText({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="accent-phrase">{p}</span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Plain-text version (for <title>, alt text, etc.). */
export const stripAccent = (text: string) => text.replace(/\*([^*]+)\*/g, "$1");
