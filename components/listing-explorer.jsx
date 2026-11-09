"use client";

import { useMemo, useState } from "react";
import VehicleCard from "./vehicle-card";
import { InfoNotice } from "./ui";
import { Button } from "./ui/primitives";

export default function ListingExplorer({ vehicles, used = false }) {
  // Filters are local for instant feedback; the displayed inventory comes from PostgreSQL.
  const [model, setModel] = useState("All models");
  const [fuel, setFuel] = useState("All fuels");
  const [variant, setVariant] = useState("All variants");
  const [year, setYear] = useState("All years");
  const [maximumPrice, setMaximumPrice] = useState("");

  const models = ["All models", ...new Set(vehicles.map((vehicle) => vehicle.model))];
  const fuels = ["All fuels", ...new Set(vehicles.map((vehicle) => vehicle.fuel))];
  const variants = ["All variants", ...new Set(vehicles.map((vehicle) => vehicle.variant))];
  const years = ["All years", ...new Set(vehicles.map((vehicle) => String(vehicle.year)))];
  const hasFilters = model !== "All models" || fuel !== "All fuels" ||
    variant !== "All variants" || year !== "All years" || maximumPrice !== "";

  const visibleVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        return (
          (model === "All models" || vehicle.model === model) &&
          (fuel === "All fuels" || vehicle.fuel === fuel) &&
          (used || variant === "All variants" || vehicle.variant === variant) &&
          (!used || year === "All years" || String(vehicle.year) === year) &&
          (!used || maximumPrice === "" || vehicle.priceInr <= Number(maximumPrice))
        );
      }),
    [fuel, maximumPrice, model, used, variant, vehicles, year],
  );

  return (
    <>
      <InfoNotice title="Live inventory:">
        Filters narrow the current database inventory in this browser.
      </InfoNotice>
      <div className="my-7 grid gap-3 border border-[var(--line)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Filter label="Model" value={model} onChange={setModel} options={models} />
        <Filter label="Fuel" value={fuel} onChange={setFuel} options={fuels} />
        {used ? (
          <>
            <Filter label="Year" value={year} onChange={setYear} options={years} />
            <label className="flex flex-col gap-2 text-xs font-medium text-[var(--ink)]">
              Maximum price (₹)
              <input
                type="number"
                min="0"
                value={maximumPrice}
                onChange={(event) => setMaximumPrice(event.target.value)}
                placeholder="No maximum"
                className="h-11 w-full border border-[var(--line)] px-3 text-sm font-normal outline-none focus:border-[var(--accent)]"
              />
            </label>
          </>
        ) : (
          <Filter label="Variant" value={variant} onChange={setVariant} options={variants} />
        )}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs text-[var(--muted)]">
          Showing {visibleVehicles.length} of {vehicles.length} vehicles
        </p>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="min-h-9 px-2 text-xs underline underline-offset-4"
            onClick={() => {
              setModel("All models");
              setFuel("All fuels");
              setVariant("All variants");
              setYear("All years");
              setMaximumPrice("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {visibleVehicles.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visibleVehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.stockId} vehicle={vehicle} priority={index === 0} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-[var(--line)] bg-white px-5 py-16 text-center">
          <h2 className="text-lg font-medium text-[var(--ink)]">No matching vehicles</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Try changing or clearing the filters.</p>
        </div>
      )}
    </>
  );
}

function Filter({ label, value, onChange, options }) {
  const id = `filter-${label.toLowerCase()}`;

  return (
    <label htmlFor={id} className="flex flex-col gap-2 text-xs font-medium text-[var(--ink)]">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full border border-[var(--line)] bg-white px-3 text-sm font-normal outline-none focus:border-[var(--accent)]"
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
