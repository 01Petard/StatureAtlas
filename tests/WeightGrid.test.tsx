import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { WeightGrid } from "../src/components/WeightGrid";
import { FEMALE_GRID, MALE_GRID } from "../src/lib/grid";
import type { WeightRecord } from "../src/models/record";
const record: WeightRecord = {
  id: "a",
  label: "我自己",
  gender: "male",
  heightCm: 178,
  weightKg: 72,
  color: "blue",
  createdAt: "2026-10-27T00:00:00Z",
  updatedAt: "2026-10-27T00:00:00Z",
};
test("辅助高亮、固定、Escape、方向键与空白取消", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <WeightGrid config={FEMALE_GRID} records={[]} markersVisible />,
  );
  const cell = screen.getByRole("button", {
    name: "170 cm，60 kg，BMI 20.8，正常",
  });
  fireEvent.pointerEnter(cell);
  expect(cell).toHaveClass("active", "guided");
  expect(container.querySelectorAll(".guided")).toHaveLength(56);
  await user.click(screen.getByRole("checkbox", { name: "辅助线" }));
  expect(container.querySelectorAll(".guided")).toHaveLength(0);
  fireEvent.pointerEnter(cell);
  await user.click(cell);
  fireEvent.pointerLeave(cell);
  expect(cell).toHaveAttribute("aria-pressed", "true");
  await user.click(cell);
  expect(cell).toHaveAttribute("aria-pressed", "false");
  await user.click(cell);
  const other = screen.getByRole("button", {
    name: "170 cm，62 kg，BMI 21.5，正常",
  });
  await user.click(other);
  expect(other).toHaveAttribute("aria-pressed", "true");
  expect(cell).toHaveAttribute("aria-pressed", "false");
  await user.keyboard("{Escape}");
  expect(cell).toHaveAttribute("aria-pressed", "false");
  cell.focus();
  await user.keyboard("{ArrowRight}{Enter}");
  const next = screen.getByRole("button", {
    name: "170 cm，62 kg，BMI 21.5，正常",
  });
  expect(next).toHaveFocus();
  expect(next).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("heading"));
  expect(next).toHaveAttribute("aria-pressed", "false");
});
test("精确点位、同点聚合、性别隔离和隐藏", async () => {
  const records = [
    record,
    { ...record, id: "b", label: "朋友B" },
    {
      ...record,
      id: "c",
      label: "朋友A",
      gender: "female" as const,
      heightCm: 165,
      weightKg: 50,
    },
    { ...record, id: "d", heightCm: 200 },
  ];
  const { rerender } = render(
    <WeightGrid config={MALE_GRID} records={records} markersVisible />,
  );
  const marker = within(screen.getByTestId("male-markers")).getByRole("button");
  expect(marker).toHaveStyle({
    left: `${(16.5 / 36) * 100}%`,
    top: `${(14.5 / 21) * 100}%`,
  });
  expect(marker).toHaveTextContent("2");
  expect(marker).toHaveAccessibleName("我自己、朋友B，178 cm，72 kg，2 条记录");
  await userEvent.click(marker);
  expect(screen.getByRole("status")).toHaveTextContent("朋友B");
  rerender(
    <WeightGrid config={MALE_GRID} records={records} markersVisible={false} />,
  );
  expect(
    within(screen.getByTestId("male-markers")).queryAllByRole("button"),
  ).toHaveLength(0);
  rerender(
    <WeightGrid config={FEMALE_GRID} records={records} markersVisible />,
  );
  expect(
    within(screen.getByTestId("female-markers")).getByRole("button"),
  ).toHaveAccessibleName("朋友A，165 cm，50 kg");
});
test.each([FEMALE_GRID, MALE_GRID])(
  "$gender 信息栏跟随分类颜色，固定期间不随其他悬停变化",
  async (config) => {
    const user = userEvent.setup();
    render(<WeightGrid config={config} records={[]} markersVisible />);
    const info = screen.getByRole("status");
    for (const [weight, status] of [
      [40, "underweight"],
      [50, "normal"],
      [54, "overweight"],
      [64, "obese"],
    ] as const) {
      const cell = screen.getByRole("button", {
        name: new RegExp(`^150 cm，${weight} kg，`),
      });
      fireEvent.pointerEnter(cell);
      expect(info).toHaveClass("has-detail", status);
      fireEvent.pointerLeave(cell);
      expect(info).not.toHaveClass("has-detail", status);
    }
    const underweight = screen.getByRole("button", {
      name: /^150 cm，40 kg，/,
    });
    const obese = screen.getByRole("button", { name: /^150 cm，64 kg，/ });
    await user.click(underweight);
    fireEvent.pointerEnter(obese);
    expect(info).toHaveClass("underweight");
    await user.click(obese);
    expect(info).toHaveClass("obese");
    await user.click(obese);
    expect(info).not.toHaveClass("has-detail");
  },
);
