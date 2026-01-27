import { useState, useCallback, useRef } from 'react';

/**
 * Enhanced button state management hook
 * Prevents double-clicks, manages loading states, provides debouncing
 */
export function useButtonState(debounceMs: number = 500) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeAction = useCallback(
    async (action: () => Promise<void> | void) => {
      const now = Date.now();

      // Prevent double-clicks within debounce period
      if (now - lastClickTime < debounceMs) {
        return;
      }

      setLastClickTime(now);
      setIsLoading(true);

      try {
        await action();
      } finally {
        // Keep loading state for minimum time to show feedback
        timeoutRef.current = setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    },
    [lastClickTime, debounceMs]
  );

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setLastClickTime(0);
  }, []);

  return {
    isLoading,
    execute: executeAction,
    reset,
  };
}

/**
 * Hook for form submission with Enter key support
 */
export function useFormSubmit(onSubmit: () => void, canSubmit: boolean = true) {
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit, canSubmit]
  );

  return { handleKeyPress };
}
