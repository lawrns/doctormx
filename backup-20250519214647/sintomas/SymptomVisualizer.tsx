import { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateClockwise, Info, X, Maximize2, Minimize2 } from 'lucide-react';

interface AnatomicalPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  relatedConditions?: string[];
  description?: string;
  additionalInfo?: string;
}

interface BodyPart {
  id: string;
  name: string;
  path: string;
  points?: AnatomicalPoint[];
  description?: string;
  color?: string;
  highlightColor?: string;
}

interface BodyModel {
  id: string;
  name: string;
  viewBox: string;
  parts: BodyPart[];
  backgroundPath?: string;
}

interface SymptomVisualizerProps {
  bodyRegion?: string;
  symptomId?: string;
  highlightedParts?: string[];
  width?: number | string;
  height?: number | string;
  initialView?: 'front' | 'side' | 'back';
  anatomicalView?: boolean;
  interactive?: boolean;
  onPartClick?: (partId: string) => void;
}

// Sample data for the head/brain model
const headModel: BodyModel = {
  id: 'head',
  name: 'Cabeza',
  viewBox: '0 0 200 200',
  backgroundPath: 'M100,20 C60,20 30,50 30,100 C30,150 70,180 100,180 C130,180 170,150 170,100 C170,50 140,20 100,20 Z',
  parts: [
    {
      id: 'frontal_lobe',
      name: 'Lóbulo Frontal',
      path: 'M70,60 C80,50 120,50 130,60 C130,70 130,80 130,90 C120,90 80,90 70,90 C70,80 70,70 70,60 Z',
      color: '#E57373',
      highlightColor: '#F44336',
      description: 'Responsable de funciones cognitivas superiores como pensamiento, planificación, memoria y control de movimientos voluntarios.'
    },
    {
      id: 'parietal_lobe',
      name: 'Lóbulo Parietal',
      path: 'M70,90 C80,90 120,90 130,90 C130,100 130,110 130,120 C120,120 80,120 70,120 C70,110 70,100 70,90 Z',
      color: '#81C784',
      highlightColor: '#4CAF50',
      description: 'Procesa información sensorial como tacto, temperatura y dolor, y ayuda en la percepción espacial y la coordinación.'
    },
    {
      id: 'temporal_lobe',
      name: 'Lóbulo Temporal',
      path: 'M50,90 C60,90 70,90 70,90 C70,100 70,110 70,120 C60,120 50,110 50,100 C50,95 50,90 50,90 Z M150,90 C140,90 130,90 130,90 C130,100 130,110 130,120 C140,120 150,110 150,100 C150,95 150,90 150,90 Z',
      color: '#64B5F6',
      highlightColor: '#2196F3',
      description: 'Involucrado en el procesamiento auditivo, la comprensión del lenguaje, la formación de nuevos recuerdos y aspectos de la emoción.'
    },
    {
      id: 'occipital_lobe',
      name: 'Lóbulo Occipital',
      path: 'M70,120 C80,120 120,120 130,120 C130,130 120,150 100,150 C80,150 70,130 70,120 Z',
      color: '#FFD54F',
      highlightColor: '#FFC107',
      description: 'Centro de procesamiento visual del cerebro, responsable de la interpretación de imágenes.'
    },
    {
      id: 'cerebellum',
      name: 'Cerebelo',
      path: 'M80,150 C90,160 110,160 120,150 C115,160 105,170 100,170 C95,170 85,160 80,150 Z',
      color: '#9575CD',
      highlightColor: '#673AB7',
      description: 'Coordina el movimiento muscular, el equilibrio y la postura.'
    },
    {
      id: 'brainstem',
      name: 'Tronco Encefálico',
      path: 'M95,170 L105,170 L105,180 L95,180 Z',
      color: '#F06292',
      highlightColor: '#E91E63',
      description: 'Conecta el cerebro con la médula espinal y controla funciones automáticas como respiración, ritmo cardíaco y ciclos de sueño.'
    }
  ]
};

