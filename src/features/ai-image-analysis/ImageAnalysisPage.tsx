import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Camera, FileImage, Brain, Eye, AlertTriangle, 
  CheckCircle, Clock, Download, Share2, Trash2, ZoomIn,
  Activity, Heart, Stethoscope, X, RotateCcw, Info
} from 'lucide-react';

interface AnalysisResult {
  id: string;
  imageUrl: string;
  fileName: string;
  analysisType: 'skin' | 'xray' | 'mri' | 'eye' | 'general';
  status: 'analyzing' | 'completed' | 'error';
  confidence: number;
  findings: Finding[];
  recommendations: string[];
  uploadDate: Date;
  processingTime?: number;
}

interface Finding {
  type: 'normal' | 'abnormal' | 'suspicious';
  description: string;
  location?: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

const ImageAnalysisPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'results' | 'history'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const analysisTypes = [
    {
      type: 'skin',
      name: 'Análisis de Piel',
      description: 'Detección de manchas, lunares y condiciones dermatológicas',
      icon: Eye,
      color: 'bg-blue-50 text-blue-600',
      examples: ['Lunares', 'Manchas', 'Erupciones', 'Lesiones cutáneas']
    },
    {
      type: 'xray',
      name: 'Rayos X',
      description: 'Análisis de radiografías de tórax, huesos y articulaciones',
      icon: Activity,
      color: 'bg-green-50 text-green-600',
      examples: ['Tórax', 'Fracturas', 'Articulaciones', 'Columna']
    },
    {
      type: 'eye',
      name: 'Examen Ocular',
      description: 'Detección de condiciones oculares y problemas de retina',
      icon: Eye,
      color: 'bg-purple-50 text-purple-600',
      examples: ['Retina', 'Cataratas', 'Glaucoma', 'Degeneración macular']
    },
    {
      type: 'general',
      name: 'Análisis General',
      description: 'Análisis médico general para diversas condiciones',
      icon: Brain,
      color: 'bg-orange-50 text-orange-600',
      examples: ['Heridas', 'Inflamaciones', 'Anomalías', 'Consulta general']
    }
  ];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    // Simulate analysis
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newAnalysis: AnalysisResult = {
        id: Date.now().toString(),
        imageUrl,
        fileName: file.name,
        analysisType: 'general',
        status: 'completed',
        confidence: 0.87,
        findings: [
          {
            type: 'normal',
            description: 'No se detectaron anomalías significativas',
            confidence: 0.92,
            severity: 'low'
          },
          {
            type: 'suspicious',
            description: 'Área de pigmentación irregular detectada',
            location: 'Región superior derecha',
            confidence: 0.76,
            severity: 'medium'
          }
        ],
        recommendations: [
          'Se recomienda seguimiento con dermatólogo',
          'Mantener observación de cambios en la pigmentación',
          'Protección solar adecuada'
        ],
        uploadDate: new Date(),
        processingTime: 3.2
      };

      setAnalyses(prev => [newAnalysis, ...prev]);
      setIsAnalyzing(false);
      setActiveTab('results');
    }, 3000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const UploadArea = () => (
    <div className="space-y-8">
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-brand-jade-500 bg-brand-jade-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        <div className="space-y-4">
          <FileImage className="w-16 h-16 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sube tu imagen médica
            </h3>
            <p className="text-gray-600 mb-4">
              Arrastra y suelta tu imagen aquí, o haz clic para seleccionar
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-brand-jade-600 text-white px-6 py-3 rounded-lg hover:bg-brand-jade-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Seleccionar Archivo
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Usar Cámara
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Types */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Análisis Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.type} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.examples.map((example) => (
                        <span key={example} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Información Importante</h4>
            <p className="text-sm text-blue-800">
              El análisis por IA es una herramienta de apoyo y no sustituye el diagnóstico médico profesional. 
              Siempre consulta con un especialista para obtener un diagnóstico definitivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultsView = () => (
    <div className="space-y-6">
      {isAnalyzing ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-brand-jade-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analizando imagen...</h3>
          <p className="text-gray-600">Esto puede tomar unos momentos</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay análisis recientes</h3>
          <p className="text-gray-600 mb-4">Sube una imagen para comenzar el análisis</p>
          <button
            onClick={() => setActiveTab('upload')}
            className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors"
          >
            Subir Imagen
          </button>
        </div>
      ) : (
        analyses.map((analysis) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={analysis.imageUrl} 
                    alt={analysis.fileName}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage(analysis.imageUrl)}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{analysis.fileName}</h3>
                      <p className="text-sm text-gray-600">
                        Analizado el {analysis.uploadDate.toLocaleDateString('es-ES')} • 
                        Procesado en {analysis.processingTime}s
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        analysis.confidence >= 0.8 
                          ? 'bg-green-100 text-green-700'
                          : analysis.confidence >= 0.6
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Confianza: {Math.round(analysis.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-gray-900">Hallazgos:</h4>
                    {analysis.findings.map((finding, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded-full ${
                          finding.type === 'normal' ? 'bg-green-100' :
                          finding.type === 'suspicious' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {finding.type === 'normal' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{finding.description}</p>
                          {finding.location && (
                            <p className="text-xs text-gray-600">Ubicación: {finding.location}</p>
                          )}
                          <p className="text-xs text-gray-600">
                            Severidad: {finding.severity} • Confianza: {Math.round(finding.confidence * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recomendaciones:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-brand-jade-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm">
                      <Download className="w-4 h-4" />
                      Descargar Reporte
                    </button>
                    <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </button>
                    <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <ZoomIn className="w-4 h-4" />
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Análisis de Imágenes</h1>
            <p className="text-gray-600 mt-1">Análisis médico inteligente con IA avanzada</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope className="w-4 h-4" />
              <span>Certificado por especialistas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'upload', label: 'Subir Imagen', icon: Upload },
            { id: 'results', label: 'Resultados', icon: Brain, count: analyses.length },
            { id: 'history', label: 'Historial', icon: Clock }
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-brand-jade-500 text-brand-jade-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === id
                    ? 'bg-brand-jade-100 text-brand-jade-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeTab === 'upload' && <UploadArea />}
          {activeTab === 'results' && <ResultsView />}
          {activeTab === 'history' && <ResultsView />}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Vista Detallada</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img 
                src={selectedImage} 
                alt="Análisis detallado"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisPage; 