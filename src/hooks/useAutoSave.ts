import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  delay: number = 2000,
  enabled: boolean = true
) {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  const save = useCallback(async (dataToSave: T) => {
    setState(prev => ({ ...prev, status: 'saving' }));
    try {
      await saveFunction(dataToSave);
      setState({ status: 'saved', lastSaved: new Date() });
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setState(prev => prev.status === 'saved' ? { ...prev, status: 'idle' } : prev);
      }, 3000);
    } catch (error) {
      setState(prev => ({ ...prev, status: 'error' }));
      console.error('Auto-save error:', error);
    }
  }, [saveFunction]);

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (currentData === previousDataRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      previousDataRef.current = currentData;
      save(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  const manualSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    previousDataRef.current = JSON.stringify(data);
    save(data);
  }, [data, save]);

  return { ...state, manualSave };
}
