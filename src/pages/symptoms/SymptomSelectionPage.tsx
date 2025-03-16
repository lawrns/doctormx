import { useState, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useQuestionnaireContext } from '../../contexts/QuestionnaireContext';
import HumanBodyModel from '../../components/HumanBodyModel';
import BodySelectorSVG from '../../components/symptoms/BodySelectorSVG';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { BodyRegion } from '../../machines/questionnaireMachine';

function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}

function SymptomSelectionPage() {
  const navigate = useNavigate();
  const { selectBodyRegion, context } = useQuestionnaireContext();
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleRegionSelect = (region: BodyRegion) => {
    setSelectedRegion(region);
    selectBodyRegion(region);
    
    // Navigate to questionnaire after short delay
    setTimeout(() => {
      navigate('/sintomas/cuestionario');
    }, 500);
  };

  const handleBack = () => {
    navigate('/sintomas');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <ChevronLeft size={20} className="mr-1" />
          Volver
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Selecciona la zona afectada</h1>
        
        <div style={{ width: '24px' }}></div> {/* Empty div for flex spacing */}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center">
            Haz clic en la parte del cuerpo donde sientes molestias para comenzar la evaluación.
          </p>
          
          {isMobile ? (
            // 2D SVG version for mobile
            <BodySelectorSVG 
              onSelectRegion={handleRegionSelect} 
              selectedRegion={selectedRegion} 
            />
          ) : (
            // 3D version for desktop
            <div className="aspect-square w-full max-w-md mx-auto" ref={containerRef}>
              <Suspense fallback={<LoadingSpinner />}>
                <Canvas
                  shadows
                  dpr={[1, 2]}
                  performance={{ min: 0.5 }}
                >
                  <PerspectiveCamera 
                    makeDefault 
                    position={[0, 1, 5]} 
                    fov={50}
                  />
                  <ambientLight intensity={0.7} />
                  <directionalLight 
                    position={[5, 5, 5]} 
                    intensity={0.5} 
                    castShadow 
                    shadow-mapSize={[1024, 1024]}
                  />
                  <directionalLight 
                    position={[-5, -5, -5]} 
                    intensity={0.3} 
                  />
                  <Environment preset="city" />
                  <HumanBodyModel 
                    onSelectRegion={handleRegionSelect}
                    hoveredRegion={hoveredRegion}
                    selectedRegion={selectedRegion}
                  />
                  <OrbitControls 
                    enableZoom={true}
                    maxDistance={10}
                    minDistance={3}
                    enablePan={false}
                    minPolarAngle={Math.PI/4}
                    maxPolarAngle={3*Math.PI/4}
                    enableDamping
                    dampingFactor={0.05}
                  />
                </Canvas>
              </Suspense>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 border-t border-blue-100 p-4">
          <div className="flex items-start">
            <AlertCircle size={20} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Selecciona la zona principal donde sientes el problema. Podrás proporcionar más detalles en los siguientes pasos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SymptomSelectionPage;