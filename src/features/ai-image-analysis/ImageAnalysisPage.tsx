import React, { useState, useRef } from 'react';

function ImageAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setResults(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    
    setAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setResults({
        confidence: 85,
        findings: [
          'No se detectaron anomalías significativas',
          'Imagen de buena calidad para análisis',
          'Se recomienda consulta con especialista para interpretación completa'
        ],
        recommendations: [
          'Continúe con seguimiento médico regular',
          'Mantenga registros de imágenes para comparación futura'
        ]
      });
      setAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Imágenes Médicas</h1>
          <p className="text-gray-600 mt-2">Sube imágenes médicas para análisis con IA avanzada</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-[#006D77] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sube tu imagen médica</h3>
              <p className="text-gray-600 mb-4">Haz clic aquí o arrastra tu archivo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button className="bg-[#006D77] text-white px-6 py-2 rounded-lg hover:bg-[#005B66] transition-colors">
                Seleccionar Archivo
              </button>
            </div>
          </div>
        </div>

        {/* Selected Image */}
        {selectedImage && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen Seleccionada</h3>
            <div className="flex gap-6">
              <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={selectedImage} 
                  alt="Selected medical image" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 mb-4">Imagen lista para análisis</p>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-[#006D77] text-white px-6 py-3 rounded-lg hover:bg-[#005B66] disabled:opacity-50 transition-colors font-medium"
                >
                  {analyzing ? 'Analizando...' : 'Analizar Imagen'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados del Análisis</h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Confianza del Análisis</span>
                <span className="text-sm font-medium text-[#006D77]">{results.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#006D77] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${results.confidence}%` }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Hallazgos</h4>
                <ul className="space-y-2">
                  {results.findings.map((finding: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#006D77] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recomendaciones</h4>
                <ul className="space-y-2">
                  {results.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Este análisis es una herramienta de apoyo. 
                Siempre consulte con un profesional médico para obtener un diagnóstico definitivo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageAnalysisPage;