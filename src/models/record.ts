export type Gender = "male" | "female";
export type WeightStatus = "underweight" | "normal" | "overweight" | "obese";
export const MARKER_COLORS = {
  blue: "#2f76f6",
  pink: "#e94b93",
  green: "#16a477",
  orange: "#ef8a33",
  purple: "#8b62d9",
  red: "#e6475c",
} as const;
export type MarkerColor = keyof typeof MARKER_COLORS;
export interface WeightRecord {
  id: string;
  label: string;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  color: MarkerColor;
  createdAt: string;
  updatedAt: string;
}
export type RecordDraft = Pick<
  WeightRecord,
  "label" | "gender" | "heightCm" | "weightKg" | "color"
>;
export type DraftErrors = Partial<Record<keyof RecordDraft, string>>;
export function validateDraft(draft: RecordDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (
    typeof draft.label !== "string" ||
    !draft.label.trim() ||
    draft.label.trim().length > 20
  )
    errors.label = "请输入 1–20 个字符的昵称或标签";
  if (!["male", "female"].includes(draft.gender)) errors.gender = "请选择性别";
  if (
    !Number.isFinite(draft.heightCm) ||
    draft.heightCm < 120 ||
    draft.heightCm > 220 ||
    Math.abs(draft.heightCm * 10 - Math.round(draft.heightCm * 10)) > 1e-8
  )
    errors.heightCm = "身高须为 120–220 cm，最多一位小数";
  if (
    !Number.isFinite(draft.weightKg) ||
    draft.weightKg < 20 ||
    draft.weightKg > 300 ||
    Math.abs(draft.weightKg * 20 - Math.round(draft.weightKg * 20)) > 1e-8
  )
    errors.weightKg = "体重须为 20–300 kg，精度为 0.05 kg（0.1 斤）";
  if (!Object.hasOwn(MARKER_COLORS, draft.color))
    errors.color = "请选择预设标记颜色";
  return errors;
}
