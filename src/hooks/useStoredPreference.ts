import { useEffect, useState } from "react";

export function useStoredPreference<T>(
  key: string,
  defaultValue: T,
  isValid: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      const saved: unknown = raw === null ? null : JSON.parse(raw);
      return isValid(saved) ? saved : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the control usable when browser storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
