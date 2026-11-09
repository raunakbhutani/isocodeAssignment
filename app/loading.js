import { Container } from "../components/ui";

export default function Loading() {
  return (
    <main className="flex-1 bg-[#f7f7f5] py-12" aria-label="Loading page">
      <Container>
        <div className="h-4 w-32 animate-pulse bg-stone-200" />
        <div className="mt-5 h-12 max-w-xl animate-pulse bg-stone-200" />
        <div className="mt-3 h-5 max-w-md animate-pulse bg-stone-200" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="aspect-[1.42/1] bg-stone-200" />
              <div className="mt-4 h-4 w-2/3 bg-stone-200" />
              <div className="mt-3 h-4 w-1/3 bg-stone-200" />
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
