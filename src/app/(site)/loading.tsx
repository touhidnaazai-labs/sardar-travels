export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="min-h-[46svh] bg-ink" />
      <div className="container-x space-y-6 py-16">
        <div className="skeleton h-9 w-1/2" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[16/11] w-full" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
