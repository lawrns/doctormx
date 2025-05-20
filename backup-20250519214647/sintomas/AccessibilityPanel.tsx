import { useState, useEffect } from 'react';
import { Sun, Moon, ZoomIn, ZoomOut, Type, MousePointer, ArrowUp, VolumeX, Volume2, X } from 'lucide-react';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  cursorSize: 'normal' | 'large';
  animations: boolean;
  textToSpeech: boolean;
}

interface AccessibilityPanelProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  initialOpen?: boolean;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ 
  position = 'bottom-right',
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    contrast: 'normal',
    cursorSize: 'normal',
    animations: true,
    textToSpeech: false
  });

  // Load saved settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('accessibility_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error('Error loading accessibility settings:', e);
    }
  }, []);

  // Apply settings whenever they change
  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));

    // Apply font size
    document.documentElement.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    document.documentElement.classList.add(`font-size-${settings.fontSize}`);

    // Apply contrast
    document.documentElement.classList.remove('contrast-normal', 'contrast-high');
    document.documentElement.classList.add(`contrast-${settings.contrast}`);

    // Apply cursor size
    document.documentElement.classList.remove('cursor-normal', 'cursor-large');
    document.documentElement.classList.add(`cursor-${settings.cursorSize}`);

    // Apply animation settings
    document.documentElement.classList.toggle('reduce-animations', !settings.animations);

    // Apply custom styles
    applyCustomStyles();
  }, [settings]);

  const applyCustomStyles = () => {
    // Remove any previous style element
    const existingStyle = document.getElementById('accessibility-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and append new style element
    const styleElement = document.createElement('style');
    styleElement.id = 'accessibility-styles';
    
    let cssRules = '';
    
    // Font size rules
    if (settings.fontSize === 'large') {
      cssRules += `
        body { font-size: 18px !important; }
        h1 { font-size: 2.25rem !important; }
        h2 { font-size: 1.75rem !important; }
        h3 { font-size: 1.5rem !important; }
        button, input, select, textarea { font-size: 1.1rem !important; }
      `;
    } else if (settings.fontSize === 'extra-large') {
      cssRules += `
        body { font-size: 22px !important; }
        h1 { font-size: 2.5rem !important; }
        h2 { font-size: 2rem !important; }
        h3 { font-size: 1.75rem !important; }
        button, input, select, textarea { font-size: 1.3rem !important; }
      `;
    }
    
    // High contrast rules
    if (settings.contrast === 'high') {
      cssRules += `
        body { background-color: #ffffff !important; color: #000000 !important; }
        a { color: #0000EE !important; text-decoration: underline !important; }
        a:visited { color: #551A8B !important; }
        button { border: 2px solid #000000 !important; }
        .bg-gray-50, .bg-gray-100, .bg-blue-50, .bg-blue-100 { background-color: #ffffff !important; }
        .border { border-color: #000000 !important; }
        .text-gray-500, .text-gray-600, .text-gray-700 { color: #000000 !important; }
      `;
    }
    
    // Large cursor
    if (settings.cursorSize === 'large') {
      cssRules += `
        * { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="black" d="M11.96 9.5L4 2v12.5L6.62 12l2.38 4l1.45-.87l-2.34-3.94z"/></svg>') 16 16, auto !important; }
        a, button, [role="button"] { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="black" d="M14 7h-4V3c0-.55-.45-1-1-1s-1 .45-1 1v4H4c-.55 0-1 .45-1 1s.45 1 1 1h4v4c0 .55.45 1 1 1s1-.45 1-1V9h4c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>') 16 16, pointer !important; }
      `;
    }
    
    // Reduced animations
    if (!settings.animations) {
      cssRules += `
        *, *::before, *::after {
          animation-duration: 0.0001s !important;
          transition-duration: 0.0001s !important;
          scroll-behavior: auto !important;
        }
      `;
    }
    
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 'normal',
      contrast: 'normal',
      cursorSize: 'normal',
      animations: true,
      textToSpeech: false
    });
  };

  const handleFontSizeChange = (size: AccessibilitySettings['fontSize']) => {
    setSettings({ ...settings, fontSize: size });
  };

  const toggleContrast = () => {
    setSettings({ 
      ...settings, 
      contrast: settings.contrast === 'normal' ? 'high' : 'normal' 
    });
  };

  const toggleCursorSize = () => {
    setSettings({ 
      ...settings, 
      cursorSize: settings.cursorSize === 'normal' ? 'large' : 'normal' 
    });
  };

  const toggleAnimations = () => {
    setSettings({ ...settings, animations: !settings.animations });
  };

  const toggleTextToSpeech = () => {
    setSettings({ ...settings, textToSpeech: !settings.textToSpeech });
    
    // If enabling text-to-speech, initialize it
    if (!settings.textToSpeech) {
      initializeTextToSpeech();
    } else {
      disableTextToSpeech();
    }
  };

  const initializeTextToSpeech = () => {
    // Add event listeners for text-to-speech functionality
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, button, a, label, li').forEach(element => {
      element.setAttribute('tabindex', '0');
      element.addEventListener('focus', handleElementFocus);
    });
  };

  const disableTextToSpeech = () => {
    // Remove event listeners for text-to-speech functionality
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, button, a, label, li').forEach(element => {
      if (element.getAttribute('tabindex') === '0') {
        element.removeAttribute('tabindex');
      }
      element.removeEventListener('focus', handleElementFocus);
    });
  };

  const handleElementFocus = (event: Event) => {
    const element = event.target as HTMLElement;
    const text = element.textContent || '';
    
    if (text && settings.textToSpeech) {
      speak(text);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language to Spanish
      utterance.lang = 'es-ES';
      
      // Speak
      window.speechSynthesis.speak(utterance);
    }
  };

  // Determine position classes
  const getPositionClasses = () => {
    switch(position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div 
      className={`fixed z-50 ${getPositionClasses()} flex flex-col items-end`}
      aria-label="Panel de accesibilidad"
    >
      {/* Main toggle button */}
      <button
        onClick={togglePanel}
        className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label={isOpen ? 'Cerrar panel de accesibilidad' : 'Abrir panel de accesibilidad'}
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="10" r="3"></circle>
          <line x1="12" y1="13" x2="12" y2="16"></line>
          <line x1="9.5" y1="16" x2="14.5" y2="16"></line>
        </svg>
      </button>
      
      {/* Settings panel */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-lg shadow-lg w-64 overflow-hidden animate-fade-in">
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="text-lg font-medium">Accesibilidad</h3>
            <button
              onClick={togglePanel}
              className="text-white hover:text-blue-100"
              aria-label="Cerrar panel"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Font size controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de texto</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFontSizeChange('normal')}
                  className={`flex-1 py-1 px-2 rounded ${
                    settings.fontSize === 'normal' 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  aria-pressed={settings.fontSize === 'normal'}
                >
                  Normal
                </button>
                <button
                  onClick={() => handleFontSizeChange('large')}
                  className={`flex-1 py-1 px-2 rounded ${
                    settings.fontSize === 'large' 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  aria-pressed={settings.fontSize === 'large'}
                >
                  Grande
                </button>
                <button
                  onClick={() => handleFontSizeChange('extra-large')}
                  className={`flex-1 py-1 px-2 rounded ${
                    settings.fontSize === 'extra-large' 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  aria-pressed={settings.fontSize === 'extra-large'}
                >
                  Extra
                </button>
              </div>
            </div>
            
            {/* Contrast toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Contraste alto</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={settings.contrast === 'high'}
                    onChange={toggleContrast}
                    aria-label="Activar contraste alto"
                  />
                  <div className={`block w-10 h-6 rounded-full ${
                    settings.contrast === 'high' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.contrast === 'high' ? 'transform translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
            </div>
            
            {/* Large cursor toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Cursor grande</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={settings.cursorSize === 'large'}
                    onChange={toggleCursorSize}
                    aria-label="Activar cursor grande"
                  />
                  <div className={`block w-10 h-6 rounded-full ${
                    settings.cursorSize === 'large' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.cursorSize === 'large' ? 'transform translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
            </div>
            
            {/* Animations toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Animaciones</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={settings.animations}
                    onChange={toggleAnimations}
                    aria-label="Activar animaciones"
                  />
                  <div className={`block w-10 h-6 rounded-full ${
                    settings.animations ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.animations ? 'transform translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
            </div>
            
            {/* Text-to-speech toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Texto a voz</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={settings.textToSpeech}
                    onChange={toggleTextToSpeech}
                    aria-label="Activar texto a voz"
                  />
                  <div className={`block w-10 h-6 rounded-full ${
                    settings.textToSpeech ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.textToSpeech ? 'transform translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
            </div>
            
            {/* Reset button */}
            <button
              onClick={resetSettings}
              className="w-full mt-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Restablecer valores predeterminados
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;