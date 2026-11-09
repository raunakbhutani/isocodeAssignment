export function calculateOnRoadPrice(exShowroomPriceInr, cityPrice) {
  const amounts = [
    exShowroomPriceInr,
    cityPrice.roadTaxBasisPoints,
    cityPrice.registrationFeeInr,
    cityPrice.insuranceInr,
    cityPrice.otherChargesInr,
  ];
  if (!amounts.every(Number.isSafeInteger) || amounts.some((amount) => amount < 0)) {
    throw new Error("On-road price inputs must be non-negative whole-number rupee amounts.");
  }
  if (cityPrice.roadTaxBasisPoints > 10000) {
    throw new Error("Road-tax basis points cannot exceed 10000.");
  }

  const roadTaxInr = Math.round((exShowroomPriceInr * cityPrice.roadTaxBasisPoints) / 10000);
  const totalInr =
    exShowroomPriceInr +
    roadTaxInr +
    cityPrice.registrationFeeInr +
    cityPrice.insuranceInr +
    cityPrice.otherChargesInr;
  if (!Number.isSafeInteger(totalInr) || totalInr > 2_147_483_647) {
    throw new Error("On-road total exceeds the supported database integer range.");
  }
  return {
    exShowroomPriceInr,
    roadTaxInr,
    registrationFeeInr: cityPrice.registrationFeeInr,
    insuranceInr: cityPrice.insuranceInr,
    otherChargesInr: cityPrice.otherChargesInr,
    totalInr,
  };
}
