import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal, safe Markdown renderer for admin-edited pages: ## / ### headings,
 * "- " lists, paragraphs, **bold**, *italic* and [links](url). Produces React
 * elements only — no raw HTML is ever injected.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else {
      const [, label, href] = tok.match(/\[([^\]]+)\]\(([^)\s]+)\)/)!;
      const safe = /^(https?:|mailto:|tel:|\/|#)/.test(href) ? href : "#";
      out.push(
        safe.startsWith("/") ? <Link key={key} href={safe}>{label}</Link> : <a key={key} href={safe} rel="noopener noreferrer" target={safe.startsWith("http") ? "_blank" : undefined}>{label}</a>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="prose-site">
      {blocks.map((b, i) => {
        const block = b.trim();
        if (!block) return null;
        if (block.startsWith("### ")) return <h3 key={i}>{inline(block.slice(4), `h${i}`)}</h3>;
        if (block.startsWith("## ")) return <h2 key={i}>{inline(block.slice(3), `h${i}`)}</h2>;
        const lines = block.split("\n");
        if (lines.every((l) => /^[-*] /.test(l.trim()))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.trim().slice(2), `l${i}-${j}`)}</li>)}</ul>;
        }
        return <p key={i}>{lines.flatMap((l, j) => (j ? [<br key={`br${j}`} />, ...inline(l, `p${i}-${j}`)] : inline(l, `p${i}-${j}`)))}</p>;
      })}
    </div>
  );
}
