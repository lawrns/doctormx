import React, { useEffect, useRef } from 'react';

const FocusTrap = ({ children, active = true, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // Focus the element that opened the modal/trap
        const previouslyFocusedElement = document.querySelector('[data-previously-focused]');
        previouslyFocusedElement?.focus();
      }
    };

    // Focus the first element when trap becomes active
    firstElement?.focus();

    // Store the previously focused element
    const previouslyFocused = document.activeElement;
    if (previouslyFocused && previouslyFocused !== firstElement) {
      previouslyFocused.setAttribute('data-previously-focused', 'true');
    }

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Clean up the data attribute
      const previouslyFocusedElement = document.querySelector('[data-previously-focused]');
      previouslyFocusedElement?.removeAttribute('data-previously-focused');
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default FocusTrap;

