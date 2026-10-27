import { validateDraft, type WeightRecord } from "../models/record";
export const STORAGE_KEY = "height-weight-compare:records:v1";
export interface LoadResult {
  records: WeightRecord[];
  warning: string | null;
}
export function parseRecords(raw: string | null): LoadResult {
  if (raw === null) return { records: [], warning: null };
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Array.isArray(value.records))
      return {
        records: [],
        warning: "本地记录版本或格式不受支持，已使用空列表。",
      };
    const ids = new Set<string>();
    const records = value.records
      .filter((record: unknown): record is WeightRecord => {
        if (!record || typeof record !== "object") return false;
        const r = record as WeightRecord;
        if (
          typeof r.id !== "string" ||
          !r.id.trim() ||
          ids.has(r.id) ||
          Object.keys(validateDraft(r)).length ||
          r.label !== r.label.trim() ||
          typeof r.createdAt !== "string" ||
          !Number.isFinite(Date.parse(r.createdAt)) ||
          typeof r.updatedAt !== "string" ||
          !Number.isFinite(Date.parse(r.updatedAt))
        )
          return false;
        ids.add(r.id);
        return true;
      })
      .map((r: WeightRecord) => ({
        id: r.id,
        label: r.label,
        gender: r.gender,
        heightCm: r.heightCm,
        weightKg: r.weightKg,
        color: r.color,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    return {
      records,
      warning:
        records.length !== value.records.length
          ? "部分本地记录已损坏，已保留有效记录。"
          : null,
    };
  } catch {
    return { records: [], warning: "本地记录无法读取，已使用空列表。" };
  }
}
export function loadRecords(): LoadResult {
  try {
    return parseRecords(localStorage.getItem(STORAGE_KEY));
  } catch {
    return { records: [], warning: "浏览器存储不可用，当前记录无法持久保存。" };
  }
}
export function saveRecords(records: WeightRecord[]): string | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, records }));
    return null;
  } catch {
    return "当前记录无法持久保存，请勿关闭页面。";
  }
}
