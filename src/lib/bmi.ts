import type { WeightStatus } from "../models/record";
export const STATUS_LABELS: Record<WeightStatus, string> = {
  underweight: "过轻",
  normal: "正常",
  overweight: "超重",
  obese: "肥胖",
};
export function calculateBmi(heightCm: number, weightKg: number): number {
  return weightKg / (heightCm / 100) ** 2;
}
export function classifyBmi(bmi: number): WeightStatus {
  if (bmi < 18.5) return "underweight";
  if (bmi < 24) return "normal";
  if (bmi < 28) return "overweight";
  return "obese";
}
