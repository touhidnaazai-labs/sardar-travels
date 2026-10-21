import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[80svh] items-end overflow-hidden bg-ink text-ivory">
      <div className="container-x pt-40 pb-20">
        <p className="eyebrow eyebrow-light mb-5">404 · Off the map</p>
        <h1 className="max-w-3xl text-[clamp(2.6rem,7vw,6rem)] leading-[0.98] font-medium">This road doesn’t lead anywhere.</h1>
        <p className="mt-6 max-w-lg text-lg text-ivory/70">The page you were looking for may have moved. Let’s get you back on route.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/tours" className="btn btn-primary">Browse tours</Link>
          <Link href="/" className="btn btn-ghost-light">Go home</Link>
        </div>
      </div>
    </section>
  );
}
