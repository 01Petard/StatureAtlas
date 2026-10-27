import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Crosshair, Mars, Venus, X } from "lucide-react";
import { calculateBmi, classifyBmi, STATUS_LABELS } from "../lib/bmi";
import {
  axisValues,
  groupMarkers,
  markerPosition,
  type GridConfig,
} from "../lib/grid";
import { useStoredPreference } from "../hooks/useStoredPreference";
import { MARKER_COLORS, type WeightRecord } from "../models/record";

import { displayWeight, unitLabel, type WeightUnit } from "../lib/units";
type Cell = { row: number; col: number };
export function WeightGrid({
  config,
  unit = "kg",
  records,
  markersVisible,
}: {
  config: GridConfig;
  unit?: WeightUnit;
  records: WeightRecord[];
  markersVisible: boolean;
}) {
  const [hovered, setHovered] = useState<Cell | null>(null);
  const [pinned, setPinned] = useState<Cell | null>(null);
  const [guides, setGuides] = useStoredPreference(
    `stature-atlas:guides:${config.gender}:v1`,
    true,
    (value): value is boolean => typeof value === "boolean",
  );
  const [selectedGroup, setSelectedGroup] = useState<WeightRecord[] | null>(
    null,
  );
  const [hoverGroup, setHoverGroup] = useState<WeightRecord[] | null>(null);
  const [focusCell, setFocusCell] = useState<Cell>({ row: 0, col: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const cellsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const female = config.gender === "female";
  const heights = useMemo(
    () => axisValues(config.heightMin, config.heightMax, config.heightStep),
    [config],
  );
  const weights = useMemo(
    () => axisValues(config.weightMin, config.weightMax, config.weightStep),
    [config],
  );
  const groups = useMemo(
    () => groupMarkers(config, records),
    [config, records],
  );
  const active = pinned ?? hovered;
  // Resolve pinned markers from current records so edits/deletes never leave stale details.
  const group = markersVisible
    ? selectedGroup
      ? groups.find((g) => g.some((r) => r.id === selectedGroup[0]?.id))
      : hoverGroup
    : null;
  const height = active ? heights[active.row] : null;
  const weight = active ? weights[active.col] : null;
  const bmi = height && weight ? calculateBmi(height, weight) : null;
  const detailBmi = group
    ? calculateBmi(group[0].heightCm, group[0].weightKg)
    : bmi;
  const detailStatus = detailBmi === null ? null : classifyBmi(detailBmi);
  function clearSelection() {
    setPinned(null);
    setHovered(null);
    setSelectedGroup(null);
    setHoverGroup(null);
  }
  useEffect(() => {
    if (!pinned && !selectedGroup) return;
    function closeOutside(event: PointerEvent) {
      if (!sectionRef.current?.contains(event.target as Node)) clearSelection();
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") clearSelection();
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [pinned, selectedGroup]);
  function handleKey(
    event: KeyboardEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) {
    const delta = {
      ArrowDown: [1, 0],
      ArrowUp: [-1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    }[event.key];
    if (delta) {
      event.preventDefault();
      const next = {
        row: Math.max(0, Math.min(heights.length - 1, row + delta[0])),
        col: Math.max(0, Math.min(weights.length - 1, col + delta[1])),
      };
      setFocusCell(next);
      cellsRef.current[next.row * weights.length + next.col]?.focus();
    }
  }
  return (
    <section
      ref={sectionRef}
      className={`panel chart ${female ? "female" : "male"}`}
      aria-labelledby={`${config.gender}-title`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          clearSelection();
        }
      }}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button, [role="status"]'))
          clearSelection();
      }}
    >
      <div className="chart-heading flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="gender-icon">
            {female ? <Venus size={25} /> : <Mars size={25} />}
          </span>
          <div>
            <h2 id={`${config.gender}-title`}>
              {female ? "女生" : "男生"}身高体重对照表
            </h2>
            <p>
              {config.heightMin}–{config.heightMax} cm <span>·</span>{" "}
              {displayWeight(config.weightMin, unit)}–
              {displayWeight(config.weightMax, unit)} {unitLabel(unit)}
            </p>
          </div>
        </div>
        <label className="guide-control">
          <input
            type="checkbox"
            checked={guides}
            onChange={(e) => setGuides(e.target.checked)}
          />
          <span className="switch" />
          <span>辅助线</span>
        </label>
      </div>
      <div className="chart-legend flex flex-wrap items-center gap-4">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <span key={key}>
            <i className={key} />
            {label}
          </span>
        ))}
        <span className="axis-description">
          身高 cm ↓ / 体重 {unitLabel(unit)} →
        </span>
      </div>
      <div
        id={`${config.gender}-detail`}
        className={`grid-detail grid-info${detailStatus ? ` has-detail ${detailStatus}` : ""}`}
        role="status"
        aria-live="polite"
      >
        {group ? (
          <>
            <div className="marker-details">
              {group.map((record) => {
                const value = calculateBmi(record.heightCm, record.weightKg);
                return (
                  <div key={record.id}>
                    <i style={{ background: MARKER_COLORS[record.color] }} />
                    <strong>{record.label}</strong>
                    <span>
                      {record.gender === "female" ? "女" : "男"} ·{" "}
                      {record.heightCm} cm /{" "}
                      {displayWeight(record.weightKg, unit)} {unitLabel(unit)}
                    </span>
                    <span>
                      BMI {value.toFixed(1)} ·{" "}
                      {STATUS_LABELS[classifyBmi(value)]}
                    </span>
                  </div>
                );
              })}
            </div>
            {selectedGroup && (
              <button
                className="icon-button"
                aria-label="关闭标记详情"
                onClick={() => {
                  setSelectedGroup(null);
                  setHoverGroup(null);
                }}
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : active && bmi !== null ? (
          <>
            <Crosshair size={16} />
            <strong>
              {height} cm / {displayWeight(weight!, unit)} {unitLabel(unit)}
            </strong>
            <span>BMI {bmi.toFixed(1)}</span>
            <span className={`status-text ${classifyBmi(bmi)}`}>
              {STATUS_LABELS[classifyBmi(bmi)]}
            </span>
            <span className="detail-hint">
              {pinned ? "已固定" : "点击固定，再点取消"}
            </span>
            {pinned && (
              <button
                className="icon-button"
                aria-label="关闭格子详情"
                onClick={clearSelection}
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <>
            <Crosshair size={15} />
            <span>悬停查看详情 · 点击固定 / 再次点击取消 · 方向键移动</span>
          </>
        )}
      </div>
      <div
        className="grid-scroll"
        tabIndex={-1}
        aria-label={`${female ? "女生" : "男生"}对照表，可横向滚动`}
      >
        <div
          className="grid-content"
          style={
            {
              "--columns": weights.length,
              "--rows": heights.length,
            } as CSSProperties
          }
        >
          <div className="axis-corner">cm / {unitLabel(unit)}</div>
          <div
            className="weight-axis"
            style={{ gridTemplateColumns: `repeat(${weights.length}, 1fr)` }}
          >
            {weights.map((w, col) => (
              <span
                className={guides && active?.col === col ? "axis-active" : ""}
                key={displayWeight(w, unit)}
              >
                {displayWeight(w, unit)}
              </span>
            ))}
          </div>
          <div className="height-axis">
            {heights.map((h, row) => (
              <span
                className={guides && active?.row === row ? "axis-active" : ""}
                key={h}
              >
                {h}
              </span>
            ))}
          </div>
          <div className="data-area">
            <div
              className="data-cells"
              role="group"
              aria-label="使用方向键选择格子，回车固定详情，Escape 关闭"
            >
              {heights.flatMap((h, row) =>
                weights.map((w, col) => {
                  const status = classifyBmi(calculateBmi(h, w));
                  const current = active?.row === row && active.col === col;
                  return (
                    <button
                      key={`${h}-${w}`}
                      type="button"
                      ref={(el) => {
                        cellsRef.current[row * weights.length + col] = el;
                      }}
                      tabIndex={
                        focusCell.row === row && focusCell.col === col ? 0 : -1
                      }
                      className={`grid-cell ${status}${guides && (active?.row === row || active?.col === col) ? " guided" : ""}${current ? " active" : ""}`}
                      aria-label={`${h} cm，${displayWeight(w, unit)} ${unitLabel(unit)}，BMI ${calculateBmi(h, w).toFixed(1)}，${STATUS_LABELS[status]}`}
                      aria-describedby={
                        current && !group
                          ? `${config.gender}-detail`
                          : undefined
                      }
                      aria-pressed={pinned?.row === row && pinned.col === col}
                      onPointerEnter={() => setHovered({ row, col })}
                      onPointerLeave={() => setHovered(null)}
                      onFocus={() => {
                        setHovered({ row, col });
                        setFocusCell({ row, col });
                      }}
                      onBlur={() => setHovered(null)}
                      onKeyDown={(e) => handleKey(e, row, col)}
                      onClick={() => {
                        if (pinned?.row === row && pinned.col === col)
                          clearSelection();
                        else {
                          setPinned({ row, col });
                          setSelectedGroup(null);
                          setHoverGroup(null);
                        }
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  );
                }),
              )}
            </div>
            <div
              className="marker-layer"
              data-testid={`${config.gender}-markers`}
            >
              {markersVisible &&
                groups.map((g) => {
                  const position = markerPosition(
                    config,
                    g[0].heightCm,
                    g[0].weightKg,
                  )!;
                  return (
                    <button
                      type="button"
                      className="grid-marker"
                      key={g.map((r) => r.id).join(",")}
                      style={{
                        left: `${position.xPct}%`,
                        top: `${position.yPct}%`,
                        background: MARKER_COLORS[g[0].color],
                      }}
                      aria-label={`${g.map((r) => r.label).join("、")}，${g[0].heightCm} cm，${displayWeight(g[0].weightKg, unit)} ${unitLabel(unit)}${g.length > 1 ? `，${g.length} 条记录` : ""}`}
                      aria-describedby={
                        group?.[0].id === g[0].id
                          ? `${config.gender}-detail`
                          : undefined
                      }
                      onPointerEnter={() => setHoverGroup(g)}
                      onPointerLeave={() => setHoverGroup(null)}
                      onFocus={() => setHoverGroup(g)}
                      onBlur={() => setHoverGroup(null)}
                      onClick={() => {
                        if (selectedGroup?.[0].id === g[0].id) clearSelection();
                        else {
                          setSelectedGroup(g);
                          setPinned(null);
                          setHovered(null);
                        }
                      }}
                    >
                      {g.length > 1 ? g.length : <span />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
