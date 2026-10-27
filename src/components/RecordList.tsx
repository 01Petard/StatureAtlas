import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2, Users, MapPin } from "lucide-react";
import { calculateBmi, classifyBmi, STATUS_LABELS } from "../lib/bmi";
import { FEMALE_GRID, MALE_GRID, isInGrid } from "../lib/grid";
import { MARKER_COLORS, type WeightRecord } from "../models/record";
import { displayWeight, unitLabel, type WeightUnit } from "../lib/units";
export function RecordList({
  records,
  unit = "kg",
  visible,
  onToggle,
  onEdit,
  onDelete,
}: {
  records: WeightRecord[];
  unit?: WeightUnit;
  visible: boolean;
  onToggle: () => void;
  onEdit: (record: WeightRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  return (
    <section className="panel records-panel" aria-labelledby="records-title">
      <div className="records-heading">
        <div className="section-heading">
          <Users size={19} />
          <h2 id="records-title">
            我的记录 <span className="record-count">{records.length}</span>
          </h2>
        </div>
        <button
          className="visibility-button"
          disabled={!records.length}
          onClick={onToggle}
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}{" "}
          {visible ? "隐藏标记" : "显示全部标记"}
        </button>
      </div>
      {!visible && <p className="hidden-note">标记已隐藏，记录仍保留。</p>}
      {records.length === 0 ? (
        <div className="empty-records">
          <span>
            <MapPin size={22} />
          </span>
          <strong>还没有记录</strong>
          <p>添加第一组数据，在图表中找到坐标。</p>
        </div>
      ) : (
        <ul className="record-list">
          {records.map((record) => {
            const bmi = calculateBmi(record.heightCm, record.weightKg);
            const status = classifyBmi(bmi);
            const inGrid = isInGrid(
              record.gender === "female" ? FEMALE_GRID : MALE_GRID,
              record.heightCm,
              record.weightKg,
            );
            return (
              <li key={record.id} data-record-id={record.id}>
                <div className="record-summary">
                  <i
                    className="record-dot"
                    style={{ background: MARKER_COLORS[record.color] }}
                  />
                  <div className="record-body">
                    <div className="record-title">
                      <strong>{record.label}</strong>
                      <span className={`record-gender ${record.gender}`}>
                        {record.gender === "female" ? "女" : "男"}
                      </span>
                    </div>
                    <div className="record-data">
                      {record.heightCm} cm <span>/</span>{" "}
                      {displayWeight(record.weightKg, unit)} {unitLabel(unit)}
                    </div>
                  </div>
                  <div className="record-bmi">
                    <strong>{bmi.toFixed(1)}</strong>
                    <span className={`status-text ${status}`}>
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  <div className="record-actions">
                    <button
                      className="icon-button"
                      aria-label={`编辑 ${record.label}`}
                      onClick={() => onEdit(record)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-button delete-button"
                      aria-label={`删除 ${record.label}`}
                      onClick={() => setDeletingId(record.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {!inGrid && (
                  <p className="range-warning">超出当前图表范围，记录已保存</p>
                )}
                {deletingId === record.id && (
                  <div className="delete-confirm">
                    <span>删除这条记录？</span>
                    <button
                      className="confirm-delete"
                      onClick={() => {
                        onDelete(record.id);
                        setDeletingId(null);
                      }}
                    >
                      确认删除
                    </button>
                    <button onClick={() => setDeletingId(null)}>取消</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="storage-note">清理浏览器数据或更换设备后，记录可能丢失。</p>
    </section>
  );
}
