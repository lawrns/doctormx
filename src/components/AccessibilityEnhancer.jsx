import { useEffect, useState } from 'react';
import Icon from './ui/Icon';
import Button from './ui/Button';

export default function AccessibilityEnhancer() {
  const [isVisible, setIsVisible] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // Font size
    if (fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (fontSize === 'extra-large') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }

    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  const setupKeyboardNavigation = () => {
    const handleKeyboardNavigation = (e) => {
      // Skip to main content
      if (e.key === 'Tab' && e.shiftKey && e.target.id === 'skip-link') {
        e.preventDefault();
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.focus();
        }
      }

      // Close modals with Escape
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          if (modal.style.display !== 'none') {
            modal.style.display = 'none';
          }
        });
      }

      // Navigate with arrow keys in menus
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const menu = e.target.closest('[role="menu"]');
        if (menu) {
          e.preventDefault();
          const items = menu.querySelectorAll('[role="menuitem"]');
          const currentIndex = Array.from(items).indexOf(e.target);
          let nextIndex;
          
          if (e.key === 'ArrowDown') {
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          }
          
          items[nextIndex].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardNavigation);
    return handleKeyboardNavigation;
  };

  const setupFocusManagement = () => {
    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #3b82f6;
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 1000;
      }
      .skip-link:focus {
        top: 6px;
      }
    `;
    document.head.appendChild(style);

    // Add skip link
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      skipLink.textContent = 'Saltar al contenido principal';
      skipLink.className = 'skip-link';
      skipLink.id = 'skip-link';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  };

  const setupScreenReaderAnnouncements = (observers) => {
    // Create live region for announcements
    if (!document.querySelector('#live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Observe form changes
    const formObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const liveRegion = document.querySelector('#live-region');
          if (liveRegion) {
            liveRegion.textContent = 'Formulario actualizado';
          }
        }
      });
    });

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      formObserver.observe(form, { childList: true, subtree: true });
    });

    observers.push(formObserver);
  };

  useEffect(() => {
    const observers = [];
    let keyboardHandler = null;

    // Check for accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Apply accessibility settings
    applyAccessibilitySettings();

    // Set up keyboard navigation
    keyboardHandler = setupKeyboardNavigation();

    // Add focus management
    setupFocusManagement();

    // Add screen reader announcements
    setupScreenReaderAnnouncements(observers);

    // Show accessibility panel in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    return () => {
      // Cleanup
      if (keyboardHandler) {
        document.removeEventListener('keydown', keyboardHandler);
      }
      observers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      });
    };
  }, [fontSize, highContrast, reducedMotion]);

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    applyAccessibilitySettings();
  };

  const handleHighContrastToggle = () => {
    setHighContrast(!highContrast);
    applyAccessibilitySettings();
  };

  const handleReducedMotionToggle = () => {
    setReducedMotion(!reducedMotion);
    applyAccessibilitySettings();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900">Accesibilidad</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-400 hover:text-neutral-600"
          aria-label="Cerrar panel de accesibilidad"
        >
          <Icon name="x-mark" size="sm" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Font Size */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-2">
            Tamaño de fuente
          </label>
          <div className="flex gap-2">
            {[
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Grande' },
              { value: 'extra-large', label: 'Extra Grande' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={fontSize === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleFontSizeChange(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={handleHighContrastToggle}
              className="rounded border-neutral-300"
            />
            <span className="text-xs font-medium text-neutral-700">
              Alto contraste
            </span>
          </label>
        </div>

        {/* Reduced Motion */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={handleReducedMotionToggle}
              className="rounded border-neutral-300"
            />
            <span className="text-xs font-medium text-neutral-700">
              Reducir animaciones
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}