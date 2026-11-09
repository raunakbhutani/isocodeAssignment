import Link from "next/link";
import { displayAvailability, formatPrice } from "../lib/format";
import CarPhoto from "./car-photo";
import { Badge } from "./ui/primitives";

export default function VehicleCard({ vehicle, priority = false }) {
  return (
    <article className="group min-w-0">
      <Link href={`/cars/${vehicle.slug}`} className="block">
        <div className="relative aspect-[1.42/1] overflow-hidden bg-[#f0f0ee]">
          <CarPhoto
            src={vehicle.image}
            alt={vehicle.imageAlt}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="transition-transform duration-500 group-hover:scale-[1.035]"
          />
          <span className="absolute left-4 top-4 bg-white/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--ink)]">
            {vehicle.imageIsAssumed === false ? "Vehicle photo" : "Placeholder photo"}
          </span>
          <span className="absolute right-4 top-4">
            <Badge tone={vehicle.status === "AVAILABLE" ? "success" : "warning"}>
              {displayAvailability(vehicle.status)}
            </Badge>
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {vehicle.year} · {vehicle.stockId}
            </p>
            <h3 className="mt-2 text-lg font-medium tracking-[-0.025em] text-[var(--ink)]">
              {vehicle.model} {vehicle.variant}
            </h3>
          </div>
          <span className="mt-1 text-[var(--muted)] transition-transform group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--ink)]">
          {formatPrice(vehicle.priceInr)}
          <span className="ml-1 text-xs font-normal text-[var(--muted)]">
            {vehicle.priceBasis === "EX_SHOWROOM" ? "ex-showroom" : "listing price"}
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)]">
          <span>{vehicle.fuel.charAt(0) + vehicle.fuel.slice(1).toLowerCase()}</span>
          <span>{vehicle.kilometres.toLocaleString("en-IN")} km</span>
          {vehicle.type === "USED" && (
            <span>
              Owners: {vehicle.previousOwners == null ? "not supplied" : vehicle.previousOwners}
              {vehicle.detailsAreAssumed && " (assumed)"}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
