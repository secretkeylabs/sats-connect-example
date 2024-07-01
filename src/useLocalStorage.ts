import { useState } from "react";

const tryParse = <T>(value: string | null, defaultValue: T): T => {
  try {
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export function useLocalStorage<T>(
  key: string
): [T | undefined, (value: T | undefined) => void];

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void];

export function useLocalStorage<T>(
  key: string,
  initialValue?: T
): [T | undefined, (value: T | undefined) => void] | [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T | undefined>(
    () => tryParse(localStorage.getItem(key), initialValue) as T | undefined
  );

  const setValue = (value: T | undefined) => {
    setStoredValue(value);

    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [storedValue, setValue];
}
