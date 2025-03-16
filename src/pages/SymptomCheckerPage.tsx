import { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import HumanBodyModel from '../components/HumanBodyModel';
import SymptomQuestionnaire from '../components/SymptomQuestionnaire';

function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}

function SymptomCheckerPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
  };

  const handleQuestionnaireComplete = (data: {
    symptomId: string;
    answers: Record<string, any>;
    severityLevel: number;
  }) => {
    console.log('Questionnaire completed:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Evaluación de Síntomas</h1>
          <p className="mt-2 text-gray-600">
            Responde algunas preguntas para ayudarte a entender tus síntomas y recibir la atención adecuada.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Model */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="aspect-square" ref={containerRef}>
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

            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Instrucciones</h3>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>• Haz clic en la zona donde sientes molestias</li>
                <li>• Puedes rotar el modelo usando el mouse</li>
                <li>• Usa la rueda del mouse para acercar o alejar</li>
              </ul>
            </div>
          </div>

          {/* Questionnaire */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {selectedRegion ? (
              <SymptomQuestionnaire 
                bodyRegion={selectedRegion}
                onComplete={handleQuestionnaireComplete}
              />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  Selecciona una zona del cuerpo para comenzar la evaluación
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Esta herramienta no sustituye una evaluación médica profesional. 
          Si tienes dudas, siempre consulta con un médico.
        </div>
      </div>
    </div>
  );
}

export default SymptomCheckerPage;