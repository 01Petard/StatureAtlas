import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import App from "../src/App";

afterEach(() => vi.restoreAllMocks());

test("重新打开恢复单位，男女辅助线分别保存且互不影响", async () => {
  const user = userEvent.setup();
  const femaleGuides = () =>
    within(
      screen.getByRole("region", { name: "女生身高体重对照表" }),
    ).getByRole("checkbox", { name: "辅助线" });
  const maleGuides = () =>
    within(
      screen.getByRole("region", { name: "男生身高体重对照表" }),
    ).getByRole("checkbox", { name: "辅助线" });
  const first = render(<App />);
  expect(screen.getByRole("button", { name: "公斤" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(femaleGuides()).toBeChecked();
  expect(maleGuides()).toBeChecked();
  await user.click(screen.getByRole("button", { name: "斤" }));
  await user.click(femaleGuides());
  first.unmount();
  const second = render(<App />);
  expect(screen.getByRole("button", { name: "斤" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(femaleGuides()).not.toBeChecked();
  expect(maleGuides()).toBeChecked();
  await user.click(maleGuides());
  await user.click(femaleGuides());
  await user.click(screen.getByRole("button", { name: "公斤" }));
  second.unmount();
  render(<App />);
  expect(screen.getByRole("button", { name: "公斤" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(femaleGuides()).toBeChecked();
  expect(maleGuides()).not.toBeChecked();
});

test("损坏或类型错误的偏好恢复默认值", () => {
  localStorage.setItem("stature-atlas:weight-unit:v1", '"pounds"');
  localStorage.setItem("stature-atlas:guides:female:v1", "invalid-json");
  localStorage.setItem("stature-atlas:guides:male:v1", '"false"');
  render(<App />);
  expect(screen.getByRole("button", { name: "公斤" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (const checkbox of screen.getAllByRole("checkbox", { name: "辅助线" }))
    expect(checkbox).toBeChecked();
});

test("存储不可用时，单位和辅助线在本次会话仍可操作", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  render(<App />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "斤" }));
  expect(screen.getByRole("button", { name: "斤" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const checkbox = within(
    screen.getByRole("region", { name: "女生身高体重对照表" }),
  ).getByRole("checkbox", { name: "辅助线" });
  await user.click(checkbox);
  expect(checkbox).not.toBeChecked();
});
