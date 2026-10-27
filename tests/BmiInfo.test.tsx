import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { BmiInfo } from "../src/components/BmiInfo";
test("BMI 公式兼作计算器，支持斤、无效输入与清空", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<BmiInfo />);
  expect(screen.getByText("BMI = 体重 (kg) ÷ 身高 (m)²")).toBeInTheDocument();
  await user.type(screen.getByLabelText("BMI 计算身高 cm"), "170");
  await user.type(screen.getByLabelText("BMI 计算体重 kg"), "60");
  expect(screen.getByText("BMI = 60 ÷ 1.7² = 20.8")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("正常");
  rerender(<BmiInfo unit="jin" />);
  expect(screen.getByLabelText("BMI 计算体重 斤")).toHaveValue("120");
  expect(screen.getByText("BMI = 60 ÷ 1.7² = 20.8")).toBeInTheDocument();
  await user.clear(screen.getByLabelText("BMI 计算体重 斤"));
  await user.type(screen.getByLabelText("BMI 计算体重 斤"), "120.15");
  expect(screen.getByLabelText("BMI 计算体重 斤")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await user.clear(screen.getByLabelText("BMI 计算体重 斤"));
  await user.type(screen.getByLabelText("BMI 计算体重 斤"), "120");
  await user.clear(screen.getByLabelText("BMI 计算身高 cm"));
  await user.type(screen.getByLabelText("BMI 计算身高 cm"), "0");
  expect(screen.getByLabelText("BMI 计算身高 cm")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await user.clear(screen.getByLabelText("BMI 计算身高 cm"));
  await user.type(screen.getByLabelText("BMI 计算身高 cm"), "170");
  await user.click(screen.getByRole("button", { name: "清空计算" }));
  expect(screen.getByText("BMI = 体重 (kg) ÷ 身高 (m)²")).toBeInTheDocument();
  expect(screen.getByLabelText("BMI 计算体重 斤")).toHaveValue("");
});
