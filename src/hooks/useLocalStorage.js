import { useCallback, useState } from "react";

const readValue = (key, initialValue) => {
  try {
    const item = localStorage.getItem(key);

    if (item === null) return initialValue;

    return JSON.parse(item);
  } catch {
    return initialValue;
  }
};

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));

  const update = useCallback(
    (next) => {
      setValue((previous) => {
        const resolved = typeof next === "function" ? next(previous) : next;

        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // ignore write errors (private mode)
        }

        return resolved;
      });
    },
    [key]
  );

  return [value, update];
}
