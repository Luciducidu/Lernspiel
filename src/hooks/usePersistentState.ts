import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function usePersistentState<T>(
  loadValue: () => T,
  saveValue: (value: T) => void,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => loadValue());

  useEffect(() => {
    saveValue(value);
  }, [saveValue, value]);

  return [value, setValue];
}
