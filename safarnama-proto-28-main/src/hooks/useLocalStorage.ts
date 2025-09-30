import { useState, useEffect } from 'react';
import { Storage } from '@capacitor/storage';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStoredValue = async () => {
      try {
        const { value } = await Storage.get({ key });
        if (value !== null) {
          setStoredValue(JSON.parse(value));
        }
      } catch (error) {
        console.error(`Error getting stored value for key "${key}":`, error);
      } finally {
        setIsLoading(false);
      }
    };

    getStoredValue();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await Storage.set({
        key,
        value: JSON.stringify(valueToStore),
      });
    } catch (error) {
      console.error(`Error setting stored value for key "${key}":`, error);
    }
  };

  const removeValue = async () => {
    try {
      await Storage.remove({ key });
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing stored value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue, isLoading] as const;
};