// Sample data for digestive system model
const digestiveModel: BodyModel = {
  id: 'digestive',
  name: 'Sistema Digestivo',
  viewBox: '0 0 200 350',
  backgroundPath: 'M70,30 C50,70 40,120 40,180 C40,240 60,290 100,320 C140,290 160,240 160,180 C160,120 150,70 130,30 C110,40 90,40 70,30 Z',
  parts: [
    {
      id: 'mouth',
      name: 'Boca',
      path: 'M85,40 L115,40 L115,50 L85,50 Z',
      color: '#FFCCBC',
      highlightColor: '#FF5722',
      description: 'Inicio del sistema digestivo donde comienza la digestión mecánica y química de los alimentos.'
    },
    {
      id: 'esophagus',
      name: 'Esófago',
      path: 'M95,50 L105,50 L105,90 L95,90 Z',
      color: '#FFCCBC',
      highlightColor: '#FF5722',
      description: 'Tubo muscular que transporta los alimentos desde la boca hasta el estómago.'
    },
    {
      id: 'stomach',
      name: 'Estómago',
      path: 'M80,90 C70,100 70,120 80,130 C90,140 110,140 120,130 C130,120 130,100 120,90 C110,85 90,85 80,90 Z',
      color: '#FFCCBC',
      highlightColor: '#FF5722',
      description: 'Órgano muscular que digiere proteínas y otros nutrientes mediante ácidos y enzimas.'
    },
    {
      id: 'liver',
      name: 'Hígado',
      path: 'M60,80 C50,90 50,110 60,120 C70,130 90,120 90,110 C90,100 90,90 80,80 C75,75 65,75 60,80 Z',
      color: '#A5D6A7',
      highlightColor: '#4CAF50',
      description: 'Órgano vital que filtra la sangre, desintoxica sustancias químicas y metaboliza medicamentos.'
    },
    {
      id: 'gallbladder',
      name: 'Vesícula Biliar',
      path: 'M75,110 C70,115 70,120 75,125 C80,130 85,130 90,125 C95,120 95,115 90,110 C85,105 80,105 75,110 Z',
      color: '#81D4FA',
      highlightColor: '#03A9F4',
      description: 'Almacena y concentra la bilis producida por el hígado para ayudar en la digestión de grasas.'
    },
    {
      id: 'pancreas',
      name: 'Páncreas',
      path: 'M110,110 C115,105 130,105 135,110 C140,115 140,120 135,125 C130,130 115,130 110,125 C105,120 105,115 110,110 Z',
      color: '#FFCC80',
      highlightColor: '#FF9800',
      description: 'Glándula que produce enzimas digestivas e insulina para regular el azúcar en la sangre.'
    },
    {
      id: 'small_intestine',
      name: 'Intestino Delgado',
      path: 'M70,140 C70,150 80,160 90,160 C100,170 110,170 120,160 C130,160 140,150 140,140 C140,130 130,130 120,140 C110,150 90,150 80,140 C70,130 70,130 70,140 Z',
      color: '#FFCCBC',
      highlightColor: '#FF5722',
      description: 'Principal sitio de digestión y absorción de nutrientes.'
    },
    {
      id: 'large_intestine',
      name: 'Intestino Grueso',
      path: 'M60,170 C50,190 50,210 60,230 C70,250 90,260 110,260 C130,260 150,250 160,230 C170,210 170,190 160,170 C150,150 120,180 100,180 C80,180 70,150 60,170 Z',
      color: '#FFCCBC',
      highlightColor: '#FF5722',
      description: 'Absorbe agua y electrolitos, y forma las heces.'
    },
    {
      id: 'appendix',
      name: 'Apéndice',
      path: 'M60,200 C55,200 50,205 50,210 C50,215 55,220 60,220 C65,220 65,215 65,210 C65,205 65,200 60,200 Z',
      color: '#FFCCBC',
      highlightColor: '#FF5722',
      description: 'Pequeño saco conectado al intestino grueso que puede inflamarse y causar apendicitis.'
    },
    {
      id: 'rectum',
      name: 'Recto',
      path: 'M95,260 L105,260 L105,280 L95,280 Z',
      color: '#FFCCBC',
      highlightColor: '#FF5722',
      description: 'Parte final del intestino grueso donde se almacenan las heces antes de la defecación.'
    }
  ]
};

// Helper function to get the appropriate model based on body region
const getAnatomicalModel = (bodyRegion?: string): BodyModel => {
  if (bodyRegion === 'head') return headModel;
  if (bodyRegion === 'abdomen') return digestiveModel;
  
  // Default model or fallback
  return headModel;
};

