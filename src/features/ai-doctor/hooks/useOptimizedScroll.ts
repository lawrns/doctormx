import { useCallback, useEffect, useRef, useState } from 'react';

interface ScrollOptions {
  behavior?: 'auto' | 'smooth';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
}

interface OptimizedScrollReturn {
  scrollToBottom: (options?: ScrollOptions) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  isNearBottom: boolean;
  shouldAutoScroll: boolean;
  setShouldAutoScroll: (should: boolean) => void;
}

export function useOptimizedScroll(
  threshold: number = 100,
  autoScrollDelay: number = 100
): OptimizedScrollReturn {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  const checkIfNearBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return false;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= threshold;
  }, [threshold]);

  const scrollToBottom = useCallback((options: ScrollOptions = {}) => {
    const element = scrollRef.current;
    if (!element) return;

    // Clear any pending scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      isScrollingRef.current = true;
      
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: options.behavior || 'smooth',
        block: options.block || 'end',
        inline: options.inline || 'nearest'
      };

      // Scroll to the last child element
      const lastChild = element.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView(scrollOptions);
      } else {
        // Fallback: scroll to bottom manually
        element.scrollTo({
          top: element.scrollHeight,
          behavior: scrollOptions.behavior
        });
      }

      // Reset scrolling flag after animation completes
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    });
  }, []);

  const handleScroll = useCallback(() => {
    // Don't update state if we're programmatically scrolling
    if (isScrollingRef.current) return;

    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);
    
    // Auto-disable scrolling if user scrolls up
    if (!nearBottom && shouldAutoScroll) {
      setShouldAutoScroll(false);
    }
  }, [checkIfNearBottom, shouldAutoScroll]);

  const optimizedScrollToBottom = useCallback((options?: ScrollOptions) => {
    if (!shouldAutoScroll && !isNearBottom) return;
    
    // Debounce rapid scroll calls
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom(options);
    }, autoScrollDelay);
  }, [scrollToBottom, shouldAutoScroll, isNearBottom, autoScrollDelay]);

  // Set up scroll listener with passive event listener for performance
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Use passive listener for better performance
    const scrollListener = handleScroll;
    element.addEventListener('scroll', scrollListener, { passive: true });

    // Initial check
    const initialNearBottom = checkIfNearBottom();
    setIsNearBottom(initialNearBottom);

    return () => {
      element.removeEventListener('scroll', scrollListener);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, checkIfNearBottom]);

  // Re-enable auto-scroll when user scrolls back to bottom
  useEffect(() => {
    if (isNearBottom && !shouldAutoScroll) {
      setShouldAutoScroll(true);
    }
  }, [isNearBottom, shouldAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollToBottom: optimizedScrollToBottom,
    scrollRef,
    isNearBottom,
    shouldAutoScroll,
    setShouldAutoScroll
  };
}