import { useEffect, useState } from 'react';
import Icon from './ui/Icon';
import Button from './ui/Button';

export default function AccessibilityEnhancer() {
  const [isVisible, setIsVisible] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Apply accessibility settings
    applyAccessibilitySettings();

    // Set up keyboard navigation
    setupKeyboardNavigation();

    // Add focus management
    setupFocusManagement();

    // Add screen reader announcements
    setupScreenReaderAnnouncements();

    // Show accessibility panel in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    return () => {
      // Cleanup
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, []);

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
  };

  const setupFocusManagement = () => {
    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      .high-contrast {
        --primary-600: #000000;
        --neutral-900: #000000;
        --neutral-700: #000000;
        --neutral-600: #000000;
        --neutral-500: #000000;
        --neutral-400: #000000;
        --neutral-300: #000000;
        --neutral-200: #000000;
        --neutral-100: #ffffff;
        --neutral-50: #ffffff;
        --white: #ffffff;
        --black: #000000;
      }
      
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);

    // Add focus management for modals
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    });
  };

  const setupScreenReaderAnnouncements = () => {
    // Create announcement region
    const announcementRegion = document.createElement('div');
    announcementRegion.setAttribute('aria-live', 'polite');
    announcementRegion.setAttribute('aria-atomic', 'true');
    announcementRegion.className = 'sr-only';
    announcementRegion.id = 'announcements';
    document.body.appendChild(announcementRegion);

    // Announce page changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const newNodes = Array.from(mutation.addedNodes);
          newNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const heading = node.querySelector('h1, h2, h3');
              if (heading) {
                announcementRegion.textContent = `Nueva sección: ${heading.textContent}`;
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={handleHighContrastToggle}
              className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-xs text-neutral-700">Alto contraste</span>
          </label>
        </div>

        {/* Reduced Motion */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={handleReducedMotionToggle}
              className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-xs text-neutral-700">Reducir animaciones</span>
          </label>
        </div>

        {/* Keyboard Shortcuts */}
        <div>
          <h4 className="text-xs font-medium text-neutral-700 mb-2">Atajos de teclado</h4>
          <div className="text-xs text-neutral-600 space-y-1">
            <div>Tab: Navegar</div>
            <div>Enter: Activar</div>
            <div>Escape: Cerrar</div>
            <div>Flechas: Menús</div>
          </div>
        </div>
      </div>
    </div>
  );
}