const SymptomVisualizer: React.FC<SymptomVisualizerProps> = ({
  bodyRegion,
  symptomId,
  highlightedParts = [],
  width = '100%',
  height = '400px',
  initialView = 'front',
  anatomicalView = true,
  interactive = true,
  onPartClick
}) => {
  const [model, setModel] = useState<BodyModel>(getAnatomicalModel(bodyRegion));
  const [currentView, setCurrentView] = useState<'front' | 'side' | 'back'>(initialView);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [infoPosition, setInfoPosition] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Update model when bodyRegion changes
    setModel(getAnatomicalModel(bodyRegion));
  }, [bodyRegion]);

  useEffect(() => {
    // Set highlighted part as selected if only one is provided and no part is currently selected
    if (highlightedParts.length === 1 && !selectedPart) {
      setSelectedPart(highlightedParts[0]);
    }
  }, [highlightedParts, selectedPart]);

  const handleZoomIn = () => {
    if (zoom < 3) setZoom(prev => prev + 0.25);
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) setZoom(prev => prev - 0.25);
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

  const handlePartClick = (partId: string, event: React.MouseEvent) => {
    setSelectedPart(prevSelected => (prevSelected === partId ? null : partId));
    
    // Position the info popup near the click
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      setInfoPosition({
        x: (event.clientX - svgRect.left) / svgRect.width * 100,
        y: (event.clientY - svgRect.top) / svgRect.height * 100
      });
    }
    
    if (onPartClick) {
      onPartClick(partId);
    }
  };

  const closeInfo = () => {
    setSelectedPart(null);
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

  // Find the selected part object
  const getSelectedPartDetails = () => {
    if (!selectedPart) return null;
    return model.parts.find(part => part.id === selectedPart);
  };

  const selectedPartDetails = getSelectedPartDetails();

  return (
    <div 
      ref={containerRef}
      className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden"
      style={{ height: typeof height === 'string' ? height : `${height}px` }}
    >
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex justify-between items-center">
        <h3 className="text-sm font-medium text-blue-900">
          {anatomicalView ? 'Vista Anatómica' : 'Localización de Síntomas'}: {model.name}
        </h3>
        
        {interactive && (
          <div className="flex space-x-1">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-gray-700 hover:text-blue-700 hover:bg-blue-100 rounded"
              aria-label="Acercar"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-gray-700 hover:text-blue-700 hover:bg-blue-100 rounded"
              aria-label="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={handleRotate}
              className="p-1.5 text-gray-700 hover:text-blue-700 hover:bg-blue-100 rounded"
              aria-label="Rotar"
            >
              <RotateClockwise size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-700 hover:text-blue-700 hover:bg-blue-100 rounded"
              aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        )}
      </div>
      
      <div className="relative h-full">
        {/* View selector */}
        {interactive && model.id !== 'head' && (
          <div className="absolute top-2 left-2 z-10 bg-white rounded-lg shadow border border-gray-200 p-1 flex">
            <button
              onClick={() => setCurrentView('front')}
              className={`px-2 py-1 text-xs rounded ${
                currentView === 'front' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Frontal
            </button>
            <button
              onClick={() => setCurrentView('side')}
              className={`px-2 py-1 text-xs rounded ${
                currentView === 'side' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Lateral
            </button>
            <button
              onClick={() => setCurrentView('back')}
              className={`px-2 py-1 text-xs rounded ${
                currentView === 'back' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Posterior
            </button>
          </div>
        )}
        
        <div 
          className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
          style={{ 
            touchAction: interactive ? 'none' : 'auto',
            backgroundColor: '#f8fafc'
          }}
        >
          <svg 
            ref={svgRef}
            viewBox={model.viewBox} 
            width="100%" 
            height="100%"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            className="max-h-full"
          >
            {/* Background body outline */}
            {model.backgroundPath && (
              <path 
                d={model.backgroundPath} 
                fill="#f0f0f0" 
                stroke="#d1d5db" 
                strokeWidth="1"
              />
            )}
            
            {/* Body parts */}
            {model.parts.map((part) => {
              const isHighlighted = highlightedParts.includes(part.id);
              const isSelected = selectedPart === part.id;
              
              return (
                <path
                  key={part.id}
                  d={part.path}
                  fill={isHighlighted || isSelected ? part.highlightColor : part.color}
                  stroke="#000"
                  strokeWidth="0.5"
                  opacity={isHighlighted || isSelected ? 1 : anatomicalView ? 1 : 0.6}
                  className={`transition-colors duration-200 ${interactive ? 'cursor-pointer hover:opacity-90' : ''}`}
                  onClick={interactive ? (e) => handlePartClick(part.id, e) : undefined}
                >
                  <title>{part.name}</title>
                </path>
              );
            })}
            
            {/* Anatomical points if any */}
            {model.parts.filter(part => part.points).map(part => (
              part.points?.map(point => (
                <circle
                  key={point.id}
                  cx={point.x}
                  cy={point.y}
                  r={point.radius}
                  fill={point.color}
                  stroke="#000"
                  strokeWidth="0.3"
                  opacity={0.8}
                />
              ))
            ))}
          </svg>
        </div>
        
        {/* Information panel for selected part */}
        {selectedPartDetails && (
          <div 
            className="absolute p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs"
            style={{
              top: `${Math.min(Math.max(infoPosition.y, 10), 90)}%`,
              left: `${Math.min(Math.max(infoPosition.x, 10), 70)}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-900">{selectedPartDetails.name}</h4>
              <button 
                onClick={closeInfo}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            
            {selectedPartDetails.description && (
              <p className="text-xs text-gray-600 mb-2">{selectedPartDetails.description}</p>
            )}
            
            {/* If there are related conditions, show them */}
            {selectedPartDetails.relatedConditions && selectedPartDetails.relatedConditions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700">Condiciones relacionadas:</p>
                <ul className="text-xs text-gray-600 mt-1 ml-4 list-disc">
                  {selectedPartDetails.relatedConditions.map((condition, idx) => (
                    <li key={idx}>{condition}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded-lg border border-gray-200 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 mr-2"></div>
            <span className="text-gray-700">Normal</span>
          </div>
          {highlightedParts.length > 0 && (
            <div className="flex items-center mt-1">
              <div className="w-4 h-4 bg-red-500 mr-2"></div>
              <span className="text-gray-700">Zona afectada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomVisualizer;