import { useCallback, useState } from "react";

const STORAGE_KEY = "ovid:wordCountGoal";

function loadGoal(): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function useWordCountGoal() {
  const [goal, setGoalState] = useState<number | null>(loadGoal);

  const setGoal = useCallback((n: number | null) => {
    setGoalState(n);
    try {
      if (n === null) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, String(n));
      }
    } catch {
      // ignore
    }
  }, []);

  return { goal, setGoal };
}
