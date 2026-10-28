import { useState } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { WeightGrid } from "./components/WeightGrid";
import { BmiInfo } from "./components/BmiInfo";
import { FEMALE_GRID, MALE_GRID } from "./lib/grid";
import { RecordEditor } from "./components/RecordEditor";
import { RecordList } from "./components/RecordList";
import { useWeightRecords } from "./hooks/useWeightRecords";
import { useStoredPreference } from "./hooks/useStoredPreference";
import type { WeightUnit } from "./lib/units";
export default function App() {
  const [unit, setUnit] = useStoredPreference<WeightUnit>(
    "stature-atlas:weight-unit:v1",
    "kg",
    (value): value is WeightUnit => value === "kg" || value === "jin",
  );
  const [visible, setVisible] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { records, addRecord, updateRecord, deleteRecord, persistenceWarning } =
    useWeightRecords();
  const editing = records.find((record) => record.id === editingId);
  const usedLabels = new Set(
    records
      .filter((record) => record.id !== editingId)
      .map((record) => record.label),
  );
  let automaticLabel = ["小禾", "小满", "晨星", "星河", "小竹", "暖阳"].find(
    (label) => !usedLabels.has(label),
  );
  if (!automaticLabel) {
    let index = 1;
    while (usedLabels.has(`新朋友 ${index}`)) index++;
    automaticLabel = `新朋友 ${index}`;
  }
  return (
    <div className="app-shell">
      <header className="page-header">
        <a href="#" className="brand" aria-label="StatureAtlas 身高体重对照表">
          <span className="brand-icon">
            <img
              src="/icons/icon-64.png"
              srcSet="/icons/icon-96.png 2x, /icons/icon-128.png 3x"
              alt=""
              width="48"
              height="48"
            />
          </span>
          <span className="brand-text">
            <strong>StatureAtlas</strong>
            <h1>身高体重对照表</h1>
          </span>
        </a>
        <div className="header-controls">
          <span className="header-note">
            <ShieldCheck size={15} />
            成人 BMI 参考 · 数据仅保存在本地
          </span>
          <div className="unit-control" role="group" aria-label="体重单位">
            <span>体重单位</span>
            <div>
              {(["kg", "jin"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={unit === value}
                  onClick={() => setUnit(value)}
                >
                  {value === "kg" ? "公斤" : "斤"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main>
        {persistenceWarning && (
          <div className="persistence-warning" role="alert">
            <AlertCircle size={17} />
            {persistenceWarning}
          </div>
        )}
        <div className="workspace">
          <aside className="sidebar">
            <RecordEditor
              automaticLabel={automaticLabel}
              unit={unit}
              key={editing?.id ?? "create"}
              record={editing}
              onCancel={() => setEditingId(null)}
              onSubmit={(draft) => {
                if (editing) {
                  updateRecord(editing.id, draft);
                  setEditingId(null);
                } else addRecord(draft);
              }}
            />
            <RecordList
              unit={unit}
              records={records}
              visible={visible}
              onToggle={() => setVisible((v) => !v)}
              onEdit={(record) => {
                setEditingId(record.id);
                requestAnimationFrame(() =>
                  document.getElementById("record-label")?.focus(),
                );
              }}
              onDelete={(id) => {
                deleteRecord(id);
                if (editingId === id) setEditingId(null);
              }}
            />
            <BmiInfo unit={unit} />
          </aside>
          <div className="charts">
            <WeightGrid
              unit={unit}
              config={FEMALE_GRID}
              records={records}
              markersVisible={visible}
            />
            <WeightGrid
              unit={unit}
              config={MALE_GRID}
              records={records}
              markersVisible={visible}
            />
          </div>
        </div>
      </main>
      <footer className="page-footer">
        <div className="footer-brand">
          <span>StatureAtlas · 身高体重对照表</span>
          <a
            className="source-link"
            href="https://github.com/01Petard"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub @01Petard
          </a>
        </div>
        <span>仅供成人参考，不能替代临床评估。</span>
      </footer>
    </div>
  );
}
