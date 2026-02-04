import { useEffect, useState } from 'react';
import Icon from './ui/Icon';
import Button from './ui/Button';

export default function MobileOptimizer() {
  const [isMobile, setIsMobile] = useState(false);
  const [touchOptimized, setTouchOptimized] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Optimize for touch devices
    if (isMobile) {
      optimizeForTouch();
    }

    // Add mobile-specific optimizations
    addMobileOptimizations();

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  const optimizeForTouch = () => {
    // Increase touch targets
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        /* Increase touch targets */
        button, a, input, select, textarea {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Improve button spacing */
        .btn-group button {
          margin: 4px;
        }
        
        /* Optimize form inputs */
        input, select, textarea {
          font-size: 16px; /* Prevents zoom on iOS */
          padding: 12px;
        }
        
        /* Improve card touch targets */
        .card {
          padding: 16px;
        }
        
        /* Optimize navigation */
        .nav-item {
          padding: 12px 16px;
        }
        
        /* Improve modal touch */
        .modal-content {
          margin: 16px;
          max-height: calc(100vh - 32px);
        }
        
        /* Optimize tables for mobile */
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Improve scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Hide scrollbars on mobile */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* Improve focus indicators for touch */
        .focus-visible {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
        }
      }
    `;
    document.head.appendChild(style);
    setTouchOptimized(true);
  };

  const addMobileOptimizations = () => {
    // Add viewport meta tag if not present
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
      document.head.appendChild(viewportMeta);
    }

    // Add pull-to-refresh prevention
    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const diffY = startY - currentY;
      
      // Prevent pull-to-refresh when scrolling up
      if (diffY < 0 && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      startY = 0;
    };

    const handleOrientationChange = () => {
      // Recalculate layout on orientation change
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    const handleResize = () => {
      // Update mobile state on resize
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    // Add touch event optimizations
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Add mobile-specific event listeners
    document.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
  };

  const showMobileOptimizations = () => {
    if (!isMobile) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <Icon name="device-phone-mobile" size="sm" className="text-primary-600" />
          <span>Optimizado para móvil</span>
        </div>
      </div>
    );
  };

  return showMobileOptimizations();
}
