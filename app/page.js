import Link from "next/link";
import { vehicles } from "../lib/mock-data";
import VehicleCard from "../components/vehicle-card";
import CarPhoto from "../components/car-photo";
import { ButtonLink, Container, DemoNotice, Eyebrow, SectionTitle } from "../components/ui";

export default function Home() {
  const featured = vehicles.slice(0, 3);

  return (
    <main className="flex-1">
      <section className="hero relative flex min-h-[620px] items-end overflow-hidden bg-[#252a2d] sm:min-h-[690px]">
        <CarPhoto
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90"
          alt="Refined sports car on an open mountain road"
          className="object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        <Container className="relative z-10 pb-14 pt-28 sm:pb-20">
          <div className="max-w-2xl text-white">
            <Eyebrow light>Company A · Driven by possibility</Eyebrow>
            <h1 className="mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.06em] sm:text-7xl">
              The road ahead,<br />beautifully considered.
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
              Find a car that feels like it was made for you. Explore a considered collection of new and pre-owned vehicles.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/new-cars">Explore new cars</ButtonLink>
              <ButtonLink href="/used-cars" variant="light">Discover pre-owned</ButtonLink>
            </div>
          </div>
        </Container>
        <div className="absolute bottom-6 right-8 hidden text-[10px] uppercase tracking-[0.15em] text-white/70 md:block">
          Sample imagery for preview
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <Container>
          <div className="mb-8"><DemoNotice /></div>
          <SectionTitle
            eyebrow="A considered collection"
            title="Meet your next favourite."
            description="Thoughtfully selected models, each ready for its next journey."
            action={<Link href="/new-cars" className="text-sm font-medium text-[var(--ink)] underline decoration-[var(--accent)] underline-offset-8">View all vehicles ↗</Link>}
          />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} />)}
          </div>
        </Container>
      </section>

      <section className="bg-[#f5f5f2] py-16 sm:py-24">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center md:gap-20">
          <div className="relative aspect-[1.2/1] overflow-hidden bg-[#e8e7e3]">
            <CarPhoto
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85"
              alt="A premium vehicle ready for a closer look"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="max-w-xl">
            <Eyebrow>More than a showroom</Eyebrow>
            <h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">
              Good decisions start with a great drive.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              Take the time to get to know a car. Our consultants are here to answer your questions and help you find the right fit.
            </p>
            <ButtonLink href="/book-test-drive" className="mt-7">Book a test drive</ButtonLink>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <Container className="flex flex-col gap-7 border-y border-[var(--line)] py-10 sm:flex-row sm:items-center sm:justify-between sm:py-14">
          <div>
            <Eyebrow>Here when you need us</Eyebrow>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[var(--ink)]">A thoughtful journey, from the first hello.</h2>
          </div>
          <Link href="/new-cars" className="shrink-0 text-sm font-medium text-[var(--ink)] underline decoration-[var(--accent)] underline-offset-8">Start exploring ↗</Link>
        </Container>
      </section>
    </main>
  );
}
