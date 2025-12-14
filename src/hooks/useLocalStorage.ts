import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.get<T>(key);
      return item ?? initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  };

  // Remove function
  const removeValue = () => {
    try {
      storage.remove(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, removeValue];
}
