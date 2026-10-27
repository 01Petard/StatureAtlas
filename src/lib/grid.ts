import type { Gender, WeightRecord } from "../models/record";
export interface GridConfig {
  gender: Gender;
  heightMin: number;
  heightMax: number;
  heightStep: number;
  weightMin: number;
  weightMax: number;
  weightStep: number;
}
export const FEMALE_GRID: GridConfig = {
  gender: "female",
  heightMin: 150,
  heightMax: 190,
  heightStep: 2,
  weightMin: 40,
  weightMax: 110,
  weightStep: 2,
};
export const MALE_GRID: GridConfig = {
  gender: "male",
  heightMin: 150,
  heightMax: 190,
  heightStep: 2,
  weightMin: 40,
  weightMax: 110,
  weightStep: 2,
};
export const axisValues = (min: number, max: number, step: number) =>
  Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step);
export function isInGrid(
  config: GridConfig,
  heightCm: number,
  weightKg: number,
): boolean {
  return (
    heightCm >= config.heightMin &&
    heightCm <= config.heightMax &&
    weightKg >= config.weightMin &&
    weightKg <= config.weightMax
  );
}
export function markerPosition(
  config: GridConfig,
  heightCm: number,
  weightKg: number,
) {
  if (!isInGrid(config, heightCm, weightKg)) return null;
  const columns = (config.weightMax - config.weightMin) / config.weightStep + 1;
  const rows = (config.heightMax - config.heightMin) / config.heightStep + 1;
  return {
    xPct:
      (((weightKg - config.weightMin) / config.weightStep + 0.5) / columns) *
      100,
    yPct:
      (((heightCm - config.heightMin) / config.heightStep + 0.5) / rows) * 100,
  };
}
export function groupMarkers(config: GridConfig, records: WeightRecord[]) {
  const groups = new Map<string, WeightRecord[]>();
  for (const record of records) {
    if (
      record.gender !== config.gender ||
      !isInGrid(config, record.heightCm, record.weightKg)
    )
      continue;
    const key = `${record.heightCm}:${record.weightKg}`;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return [...groups.values()];
}
