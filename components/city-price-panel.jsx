import { formatPrice } from "../lib/format";
import { InfoNotice } from "./ui";

const notProvided = "Not provided";

export default function CityPricePanel({ vehicle }) {
  if (vehicle.type !== "NEW") return null;

  return (
    <section className="mt-8 border border-[var(--line)] bg-[#f7f7f5] p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">On-road price estimate</p>
      <h2 className="mt-2 text-xl font-medium text-[var(--ink)]">Choose a city</h2>
      <label htmlFor="price-city" className="mt-4 block text-xs font-medium text-[var(--ink)]">
        City
        <select
          id="price-city"
          defaultValue="Lucknow"
          className="mt-2 h-11 w-full border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="Lucknow">Lucknow, Uttar Pradesh</option>
        </select>
      </label>
      <div className="mt-5 space-y-3 border-t border-[var(--line)] pt-4 text-xs">
        <PriceLine label="Ex-showroom price" value={formatPrice(vehicle.priceInr)} />
        <PriceLine label="Road tax" value={notProvided} />
        <PriceLine label="Registration" value={notProvided} />
        <PriceLine label="Insurance" value={notProvided} />
        <PriceLine label="Other applicable charges" value={notProvided} />
      </div>
      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <div className="flex items-center justify-between gap-4 text-sm font-medium text-[var(--ink)]">
          <span>Estimated on-road total</span>
          <span>Unavailable</span>
        </div>
      </div>
      <div className="mt-4">
        <InfoNotice title="Estimate not calculated:">
          Company-approved city tax and fee inputs are not available yet. The listed ex-showroom price is not an on-road price.
        </InfoNotice>
      </div>
    </section>
  );
}

function PriceLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[var(--muted)]">
      <span>{label}</span>
      <span className="text-right text-[var(--ink)]">{value}</span>
    </div>
  );
}
