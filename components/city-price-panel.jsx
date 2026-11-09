"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "../lib/format";
import { InfoNotice } from "./ui";

const initialState = { status: "loading", price: null, error: "" };

export default function CityPricePanel({ variantId, cities }) {
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");
  const [state, setState] = useState(cities.length ? initialState : { status: "empty", price: null, error: "" });

  useEffect(() => {
    if (!cityId || !variantId) return;

    const controller = new AbortController();
    fetch(`/api/prices?cityId=${encodeURIComponent(cityId)}&variantId=${encodeURIComponent(variantId)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Pricing could not be loaded.");
        setState({ status: "ready", price: result, error: "" });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({ status: "error", price: null, error: error.message });
        }
      });

    return () => controller.abort();
  }, [cityId, variantId]);

  return (
    <section className="mt-8 border border-[var(--line)] bg-[#f7f7f5] p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">On-road price estimate</p>
      <h2 className="mt-2 text-xl font-medium text-[var(--ink)]">Choose a city</h2>
      <label htmlFor="price-city" className="mt-4 block text-xs font-medium text-[var(--ink)]">
        City
        <select
          id="price-city"
          value={cityId}
          onChange={(event) => {
            setState(initialState);
            setCityId(event.target.value);
          }}
          className="mt-2 h-11 w-full border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]"
          disabled={cities.length === 0}
        >
          {cities.length === 0 && <option value="">No cities available</option>}
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}, {city.state}</option>
          ))}
        </select>
      </label>

      {state.status === "ready" && <PriceBreakdown price={state.price} />}
      {state.status === "loading" && (
        <p className="mt-5 text-sm text-[var(--muted)]" role="status">Loading current city pricing…</p>
      )}
      {state.status === "empty" && (
        <div className="mt-5"><InfoNotice title="Pricing unavailable:">Select a city with a configured price record.</InfoNotice></div>
      )}
      {state.status === "error" && (
        <div className="mt-5">
          <InfoNotice title="Pricing unavailable:">{state.error}</InfoNotice>
        </div>
      )}
      <p className="mt-4 text-[11px] leading-5 text-[var(--muted)]">
        On-road estimate = ex-showroom price + road tax + registration + insurance + accessories + other applicable charges. Prices may change; confirm the final price with Company A.
      </p>
    </section>
  );
}

function PriceBreakdown({ price }) {
  const { breakdown } = price;
  const dateOptions = { timeZone: "UTC" };
  const validity = `${new Date(price.effectiveFrom).toLocaleDateString("en-IN", dateOptions)} – ${
    price.effectiveUntil
      ? new Date(price.effectiveUntil).toLocaleDateString("en-IN", dateOptions)
      : "until updated"
  }`;

  return (
    <>
      {price.isAssumed && (
        <div className="mt-5">
          <InfoNotice title="Assumed demo prices:">
            These example charges were not supplied or approved by Company A.
          </InfoNotice>
        </div>
      )}
      <div className="mt-5 space-y-3 border-t border-[var(--line)] pt-4 text-xs">
        <PriceLine label="Ex-showroom price" amount={breakdown.exShowroomPriceInr} />
        <PriceLine label="Road tax" amount={breakdown.roadTaxInr} />
        <PriceLine label="Registration" amount={breakdown.registrationFeeInr} />
        <PriceLine label="Insurance" amount={breakdown.insuranceInr} />
        <PriceLine label="Accessories" amount={breakdown.accessoriesInr} />
        <PriceLine label="Other applicable charges" amount={breakdown.otherChargesInr} />
      </div>
      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <div className="flex items-center justify-between gap-4 text-sm font-medium text-[var(--ink)]">
          <span>Estimated on-road total</span>
          <span>{formatPrice(breakdown.totalInr)}</span>
        </div>
        <p className="mt-2 text-[10px] text-[var(--muted)]">Price validity: {validity}</p>
      </div>
    </>
  );
}

function PriceLine({ label, amount }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[var(--muted)]">
      <span>{label}</span>
      <span className="text-right text-[var(--ink)]">{formatPrice(amount)}</span>
    </div>
  );
}
