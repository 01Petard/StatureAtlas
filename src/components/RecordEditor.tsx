import { useRef, useState, type FormEvent } from "react";
import {
  Check,
  CheckCheck,
  Plus,
  LockKeyhole,
  UserRoundPlus,
  Mars,
  Venus,
} from "lucide-react";
import {
  MARKER_COLORS,
  validateDraft,
  type DraftErrors,
  type Gender,
  type MarkerColor,
  type RecordDraft,
  type WeightRecord,
} from "../models/record";
import {
  displayWeight,
  toKilograms,
  unitLabel,
  type WeightUnit,
} from "../lib/units";
const COLOR_NAMES: Record<MarkerColor, string> = {
  blue: "蓝色",
  pink: "粉色",
  green: "绿色",
  orange: "橙色",
  purple: "紫色",
  red: "红色",
};
export function RecordEditor({
  record,
  automaticLabel = "小禾",
  unit = "kg",
  onSubmit,
  onCancel,
}: {
  record?: WeightRecord;
  automaticLabel?: string;
  unit?: WeightUnit;
  onSubmit: (draft: RecordDraft) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(record?.label ?? "");
  const [gender, setGender] = useState<Gender>(record?.gender ?? "male");
  const [height, setHeight] = useState(record ? String(record.heightCm) : "");
  const [weightInput, setWeightInput] = useState({
    value: record ? String(displayWeight(record.weightKg, unit)) : "",
    unit,
  });
  const weight =
    weightInput.unit === unit || !/^\d+(\.\d+)?$/.test(weightInput.value)
      ? weightInput.value
      : String(
          toKilograms(Number(weightInput.value), weightInput.unit) *
            (unit === "jin" ? 2 : 1),
        );
  function setWeight(value: string) {
    setWeightInput({ value, unit });
  }

  const [color, setColor] = useState<MarkerColor>(record?.color ?? "blue");
  const [errors, setErrors] = useState<DraftErrors>({});
  const [success, setSuccess] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const draft: RecordDraft = {
      label: label.trim() || automaticLabel,
      gender,
      heightCm: Number(height),
      weightKg: toKilograms(Number(weight), unit),
      color,
    };
    const nextErrors = validateDraft(draft);
    if (!/^\d+(\.\d)?$/.test(height.trim()))
      nextErrors.heightCm = "请输入身高数字，最多一位小数";
    if (
      !(unit === "kg" ? /^\d+(\.\d{1,2})?$/ : /^\d+(\.\d)?$/).test(
        weight.trim(),
      )
    )
      nextErrors.weightKg =
        unit === "kg"
          ? "请输入体重数字，最多两位小数"
          : "请输入体重数字，最多一位小数";
    if (
      Number.isFinite(draft.weightKg) &&
      (draft.weightKg < 20 || draft.weightKg > 300)
    )
      nextErrors.weightKg =
        unit === "kg" ? "体重须为 20–300 kg" : "体重须为 40–600 斤";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      formRef.current
        ?.querySelector<HTMLInputElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }
    onSubmit(draft);
    if (!record) {
      setLabel("");
      setHeight("");
      setWeight("");
      setSuccess(`已添加「${draft.label}」`);
      labelRef.current?.focus();
    }
  }
  return (
    <section
      className={`panel editor-panel${record ? " editing" : ""}`}
      aria-labelledby="editor-title"
    >
      <div className="section-heading">
        <UserRoundPlus size={20} />
        <h2 id="editor-title">{record ? "编辑记录" : "记录与标点"}</h2>
        <span className="section-caption">
          {record ? "更新坐标" : "添加你的坐标"}
        </span>
      </div>
      <form ref={formRef} onSubmit={submit} noValidate className="record-form">
        <div className="form-field">
          <label htmlFor="record-label">
            昵称 / 标签 <span>选填 · 最多 20 字</span>
          </label>
          <input
            ref={labelRef}
            id="record-label"
            name="label"
            autoComplete="off"
            placeholder={`留空自动命名为「${automaticLabel}」`}
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setSuccess("");
            }}
            aria-invalid={!!errors.label}
            aria-describedby={errors.label ? "label-error" : undefined}
          />
          {errors.label && (
            <p id="label-error" className="field-error">
              {errors.label}
            </p>
          )}
        </div>
        <fieldset className="form-field">
          <legend>性别</legend>
          <div className="gender-options">
            {(["male", "female"] as const).map((g) => (
              <label key={g} className={gender === g ? `selected ${g}` : ""}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g === "male" ? <Mars size={17} /> : <Venus size={17} />}
                <span>{g === "male" ? "男" : "女"}</span>
                {gender === g && <Check size={14} />}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="measurement-fields">
          {(
            [
              {
                key: "heightCm",
                label: "身高",
                unit: "cm",
                value: height,
                set: setHeight,
                placeholder: "178",
              },
              {
                key: "weightKg",
                label: "体重",
                unit: unitLabel(unit),
                value: weight,
                set: setWeight,
                placeholder: unit === "kg" ? "72" : "144",
              },
            ] as const
          ).map((field) => (
            <div className="form-field" key={field.key}>
              <label htmlFor={field.key}>
                {field.label} <span>{field.unit}</span>
              </label>
              <div className="measurement-input">
                <input
                  id={field.key}
                  name={field.key}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => {
                    field.set(e.target.value);
                    setSuccess("");
                  }}
                  aria-invalid={!!errors[field.key]}
                  aria-describedby={
                    errors[field.key] ? `${field.key}-error` : undefined
                  }
                />
                <span>{field.unit}</span>
              </div>
              {errors[field.key] && (
                <p id={`${field.key}-error`} className="field-error">
                  {errors[field.key]}
                </p>
              )}
            </div>
          ))}
        </div>
        <fieldset className="form-field color-field">
          <legend>标记颜色</legend>
          <div className="color-options">
            {(Object.keys(MARKER_COLORS) as MarkerColor[]).map((c) => (
              <label
                key={c}
                style={
                  { "--marker-color": MARKER_COLORS[c] } as React.CSSProperties
                }
                className={color === c ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="color"
                  value={c}
                  checked={color === c}
                  onChange={() => setColor(c)}
                  aria-label={COLOR_NAMES[c]}
                />
                <span className="color-swatch">
                  {color === c && <Check size={15} />}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form-actions">
          <button type="submit" className="primary-button">
            {record ? <Check size={17} /> : <Plus size={17} />}{" "}
            {record ? "保存修改" : "添加到图表"}
          </button>
          {record && (
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              取消
            </button>
          )}
        </div>
        <p
          role="status"
          className={`form-feedback${success ? " success" : ""}`}
        >
          {success ? (
            <>
              <CheckCheck size={13} />
              {success}
            </>
          ) : (
            <>
              <LockKeyhole size={12} />
              记录仅保存在当前浏览器，不会上传。
            </>
          )}
        </p>
      </form>
    </section>
  );
}
