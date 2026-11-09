const PRICE_COMPONENTS = [
  "exShowroomPriceInr",
  "roadTaxBasisPoints",
  "registrationFeeInr",
  "insuranceInr",
  "accessoriesInr",
  "otherChargesInr",
];

export function selectCityPrice(records, cityId, variantId, asOf = new Date()) {
  const timestamp = asOf.getTime();
  if (!Number.isFinite(timestamp)) throw new Error("The requested pricing date is invalid.");

  return records
    .filter((record) => {
      if (record.cityId !== cityId || record.variantId !== variantId) return false;
      const start = record.effectiveFrom instanceof Date
        ? record.effectiveFrom.getTime()
        : new Date(record.effectiveFrom).getTime();
      const end = record.effectiveUntil == null
        ? Number.POSITIVE_INFINITY
        : record.effectiveUntil instanceof Date
          ? record.effectiveUntil.getTime()
          : new Date(record.effectiveUntil).getTime();
      return Number.isFinite(start) && Number.isFinite(end) && start <= timestamp && timestamp <= end;
    })
    .sort((first, second) => new Date(second.effectiveFrom) - new Date(first.effectiveFrom))[0] ?? null;
}

export function calculateOnRoadPrice(cityPrice, asOf = new Date()) {
  if (!cityPrice || typeof cityPrice !== "object") {
    throw new Error("City pricing is not configured for this vehicle.");
  }

  const startsAt = new Date(cityPrice.effectiveFrom).getTime();
  const endsAt = cityPrice.effectiveUntil == null
    ? Number.POSITIVE_INFINITY
    : new Date(cityPrice.effectiveUntil).getTime();
  const timestamp = asOf.getTime();
  if (
    !Number.isFinite(startsAt) ||
    !Number.isFinite(timestamp) ||
    (cityPrice.effectiveUntil != null && !Number.isFinite(endsAt)) ||
    endsAt < startsAt
  ) {
    throw new Error("City pricing has an invalid validity period.");
  }
  if (timestamp < startsAt || timestamp > endsAt) {
    throw new Error("City pricing is not valid on the selected date.");
  }

  const missingComponent = PRICE_COMPONENTS.find(
    (name) => !Number.isSafeInteger(cityPrice[name]) || cityPrice[name] < 0,
  );
  if (missingComponent) {
    throw new Error(`City pricing is missing a valid ${missingComponent} component.`);
  }
  if (cityPrice.exShowroomPriceInr === 0) {
    throw new Error("A positive ex-showroom price is required.");
  }
  if (cityPrice.roadTaxBasisPoints > 10000) {
    throw new Error("Road-tax basis points cannot exceed 10000.");
  }

  const roadTaxInr = Math.round(
    (cityPrice.exShowroomPriceInr * cityPrice.roadTaxBasisPoints) / 10000,
  );
  const totalInr =
    cityPrice.exShowroomPriceInr +
    roadTaxInr +
    cityPrice.registrationFeeInr +
    cityPrice.insuranceInr +
    cityPrice.accessoriesInr +
    cityPrice.otherChargesInr;
  if (!Number.isSafeInteger(totalInr) || totalInr > 2_147_483_647) {
    throw new Error("On-road total exceeds the supported database integer range.");
  }

  return {
    exShowroomPriceInr: cityPrice.exShowroomPriceInr,
    roadTaxInr,
    registrationFeeInr: cityPrice.registrationFeeInr,
    insuranceInr: cityPrice.insuranceInr,
    accessoriesInr: cityPrice.accessoriesInr,
    otherChargesInr: cityPrice.otherChargesInr,
    totalInr,
  };
}
