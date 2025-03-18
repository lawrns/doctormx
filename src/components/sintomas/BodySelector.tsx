import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { VALID_BODY_REGIONS } from '../../machines/questionnaireMachine';

const BODY_REGION_LABELS: Record<string, string> = {
  head: 'Cabeza',
  neck: 'Cuello',
  chest: 'Pecho / Tórax',
  abdomen: 'Abdomen',
  left_arm: 'Brazo izquierdo',
  right_arm: 'Brazo derecho',
  left_forearm: 'Antebrazo izquierdo',
  right_forearm: 'Antebrazo derecho',
  left_leg: 'Pierna izquierda',
  right_leg: 'Pierna derecha',
  left_lower_leg: 'Pantorrilla izquierda',
  right_lower_leg: 'Pantorrilla derecha'
};

interface BodySelectorProps {
  onSelectRegion: (region: string) => void;
}

const BodySelector = ({ onSelectRegion }: BodySelectorProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [is3DSupported, setIs3DSupported] = useState(true);
  const [useSimpleView, setUseSimpleView] = useState(false);

  // Check if device supports 3D rendering
  useEffect(() => {
    // More thorough device detection
    const isMobile = window.innerWidth < 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    
    // Default to simple view on mobile or low-memory devices
    if (isMobile || hasLowMemory) {
      setUseSimpleView(true);
    }

    // Add resize listener to handle orientation changes
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      if (isMobileView) {
        setUseSimpleView(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRegionClick = (region: string) => {
    onSelectRegion(region);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecciona la zona afectada</h2>
        <p className="text-gray-600">
          Haz clic en la parte del cuerpo donde sientes molestias para comenzar la evaluación.
        </p>
      </div>

      {useSimpleView ? (
        // Simple 2D view for mobile/low-spec devices
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {VALID_BODY_REGIONS.map((region) => (
            <button
              key={region}
              className={`p-4 rounded-lg border-2 transition-colors ${
                hoveredRegion === region 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              onMouseEnter={() => setHoveredRegion(region)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => handleRegionClick(region)}
            >
              {BODY_REGION_LABELS[region]}
            </button>
          ))}
        </div>
      ) : (
        // Interactive SVG for desktop/high-spec devices
        <div className="relative w-full max-w-md mx-auto h-96 mb-6 px-2 sm:px-0 body-svg-container">
          <svg 
            viewBox="0 0 200 400" 
            className="w-full h-full"
            style={{ touchAction: 'none' }}
          >
            {/* Body outline - simplified human body */}
            <g stroke="black" strokeWidth="1" fill="#E0C2A2">
              {/* Head */}
              <circle 
                cx="100" 
                cy="40" 
                r="30" 
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'head' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('head')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('head')}
              />

              {/* Neck */}
              <rect 
                x="90" 
                y="70" 
                width="20" 
                height="20"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'neck' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('neck')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('neck')}
              />

              {/* Torso/Chest */}
              <rect 
                x="70" 
                y="90" 
                width="60" 
                height="60"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'chest' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('chest')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('chest')}
              />

              {/* Abdomen */}
              <rect 
                x="70" 
                y="150" 
                width="60" 
                height="50"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'abdomen' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('abdomen')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('abdomen')}
              />

              {/* Left Arm */}
              <rect 
                x="40" 
                y="90" 
                width="30" 
                height="50"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'left_arm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('left_arm')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('left_arm')}
              />

              {/* Right Arm */}
              <rect 
                x="130" 
                y="90" 
                width="30" 
                height="50"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'right_arm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('right_arm')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('right_arm')}
              />

              {/* Left Forearm */}
              <rect 
                x="30" 
                y="140" 
                width="30" 
                height="50"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'left_forearm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('left_forearm')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('left_forearm')}
              />

              {/* Right Forearm */}
              <rect 
                x="140" 
                y="140" 
                width="30" 
                height="50"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'right_forearm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('right_forearm')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('right_forearm')}
              />

              {/* Left Leg */}
              <rect 
                x="75" 
                y="200" 
                width="20" 
                height="80"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'left_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('left_leg')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('left_leg')}
              />

              {/* Right Leg */}
              <rect 
                x="105" 
                y="200" 
                width="20" 
                height="80"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'right_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('right_leg')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('right_leg')}
              />

              {/* Left Lower Leg */}
              <rect 
                x="75" 
                y="280" 
                width="20" 
                height="80"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'left_lower_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('left_lower_leg')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('left_lower_leg')}
              />

              {/* Right Lower Leg */}
              <rect 
                x="105" 
                y="280" 
                width="20" 
                height="80"
                className={`cursor-pointer transition-colors ${
                  hoveredRegion === 'right_lower_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                }`}
                onMouseEnter={() => setHoveredRegion('right_lower_leg')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick('right_lower_leg')}
              />
            </g>
          </svg>

          {/* Region tooltip */}
          {hoveredRegion && (
            <div className="absolute top-2 left-2 bg-white shadow-md rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
              {BODY_REGION_LABELS[hoveredRegion]}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setUseSimpleView(!useSimpleView)}
        className="text-blue-600 text-sm flex items-center mb-6 mt-2"
      >
        <Info size={16} className="mr-1" />
        Cambiar a vista {useSimpleView ? '3D interactiva' : 'simple'}
      </button>
      
      {/* Mobile visibility notice */}
      {!useSimpleView && window.innerWidth < 768 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between">
            <div className="ml-3">
              <p className="text-amber-700 text-sm">
                Para una mejor experiencia en dispositivos móviles, recomendamos usar la vista simple.
              </p>
            </div>
            <button 
              onClick={() => setUseSimpleView(true)} 
              className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      <div className="text-gray-500 text-sm">
        <p>Instrucciones:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Selecciona la zona donde sientes el síntoma principal</li>
          <li>Si tienes múltiples síntomas, comienza por el más intenso</li>
          <li>Después de seleccionar una zona, responderás algunas preguntas específicas</li>
        </ul>
      </div>
    </div>
  );
};

export default BodySelector;