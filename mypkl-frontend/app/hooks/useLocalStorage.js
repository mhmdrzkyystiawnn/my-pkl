/**
 * useLocalStorage.js
 * Custom hook untuk menangani LocalStorage dengan aman di Next.js
 * Menangani Hydration Error
 */

'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // State untuk menyimpan nilai
  const [storedValue, setStoredValue] = useState(initialValue);
  // State untuk menandai apakah sudah di-mount
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, isMounted]);

  // Fungsi untuk menyimpan nilai
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isMounted];
}

export default useLocalStorage;