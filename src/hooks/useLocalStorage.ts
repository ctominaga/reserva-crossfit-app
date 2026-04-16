import { useCallback, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(valueRef.current)
          : next;
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        }
      } catch {
        /* noop */
      }
      valueRef.current = resolved;
      setValueState(resolved);
    },
    [key]
  );

  const reset = useCallback(() => setValue(initial), [setValue, initial]);

  return [value, setValue, reset] as const;
}
