export type WeightUnit = "kg" | "jin";
export const unitLabel = (unit: WeightUnit) => (unit === "kg" ? "kg" : "斤");
export function displayWeight(weightKg: number, unit: WeightUnit): number {
  return Number((unit === "jin" ? weightKg * 2 : weightKg).toFixed(2));
}
export const toKilograms = (value: number, unit: WeightUnit) =>
  unit === "jin" ? value / 2 : value;
