import { useState } from "react";

export function useLocalStorage<T extends string = string>(
  key: string
): [T | undefined, (value: T | undefined) => void];

export function useLocalStorage<T extends string = string>(
  key: string,
  initialValue: T
): [T, (value: T) => void];

export function useLocalStorage<T extends string = string>(
  key: string,
  initialValue?: T
): [T | undefined, (value: T | undefined) => void] | [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T | undefined>(
    () => (localStorage.getItem(key) || initialValue) as T | undefined
  );

  const setValue = (value: T | undefined) => {
    setStoredValue(value);

    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  };

  return [storedValue, setValue];
}
