import { ArrowUpRight, BookOpen, Info } from "lucide-react";
import { useState } from "react";
import { calculateBmi, classifyBmi, STATUS_LABELS } from "../lib/bmi";
import {
  displayWeight,
  toKilograms,
  unitLabel,
  type WeightUnit,
} from "../lib/units";
export function BmiInfo({ unit = "kg" }: { unit?: WeightUnit }) {
  const [height, setHeight] = useState("");
  const [weightInput, setWeightInput] = useState({ value: "", unit });
  const weight =
    weightInput.unit === unit || !/^\d+(\.\d+)?$/.test(weightInput.value)
      ? weightInput.value
      : String(
          toKilograms(Number(weightInput.value), weightInput.unit) *
            (unit === "jin" ? 2 : 1),
        );
  const kg = toKilograms(Number(weight), unit);
  const validHeight =
    /^\d+(\.\d)?$/.test(height) &&
    Number(height) >= 120 &&
    Number(height) <= 220;
  const validWeight =
    (unit === "kg" ? /^\d+(\.\d{1,2})?$/ : /^\d+(\.\d)?$/).test(weight) &&
    kg >= 20 &&
    kg <= 300 &&
    Math.abs(kg * 20 - Math.round(kg * 20)) < 1e-8;
  const result =
    validHeight && validWeight ? calculateBmi(Number(height), kg) : null;
  const status = result === null ? null : classifyBmi(result);

  return (
    <section className="panel bmi-panel" aria-labelledby="bmi-title">
      <div className="section-heading">
        <BookOpen size={20} />
        <h2 id="bmi-title">BMI 参考说明</h2>
      </div>
      <div className="formula">
        <span>身体质量指数 · 输入即计算</span>
        <strong className="formula-expression" aria-live="polite">
          {result === null
            ? "BMI = 体重 (kg) ÷ 身高 (m)²"
            : `BMI = ${displayWeight(kg, "kg")} ÷ ${Number(height) / 100}² = ${result.toFixed(1)}`}
        </strong>
        <div className="calculator-inputs">
          <label>
            身高 <span>cm</span>
            <input
              aria-label="BMI 计算身高 cm"
              inputMode="decimal"
              placeholder="输入身高"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              aria-invalid={!!height && !validHeight}
            />
          </label>
          <label>
            体重 <span>{unitLabel(unit)}</span>
            <input
              aria-label={`BMI 计算体重 ${unitLabel(unit)}`}
              inputMode="decimal"
              placeholder="输入体重"
              value={weight}
              onChange={(event) =>
                setWeightInput({ value: event.target.value, unit })
              }
              aria-invalid={!!weight && !validWeight}
            />
          </label>
        </div>
        {status ? (
          <div className="calculator-result" role="status">
            <span className={`status-text ${status}`}>
              {STATUS_LABELS[status]}
            </span>
            <button
              type="button"
              onClick={() => {
                setHeight("");
                setWeightInput({ value: "", unit });
              }}
            >
              清空计算
            </button>
          </div>
        ) : (
          <small>
            {height && !validHeight
              ? "身高请输入 120–220 cm，最多一位小数"
              : weight && !validWeight
                ? `体重请输入 ${unit === "kg" ? "20–300 kg" : "40–600 斤"}，精度 ${unit === "kg" ? "0.05 kg" : "0.1 斤"}`
                : "填写身高和体重，查看代入公式与 BMI"}
          </small>
        )}
      </div>
      <div className="bmi-ranges">
        <div className="underweight">
          <span>过轻</span>
          <strong>＜ 18.5</strong>
        </div>
        <div className="normal">
          <span>正常</span>
          <strong>18.5 ≤ BMI ＜ 24</strong>
        </div>
        <div className="overweight">
          <span>超重</span>
          <strong>24 ≤ BMI ＜ 28</strong>
        </div>
        <div className="obese">
          <span>肥胖</span>
          <strong>≥ 28</strong>
        </div>
      </div>
      <p className="bmi-note">
        <Info size={15} />
        <span>
          适用于中国 18 岁及以上成人。男女采用相同分类阈值；BMI
          不能反映体脂率，也不能替代临床评估。
        </span>
      </p>
      <p className="bmi-note">
        运动员、孕妇、老人及特殊体型需结合个体情况评估；18 岁以下不适用本标准。
      </p>
      <a
        className="source-link"
        href="https://www.nhc.gov.cn/ylyjs/zcwj/202412/75cb79c171c94def9e768193e65484f7.shtml"
        target="_blank"
        rel="noreferrer"
      >
        国家卫健委 · 体重管理指导原则 <ArrowUpRight size={14} />
      </a>
    </section>
  );
}
