import React from 'react';

interface ImageAnalysisVisualProps {
  imageSrc: string;
  analysisStage: 'initial' | 'scanning' | 'identifying' | 'comparing' | 'concluding';
}

const ImageAnalysisVisual: React.FC<ImageAnalysisVisualProps> = ({
  imageSrc,
  analysisStage
}) => {
  const getStageText = () => {
    switch (analysisStage) {
      case 'initial': return 'Preparando análisis...';
      case 'scanning': return 'Escaneando imagen...';
      case 'identifying': return 'Identificando patrones...';
      case 'comparing': return 'Comparando con base de datos médica...';
      case 'concluding': return 'Generando conclusiones...';
      default: return 'Analizando...';
    }
  };

  return (
    <div className="image-analysis-container">
      <div className="relative mb-3">
        <img 
          src={imageSrc} 
          alt="Medical image being analyzed" 
          className="w-full h-auto max-h-72 object-contain rounded-lg"
        />
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 flex items-center justify-center rounded-lg">
          <div className="text-center bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
            <span className="text-xs text-blue-700 font-medium">{getStageText()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <div>Etapa: <span className="text-blue-600 font-medium">{analysisStage}</span></div>
        <div>Progreso: <span className="text-blue-600 font-medium">
          {analysisStage === 'initial' ? '10%' : 
           analysisStage === 'scanning' ? '30%' : 
           analysisStage === 'identifying' ? '60%' : 
           analysisStage === 'comparing' ? '80%' : '95%'}
        </span></div>
      </div>
    </div>
  );
};

export default ImageAnalysisVisual;