"use client";

import { useMemo, useState } from "react";
import VehicleCard from "./vehicle-card";
import { DemoNotice } from "./ui";

export default function ListingExplorer({ vehicles }) {
  // Local state filters the sample list in the browser; it does not call an API.
  const [query, setQuery] = useState("");
  const [fuelType, setFuelType] = useState("All fuel types");

  const fuelTypes = ["All fuel types", ...new Set(vehicles.map((vehicle) => vehicle.fuel))];
  const visibleVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const matchesQuery = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.stockId}`.toLowerCase().includes(query.toLowerCase());
        const matchesFuel = fuelType === "All fuel types" || vehicle.fuel === fuelType;
        return matchesQuery && matchesFuel;
      }),
    [fuelType, query, vehicles],
  );

  return (
    <>
      <DemoNotice />
      <div className="my-8 grid gap-3 border border-[var(--line)] bg-white p-3 sm:grid-cols-[1fr_auto] sm:p-4">
        <label className="sr-only" htmlFor="vehicle-search">Search vehicles</label>
        <input
          id="vehicle-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by model"
          className="h-12 min-w-0 border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--accent)]"
        />
        <label className="sr-only" htmlFor="fuel-type">Filter by fuel type</label>
        <select
          id="fuel-type"
          value={fuelType}
          onChange={(event) => setFuelType(event.target.value)}
          className="h-12 border border-[var(--line)] bg-white px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        >
          {fuelTypes.map((style) => <option key={style}>{style}</option>)}
        </select>
      </div>

      <p className="mb-5 text-xs text-[var(--muted)]">
        Showing {visibleVehicles.length} {visibleVehicles.length === 1 ? "vehicle" : "vehicles"}
      </p>
      {visibleVehicles.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visibleVehicles.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} />)}
        </div>
      ) : (
        <div className="border border-dashed border-[var(--line)] py-16 text-center text-sm text-[var(--muted)]">
          No vehicles match those filters. Try a different search.
        </div>
      )}
    </>
  );
}
