// Configurable emission factors (kg CO2e per unit).
// Sources: simplified/rounded averages from common public carbon-accounting
// references (EPA, DEFRA) — adequate for an educational estimator, not audit-grade.
export const EMISSION_FACTORS = {
  transport: {
    car_petrol_km: 0.192,
    car_diesel_km: 0.171,
    car_electric_km: 0.053,
    bus_km: 0.089,
    train_km: 0.041,
    bike_km: 0,
    walk_km: 0,
    flight_short_km: 0.255,
    flight_long_km: 0.15,
  },
  energy: {
    electricity_kwh: 0.475,
    lpg_kg: 2.98,
    natural_gas_m3: 2.03,
  },
  water: {
    water_liter: 0.000344, // includes treatment + heating share, simplified
  },
  waste: {
    landfill_kg: 0.58,
    recycled_kg: 0.11,
    composted_kg: 0.02,
  },
};

export function calculateCo2e(category, activityType, quantity) {
  const factor = EMISSION_FACTORS?.[category]?.[activityType];
  if (factor === undefined) return null;
  return Math.round(factor * quantity * 1000) / 1000;
}

export function unitFor(category, activityType) {
  if (activityType.endsWith("_km")) return "km";
  if (activityType.endsWith("_kwh")) return "kWh";
  if (activityType.endsWith("_kg")) return "kg";
  if (activityType.endsWith("_liter")) return "L";
  if (activityType.endsWith("_m3")) return "m³";
  return "unit";
}
