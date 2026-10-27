import { describe, expect, test } from "vitest";
import { calculateBmi, classifyBmi } from "../src/lib/bmi";
import {
  axisValues,
  FEMALE_GRID,
  MALE_GRID,
  markerPosition,
  groupMarkers,
} from "../src/lib/grid";
import { parseRecords, saveRecords, STORAGE_KEY } from "../src/lib/storage";
import { validateDraft, type WeightRecord } from "../src/models/record";
export const exampleRecord: WeightRecord = {
  id: "a",
  label: "我自己",
  gender: "male",
  heightCm: 178,
  weightKg: 72,
  color: "blue",
  createdAt: "2026-10-27T00:00:00Z",
  updatedAt: "2026-10-27T00:00:00Z",
};
describe("BMI 分类与未舍入边界", () => {
  test.each([
    [170, 60, "normal"],
    [178, 72, "normal"],
    [165, 50, "underweight"],
    [182, 88, "overweight"],
    [200, 96, "overweight"],
    [200, 112, "obese"],
  ])("%s cm / %s kg → %s", (h, w, status) =>
    expect(classifyBmi(calculateBmi(h as number, w as number))).toBe(status),
  );
  test.each([
    [18.49, "underweight"],
    [18.5, "normal"],
    [23.96, "normal"],
    [24, "overweight"],
    [27.99, "overweight"],
    [28, "obese"],
  ])("%s → %s", (bmi, status) =>
    expect(classifyBmi(bmi as number)).toBe(status),
  );
  test("计算精度", () => expect(calculateBmi(170, 60)).toBeCloseTo(20.7612457));
});
test("轴数量与连续插值", () => {
  expect(axisValues(150, 190, 2)).toHaveLength(21);
  expect(axisValues(40, 110, 2)).toHaveLength(36);
  expect(axisValues(150, 190, 2)).toHaveLength(21);
  expect(axisValues(40, 110, 2)).toHaveLength(36);
  expect(markerPosition(MALE_GRID, 178, 72)).toEqual({
    xPct: (16.5 / 36) * 100,
    yPct: (14.5 / 21) * 100,
  });
  expect(markerPosition(FEMALE_GRID, 165, 50)).toEqual({
    xPct: (5.5 / 36) * 100,
    yPct: (8 / 21) * 100,
  });
  expect(markerPosition(MALE_GRID, 178.5, 72.3)?.xPct).toBeCloseTo(
    (16.65 / 36) * 100,
  );
  expect(markerPosition(MALE_GRID, 200, 72)).toBeNull();
  expect(markerPosition(MALE_GRID, 178, 111)).toBeNull();
  expect(markerPosition(FEMALE_GRID, 150, 40)).toEqual({
    xPct: (0.5 / 36) * 100,
    yPct: (0.5 / 21) * 100,
  });
});
test("同点聚合、性别与范围过滤", () => {
  const records = [
    exampleRecord,
    { ...exampleRecord, id: "b" },
    { ...exampleRecord, id: "c", gender: "female" as const },
    { ...exampleRecord, id: "d", heightCm: 200 },
  ];
  expect(groupMarkers(MALE_GRID, records)).toEqual([[records[0], records[1]]]);
});
test("输入校验", () => {
  expect(validateDraft(exampleRecord)).toEqual({});
  for (const label of ["", " ", "x".repeat(21)])
    expect(validateDraft({ ...exampleRecord, label })).toHaveProperty("label");
  for (const heightCm of [NaN, -1, 119, 220.1, 178.12])
    expect(validateDraft({ ...exampleRecord, heightCm })).toHaveProperty(
      "heightCm",
    );
  for (const weightKg of [NaN, 0, 301, 72.12])
    expect(validateDraft({ ...exampleRecord, weightKg })).toHaveProperty(
      "weightKg",
    );
});
test("异常存储可恢复", () => {
  expect(parseRecords(null)).toEqual({ records: [], warning: null });
  for (const raw of [
    "{oops",
    "null",
    '{"version":2,"records":[]}',
    '{"version":1}',
    '{"version":1,"records":[{}]}',
  ]) {
    expect(parseRecords(raw).records).toEqual([]);
    expect(parseRecords(raw).warning).toBeTruthy();
  }
  const result = parseRecords(
    JSON.stringify({
      version: 1,
      records: [
        exampleRecord,
        { ...exampleRecord, id: "bad", weightKg: -1 },
        exampleRecord,
      ],
    }),
  );
  expect(result.records).toEqual([exampleRecord]);
  expect(result.warning).toBeTruthy();
  expect(saveRecords([exampleRecord])).toBeNull();
  expect(parseRecords(localStorage.getItem(STORAGE_KEY)).records).toEqual([
    exampleRecord,
  ]);
});
test("斤换算后的小数精度可持久化，不接受更细的输入", () => {
  expect(validateDraft({ ...exampleRecord, weightKg: 72.05 })).toEqual({});
  expect(validateDraft({ ...exampleRecord, weightKg: 72.025 })).toHaveProperty(
    "weightKg",
  );
  const raw = JSON.stringify({
    version: 1,
    records: [{ ...exampleRecord, weightKg: 72.05 }],
  });
  expect(parseRecords(raw).records[0].weightKg).toBe(72.05);
});
