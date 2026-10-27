import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import App from "../src/App";
import { STORAGE_KEY } from "../src/lib/storage";
afterEach(() => vi.restoreAllMocks());
async function addRecord(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  gender: "男" | "女",
  height: string,
  weight: string,
) {
  await user.type(screen.getByLabelText(/昵称 \/ 标签/), label);
  await user.click(screen.getByRole("radio", { name: gender }));
  await user.type(screen.getByRole("textbox", { name: "身高 cm" }), height);
  await user.type(screen.getByRole("textbox", { name: "体重 kg" }), weight);
  await user.click(screen.getByRole("button", { name: "添加到图表" }));
}
test("初次访问无演示记录，完整 CRUD、分类、隐藏和刷新恢复", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<App />);
  expect(
    screen.getByRole("link", { name: /StatureAtlas/ }),
  ).toBeInTheDocument();
  expect(screen.getByText("还没有记录")).toBeInTheDocument();
  await addRecord(user, "我自己", "男", "178", "72");
  await addRecord(user, "朋友A", "女", "165", "50");
  await addRecord(user, "朋友B", "男", "182", "88");
  expect(
    screen.getByRole("heading", { name: "我的记录 3" }),
  ).toBeInTheDocument();
  expect(
    within(screen.getByTestId("male-markers")).getAllByRole("button"),
  ).toHaveLength(2);
  expect(
    within(screen.getByTestId("female-markers")).getAllByRole("button"),
  ).toHaveLength(1);
  const list = screen.getByRole("region", { name: "我的记录 3" });
  const rows = within(list).getAllByRole("listitem");
  expect(rows[0]).toHaveTextContent("22.7正常");
  expect(rows[1]).toHaveTextContent("18.4过轻");
  expect(rows[2]).toHaveTextContent("26.6超重");
  const original = JSON.parse(localStorage.getItem(STORAGE_KEY)!).records[2];
  await user.click(screen.getByRole("button", { name: "隐藏标记" }));
  expect(
    screen.getByRole("heading", { name: "我的记录 3" }),
  ).toBeInTheDocument();
  expect(
    within(screen.getByTestId("male-markers")).queryAllByRole("button"),
  ).toHaveLength(0);
  await user.click(screen.getByRole("button", { name: "显示全部标记" }));
  await user.click(screen.getByRole("button", { name: "编辑 朋友B" }));
  await user.clear(screen.getByRole("textbox", { name: "体重 kg" }));
  await user.type(screen.getByRole("textbox", { name: "体重 kg" }), "80");
  await user.click(screen.getByRole("button", { name: "保存修改" }));
  const updated = JSON.parse(localStorage.getItem(STORAGE_KEY)!).records[2];
  expect(updated.id).toBe(original.id);
  expect(updated.createdAt).toBe(original.createdAt);
  expect(updated.weightKg).toBe(80);
  // Reload equivalent: a new component tree must recover records from real storage.
  unmount();
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "我的记录 3" }),
  ).toBeInTheDocument();
  expect(
    within(screen.getByTestId("male-markers")).getAllByRole("button"),
  ).toHaveLength(2);
  await user.click(screen.getByRole("button", { name: "删除 朋友A" }));
  expect(
    screen.getByRole("heading", { name: "我的记录 3" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "确认删除" }));
  expect(
    screen.getByRole("heading", { name: "我的记录 2" }),
  ).toBeInTheDocument();
  expect(
    within(screen.getByTestId("female-markers")).queryAllByRole("button"),
  ).toHaveLength(0);
  await addRecord(user, "范围外", "男", "200", "75");
  expect(screen.getByText("超出当前图表范围，记录已保存")).toBeInTheDocument();
  expect(
    within(screen.getByTestId("male-markers")).getAllByRole("button"),
  ).toHaveLength(2);
});
test("字段错误、取消编辑和会话隐藏状态重置", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<App />);
  await user.click(screen.getByRole("button", { name: "添加到图表" }));

  expect(screen.getByRole("textbox", { name: "身高 cm" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await addRecord(user, "合法", "男", "178", "72");
  await user.click(screen.getByRole("button", { name: "编辑 合法" }));
  await user.clear(screen.getByRole("textbox", { name: "体重 kg" }));
  await user.type(screen.getByRole("textbox", { name: "体重 kg" }), "72.123");
  await user.click(screen.getByRole("button", { name: "保存修改" }));
  expect(screen.getByText("请输入体重数字，最多两位小数")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "取消" }));
  expect(screen.getByRole("textbox", { name: "体重 kg" })).toHaveValue("");
  await user.click(screen.getByRole("button", { name: "隐藏标记" }));
  unmount();
  render(<App />);
  expect(
    within(screen.getByTestId("male-markers")).getAllByRole("button"),
  ).toHaveLength(1);
});
test("损坏 JSON 和存储禁用时仍能使用内存记录", async () => {
  localStorage.setItem(STORAGE_KEY, "broken");
  const { unmount } = render(<App />);
  expect(screen.getByRole("alert")).toHaveTextContent("本地记录无法读取");
  unmount();
  localStorage.clear();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Quota exceeded", "QuotaExceededError");
  });
  render(<App />);
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("当前记录无法持久保存"),
  );
  await addRecord(userEvent.setup(), "内存记录", "男", "178", "72");
  expect(
    screen.getByRole("heading", { name: "我的记录 1" }),
  ).toBeInTheDocument();
});
test("公斤与斤全局换算、保留草稿、BMI 与存储不受单位影响", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText(/昵称 \/ 标签/), "单位测试");
  await user.type(screen.getByRole("textbox", { name: "身高 cm" }), "178");
  await user.type(screen.getByRole("textbox", { name: "体重 kg" }), "72");
  await user.click(screen.getByRole("button", { name: "斤" }));
  expect(screen.getByRole("textbox", { name: "体重 斤" })).toHaveValue("144");
  expect(screen.getByLabelText(/昵称 \/ 标签/)).toHaveValue("单位测试");
  await user.clear(screen.getByRole("textbox", { name: "体重 斤" }));
  await user.type(screen.getByRole("textbox", { name: "体重 斤" }), "144.1");
  await user.click(screen.getByRole("button", { name: "公斤" }));
  expect(screen.getByRole("textbox", { name: "体重 kg" })).toHaveValue("72.05");
  await user.click(screen.getByRole("button", { name: "添加到图表" }));
  expect(
    JSON.parse(localStorage.getItem(STORAGE_KEY)!).records[0].weightKg,
  ).toBe(72.05);
  const list = screen.getByRole("region", { name: "我的记录 1" });
  expect(list).toHaveTextContent("72.05 kg22.7正常");
  const before = within(screen.getByTestId("male-markers")).getByRole("button")
    .style.left;
  await user.click(screen.getByRole("button", { name: "斤" }));
  expect(list).toHaveTextContent("144.1 斤22.7正常");
  expect(
    within(screen.getByTestId("male-markers")).getByRole("button").style.left,
  ).toBe(before);
  await user.click(screen.getByRole("button", { name: "编辑 单位测试" }));
  expect(screen.getByRole("textbox", { name: "体重 斤" })).toHaveValue("144.1");
  await user.click(screen.getByRole("button", { name: "保存修改" }));
  expect(
    JSON.parse(localStorage.getItem(STORAGE_KEY)!).records[0].weightKg,
  ).toBe(72.05);
});
test("昵称留空或空格时自动生成友好名称，保留手填名称", async () => {
  const user = userEvent.setup();
  render(<App />);
  for (const label of ["", "   "]) {
    if (label) await user.type(screen.getByLabelText(/昵称 \/ 标签/), label);
    await user.type(screen.getByRole("textbox", { name: "身高 cm" }), "178");
    await user.type(screen.getByRole("textbox", { name: "体重 kg" }), "72");
    await user.click(screen.getByRole("button", { name: "添加到图表" }));
  }
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!).records;
  expect(saved.map((record: { label: string }) => record.label)).toEqual([
    "小禾",
    "小满",
  ]);
  expect(
    within(screen.getByTestId("male-markers")).getByRole("button"),
  ).toHaveTextContent("2");
  await addRecord(user, "自定义昵称", "女", "165", "50");
  expect(
    screen.getByRole("button", { name: "编辑 自定义昵称" }),
  ).toBeInTheDocument();
});
