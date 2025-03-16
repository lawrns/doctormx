import { useState, useEffect, useRef } from 'react';
import { Info, RotateCw, ZoomIn, ZoomOut, Maximize, Minimize, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { VALID_BODY_REGIONS } from '../../machines/questionnaireMachine';

const BODY_REGION_LABELS: Record<string, string> = {
  head: 'Cabeza',
  neck: 'Cuello',
  chest: 'Pecho / Tórax',
  abdomen: 'Abdomen',
  back: 'Espalda',
  left_arm: 'Brazo izquierdo',
  right_arm: 'Brazo derecho',
  left_forearm: 'Antebrazo izquierdo',
  right_forearm: 'Antebrazo derecho',
  left_hand: 'Mano izquierda',
  right_hand: 'Mano derecha',
  left_leg: 'Pierna izquierda',
  right_leg: 'Pierna derecha',
  left_lower_leg: 'Pantorrilla izquierda',
  right_lower_leg: 'Pantorrilla derecha',
  left_foot: 'Pie izquierdo',
  right_foot: 'Pie derecho'
};

// Medical details for each body region to add educational value
const BODY_REGION_DETAILS: Record<string, { description: string, commonSymptoms: string[] }> = {
  head: {
    description: 'Incluye el cráneo, cerebro, ojos, oídos, nariz y boca.',
    commonSymptoms: ['Dolor de cabeza', 'Migraña', 'Mareos', 'Problemas visuales', 'Congestión nasal']
  },
  neck: {
    description: 'Conecta la cabeza con el torso, contiene la médula espinal, laringe y esófago.',
    commonSymptoms: ['Dolor de cuello', 'Rigidez', 'Dificultad para tragar', 'Ganglios inflamados']
  },
  chest: {
    description: 'Contiene el corazón, pulmones y grandes vasos sanguíneos.',
    commonSymptoms: ['Dolor de pecho', 'Dificultad para respirar', 'Palpitaciones', 'Tos']
  },
  abdomen: {
    description: 'Alberga el estómago, intestinos, hígado, vesícula biliar y otros órganos digestivos.',
    commonSymptoms: ['Dolor abdominal', 'Náuseas', 'Distensión', 'Acidez', 'Cambios en hábitos intestinales']
  },
  back: {
    description: 'Incluye la columna vertebral, músculos y nervios que soportan el cuerpo.',
    commonSymptoms: ['Dolor lumbar', 'Dolor en la parte media de la espalda', 'Rigidez', 'Dolores musculares']
  }
};

interface Enhanced3DBodySelectorProps {
  onSelectRegion: (region: string) => void;
  initialView?: 'front' | 'back' | '3d';
}

const Enhanced3DBodySelector = ({ onSelectRegion, initialView = 'front' }: Enhanced3DBodySelectorProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'front' | 'back' | '3d'>(initialView);
  const [is3DSupported, setIs3DSupported] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if device supports 3D rendering
  useEffect(() => {
    // More comprehensive detection
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch (e) {
        return false;
      }
    };
    
    const isMobile = window.innerWidth < 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const hasWebGL = checkWebGLSupport();
    
    setIs3DSupported(hasWebGL && !(isMobile && hasLowMemory));
    
    // Default to front view on mobile or low-spec devices
    if (isMobile || hasLowMemory) {
      setSelectedView('front');
    }
  }, []);

  const handleRegionClick = (region: string) => {
    onSelectRegion(region);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 2) {
      setZoomLevel(prev => prev + 0.2);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.6) {
      setZoomLevel(prev => prev - 0.2);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 45) % 360);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const renderBodyView = () => {
    if (selectedView === '3d' && is3DSupported) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="relative w-64 h-80 transition-transform duration-500"
            style={{
              transform: `scale(${zoomLevel}) rotateY(${rotation}deg)`
            }}
          >
            {/* This would be a 3D model in a real implementation */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <p className="text-center">En una implementación real, aquí se mostraría un modelo 3D interactivo del cuerpo humano usando WebGL/Three.js</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="relative w-full max-w-md mx-auto h-96"
        style={{
          transform: `scale(${zoomLevel})`
        }}
      >
        <svg 
          viewBox="0 0 200 400" 
          className="w-full h-full"
          style={{ touchAction: 'none' }}
        >
          {/* Body outline - enhanced human body */}
          <g stroke="black" strokeWidth="1" fill="#E0C2A2">
            {selectedView === 'front' ? (
              // Front view
              <>
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

                {/* Chest */}
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

                {/* Arms and legs with more anatomical detail */}
                {/* Left Arm */}
                <path 
                  d="M40,100 Q35,120 35,140 L35,140 Q35,145 40,150 L40,150 L60,150 L60,150 Q65,145 65,140 L65,140 Q65,120 60,100 L60,100 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_arm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_arm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_arm')}
                />

                {/* Right Arm */}
                <path 
                  d="M160,100 Q165,120 165,140 L165,140 Q165,145 160,150 L160,150 L140,150 L140,150 Q135,145 135,140 L135,140 Q135,120 140,100 L140,100 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_arm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_arm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_arm')}
                />

                {/* Left Forearm */}
                <path 
                  d="M40,150 Q35,160 30,170 L30,170 Q30,175 35,180 L35,180 L55,180 L55,180 Q60,175 60,170 L60,170 Q55,160 60,150 L60,150 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_forearm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_forearm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_forearm')}
                />

                {/* Right Forearm */}
                <path 
                  d="M160,150 Q165,160 170,170 L170,170 Q170,175 165,180 L165,180 L145,180 L145,180 Q140,175 140,170 L140,170 Q145,160 140,150 L140,150 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_forearm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_forearm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_forearm')}
                />

                {/* Left Hand */}
                <ellipse 
                  cx="42.5" 
                  cy="190" 
                  rx="12.5" 
                  ry="10"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_hand' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_hand')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_hand')}
                />

                {/* Right Hand */}
                <ellipse 
                  cx="157.5" 
                  cy="190" 
                  rx="12.5" 
                  ry="10"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_hand' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_hand')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_hand')}
                />

                {/* Left Leg */}
                <path 
                  d="M70,200 Q70,230 75,260 L75,260 Q75,265 80,270 L80,270 L95,270 L95,270 Q100,265 100,260 L100,260 Q100,230 98,200 L98,200 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_leg')}
                />

                {/* Right Leg */}
                <path 
                  d="M130,200 Q130,230 125,260 L125,260 Q125,265 120,270 L120,270 L105,270 L105,270 Q100,265 100,260 L100,260 Q100,230 102,200 L102,200 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_leg')}
                />

                {/* Left Lower Leg */}
                <path 
                  d="M80,270 Q80,300 75,330 L75,330 Q75,335 80,340 L80,340 L95,340 L95,340 Q100,335 100,330 L100,330 Q95,300 95,270 L95,270 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_lower_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_lower_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_lower_leg')}
                />

                {/* Right Lower Leg */}
                <path 
                  d="M120,270 Q120,300 125,330 L125,330 Q125,335 120,340 L120,340 L105,340 L105,340 Q100,335 100,330 L100,330 Q105,300 105,270 L105,270 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_lower_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_lower_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_lower_leg')}
                />

                {/* Left Foot */}
                <ellipse 
                  cx="85" 
                  cy="350" 
                  rx="15" 
                  ry="10"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_foot' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_foot')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_foot')}
                />

                {/* Right Foot */}
                <ellipse 
                  cx="115" 
                  cy="350" 
                  rx="15" 
                  ry="10"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_foot' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_foot')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_foot')}
                />
              </>
            ) : (
              // Back view
              <>
                {/* Head - back view */}
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

                {/* Neck - back view */}
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

                {/* Back */}
                <rect 
                  x="70" 
                  y="90" 
                  width="60" 
                  height="110"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'back' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('back')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('back')}
                />

                {/* Left Arm - back view */}
                <path 
                  d="M40,100 Q35,120 35,140 L35,140 Q35,145 40,150 L40,150 L60,150 L60,150 Q65,145 65,140 L65,140 Q65,120 60,100 L60,100 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_arm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_arm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_arm')}
                />

                {/* Right Arm - back view */}
                <path 
                  d="M160,100 Q165,120 165,140 L165,140 Q165,145 160,150 L160,150 L140,150 L140,150 Q135,145 135,140 L135,140 Q135,120 140,100 L140,100 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_arm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_arm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_arm')}
                />

                {/* Left Forearm - back view */}
                <path 
                  d="M40,150 Q35,160 30,170 L30,170 Q30,175 35,180 L35,180 L55,180 L55,180 Q60,175 60,170 L60,170 Q55,160 60,150 L60,150 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_forearm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_forearm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_forearm')}
                />

                {/* Right Forearm - back view */}
                <path 
                  d="M160,150 Q165,160 170,170 L170,170 Q170,175 165,180 L165,180 L145,180 L145,180 Q140,175 140,170 L140,170 Q145,160 140,150 L140,150 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_forearm' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_forearm')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_forearm')}
                />

                {/* Back legs similar to front view but with minor adjustments */}
                {/* Left Leg */}
                <path 
                  d="M70,200 Q70,230 75,260 L75,260 Q75,265 80,270 L80,270 L95,270 L95,270 Q100,265 100,260 L100,260 Q100,230 98,200 L98,200 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_leg')}
                />

                {/* Right Leg */}
                <path 
                  d="M130,200 Q130,230 125,260 L125,260 Q125,265 120,270 L120,270 L105,270 L105,270 Q100,265 100,260 L100,260 Q100,230 102,200 L102,200 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_leg')}
                />

                {/* Left Lower Leg */}
                <path 
                  d="M80,270 Q80,300 75,330 L75,330 Q75,335 80,340 L80,340 L95,340 L95,340 Q100,335 100,330 L100,330 Q95,300 95,270 L95,270 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'left_lower_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('left_lower_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('left_lower_leg')}
                />

                {/* Right Lower Leg */}
                <path 
                  d="M120,270 Q120,300 125,330 L125,330 Q125,335 120,340 L120,340 L105,340 L105,340 Q100,335 100,330 L100,330 Q105,300 105,270 L105,270 Z"
                  className={`cursor-pointer transition-colors ${
                    hoveredRegion === 'right_lower_leg' ? 'fill-blue-300' : 'hover:fill-blue-200'
                  }`}
                  onMouseEnter={() => setHoveredRegion('right_lower_leg')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick('right_lower_leg')}
                />
              </>
            )}
          </g>
        </svg>

        {/* Region tooltip */}
        {hoveredRegion && (
          <div className="absolute top-2 left-2 bg-white shadow-md rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
            {BODY_REGION_LABELS[hoveredRegion]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6" ref={containerRef}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecciona la zona afectada</h2>
        <p className="text-gray-600">
          Haz clic en la parte del cuerpo donde sientes molestias para comenzar la evaluación.
        </p>
      </div>

      <div className="relative mb-6 h-96 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
        {/* View controls */}
        <div className="absolute top-2 right-2 flex space-x-2 z-10 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setSelectedView('front')}
            className={`p-2 rounded-md ${selectedView === 'front' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Vista frontal"
          >
            Frontal
          </button>
          <button
            onClick={() => setSelectedView('back')}
            className={`p-2 rounded-md ${selectedView === 'back' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Vista posterior"
          >
            Posterior
          </button>
          {is3DSupported && (
            <button
              onClick={() => setSelectedView('3d')}
              className={`p-2 rounded-md ${selectedView === '3d' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Vista 3D"
            >
              3D
            </button>
          )}
        </div>

        {/* Zoom and rotation controls */}
        <div className="absolute bottom-2 right-2 z-10 flex flex-col space-y-2 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            title="Acercar"
            disabled={zoomLevel >= 2}
          >
            <ZoomIn size={20} className={zoomLevel >= 2 ? 'opacity-50' : ''} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            title="Alejar"
            disabled={zoomLevel <= 0.6}
          >
            <ZoomOut size={20} className={zoomLevel <= 0.6 ? 'opacity-50' : ''} />
          </button>
          {selectedView === '3d' && (
            <button
              onClick={handleRotate}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              title="Rotar"
            >
              <RotateCw size={20} />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-md ${showDetails ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title={showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
          >
            {showDetails ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Body visualization */}
        {renderBodyView()}
      </div>

      {/* Medical information for educational purposes */}
      {showDetails && hoveredRegion && BODY_REGION_DETAILS[hoveredRegion] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-50 rounded-lg p-4"
        >
          <h3 className="font-medium text-blue-800 mb-2">{BODY_REGION_LABELS[hoveredRegion]}</h3>
          <p className="text-blue-700 mb-2">{BODY_REGION_DETAILS[hoveredRegion].description}</p>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Síntomas comunes en esta zona:</p>
            <ul className="list-disc pl-5 text-sm text-blue-700">
              {BODY_REGION_DETAILS[hoveredRegion].commonSymptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* List of all available body regions for accessibility */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
        {Object.keys(BODY_REGION_LABELS).map((region) => (
          <button
            key={region}
            className={`p-2 text-sm rounded-md border transition-colors text-left ${
              hoveredRegion === region 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
            }`}
            onMouseEnter={() => setHoveredRegion(region)}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => handleRegionClick(region)}
          >
            {BODY_REGION_LABELS[region]}
          </button>
        ))}
      </div>

      <div className="text-gray-500 text-sm">
        <div className="flex items-start">
          <Info size={16} className="mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="mb-1">Instrucciones:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Selecciona la zona donde sientes el síntoma principal</li>
              <li>Usa los controles para cambiar entre vistas frontal y posterior</li>
              <li>Si tienes múltiples síntomas, comienza por el más intenso</li>
              <li>Para síntomas generales como fiebre, selecciona "Cuerpo completo"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DBodySelector;