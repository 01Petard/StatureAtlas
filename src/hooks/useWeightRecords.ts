import { useEffect, useState } from "react";
import { loadRecords, saveRecords } from "../lib/storage";
import type { RecordDraft, WeightRecord } from "../models/record";
export function useWeightRecords() {
  const [initial] = useState(loadRecords);
  const [records, setRecords] = useState<WeightRecord[]>(initial.records);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  // Persisting is an external side effect; report its failure without blocking in-memory CRUD.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveWarning(saveRecords(records));
  }, [records]);
  function addRecord(draft: RecordDraft) {
    const now = new Date().toISOString();
    const record = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setRecords((previous) => [...previous, record]);
  }
  function updateRecord(id: string, draft: RecordDraft) {
    const now = new Date().toISOString();
    setRecords((previous) =>
      previous.map((record) =>
        record.id === id ? { ...record, ...draft, updatedAt: now } : record,
      ),
    );
  }
  function deleteRecord(id: string) {
    setRecords((previous) => previous.filter((record) => record.id !== id));
  }
  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    persistenceWarning:
      [initial.warning, saveWarning].filter(Boolean).join(" ") || null,
  };
}
