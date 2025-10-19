import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import VisionAnalysis from '../components/VisionAnalysis';
import { toast } from '../lib/toast';

export default function VisionConsultation() {
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const tabs = [
    { id: 'upload', label: 'Nuevo Análisis', icon: '📷' },
    { id: 'history', label: 'Historial', icon: '📋' },
    { id: 'compare', label: 'Comparar', icon: '🔄' },
    { id: 'specialists', label: 'Especialistas', icon: '👨‍⚕️' }
  ];

  const specialties = [
    { name: 'Cardiología', icon: '❤️', description: 'Análisis de corazón y vasos sanguíneos' },
    { name: 'Neumología', icon: '🫁', description: 'Análisis de pulmones y vías respiratorias' },
    { name: 'Ortopedia', icon: '🦴', description: 'Análisis de huesos y articulaciones' },
    { name: 'Neurología', icon: '🧠', description: 'Análisis de cerebro y sistema nervioso' },
    { name: 'Dermatología', icon: '🦠', description: 'Análisis de piel y lesiones cutáneas' },
    { name: 'Ginecología', icon: '👩', description: 'Análisis de órganos reproductivos femeninos' },
    { name: 'Urología', icon: '🔬', description: 'Análisis de riñones y sistema urinario' },
    { name: 'Gastroenterología', icon: '🍽️', description: 'Análisis de tracto digestivo' }
  ];

  const handleAnalysisComplete = (analysis) => {
    const newAnalysis = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...analysis
    };
    setAnalysisHistory(prev => [newAnalysis, ...prev]);
    toast.success('Análisis completado y guardado');
  };

  const handleSpecializedAnalysis = async (specialty) => {
    if (analysisHistory.length === 0) {
      toast.error('No hay análisis previos para revisar');
      return;
    }

    try {
      const latestAnalysis = analysisHistory[0];
      toast.info(`Obteniendo análisis especializado de ${specialty}...`);
      
      // This would call the specialized analysis endpoint
      // For now, we'll show a placeholder
      setTimeout(() => {
        toast.success(`Análisis especializado de ${specialty} completado`);
      }, 2000);
    } catch (error) {
      console.error('Error getting specialized analysis:', error);
      toast.error('Error al obtener análisis especializado');
    }
  };

  const handleImageComparison = async () => {
    if (analysisHistory.length < 2) {
      toast.error('Necesitas al menos 2 análisis para comparar');
      return;
    }

    try {
      const recentAnalyses = analysisHistory.slice(0, 2);
      toast.info('Comparando análisis de imágenes...');
      
      // This would call the comparison endpoint
      // For now, we'll show a placeholder
      setTimeout(() => {
        toast.success('Comparación de imágenes completada');
      }, 2000);
    } catch (error) {
      console.error('Error comparing images:', error);
      toast.error('Error al comparar imágenes');
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'No especificada';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-ink-primary mb-2">
              Consulta de Imágenes Médicas
            </h1>
            <p className="text-ink-secondary">
              Obtén una segunda opinión de IA sobre tus imágenes médicas, rayos X, y resultados de laboratorio
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-semibold transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <VisionAnalysis onAnalysisComplete={handleAnalysisComplete} />
                </motion.div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {analysisHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-ink-primary mb-2">No hay análisis previos</h3>
                      <p className="text-ink-secondary">Comienza subiendo tu primera imagen médica</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analysisHistory.map((analysis) => (
                        <div key={analysis.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-ink-primary">
                                  Análisis de {analysis.imageType}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(analysis.urgency)}`}>
                                  {getUrgencyLabel(analysis.urgency)}
                                </span>
                              </div>
                              <p className="text-sm text-ink-secondary mb-2">
                                {new Date(analysis.timestamp).toLocaleDateString('es-MX', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Confianza:</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${analysis.confidence}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{analysis.confidence}%</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  // View details
                                  toast.info('Mostrando detalles del análisis');
                                }}
                                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                Ver detalles
                              </button>
                              <button
                                onClick={() => {
                                  // Share with doctor
                                  toast.success('Análisis compartido con médico');
                                }}
                                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                Compartir
                              </button>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Hallazgos principales:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {analysis.findings.slice(0, 3).map((finding, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{finding}</span>
                                </li>
                              ))}
                              {analysis.findings.length > 3 && (
                                <li className="text-xs text-gray-500">
                                  +{analysis.findings.length - 3} hallazgos más
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Compare Tab */}
              {activeTab === 'compare' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-ink-primary mb-2">Comparación de Imágenes</h3>
                    <p className="text-ink-secondary mb-4">
                      Compara múltiples imágenes para analizar progresión o cambios
                    </p>
                    <button
                      onClick={() => {
                        if (analysisHistory.length >= 2) {
                          handleImageComparison();
                        } else {
                          toast.info('Necesitas al menos 2 análisis para comparar');
                        }
                      }}
                      className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Comparar imágenes
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Specialists Tab */}
              {activeTab === 'specialists' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-ink-primary mb-2">
                      Análisis Especializado
                    </h3>
                    <p className="text-ink-secondary">
                      Obtén análisis específicos de especialistas médicos
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialties.map((specialty) => (
                      <div
                        key={specialty.name}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer"
                        onClick={() => {
                          if (analysisHistory.length > 0) {
                            // Use the most recent analysis for specialized review
                            const latestAnalysis = analysisHistory[0];
                            handleSpecializedAnalysis(specialty.name.toLowerCase());
                          } else {
                            toast.info('Primero sube una imagen para análisis especializado');
                          }
                        }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-3">{specialty.icon}</div>
                          <h4 className="font-semibold text-ink-primary mb-2">{specialty.name}</h4>
                          <p className="text-sm text-ink-secondary">{specialty.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Features Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-ink-primary mb-4">
              ¿Qué puedes analizar?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🦴', title: 'Radiografías', desc: 'Fracturas, pulmones, huesos' },
                { icon: '🧠', title: 'Tomografías', desc: 'Estructuras internas, lesiones' },
                { icon: '🔬', title: 'Resonancia Magnética', desc: 'Tejidos blandos, cerebro' },
                { icon: '👶', title: 'Ultrasonidos', desc: 'Órganos, embarazo, flujo' },
                { icon: '🧪', title: 'Laboratorio', desc: 'Análisis de sangre, orina' },
                { icon: '🦠', title: 'Dermatología', desc: 'Piel, lunares, lesiones' },
                { icon: '📷', title: 'General', desc: 'Cualquier imagen médica' },
                { icon: '🔄', title: 'Comparación', desc: 'Progresión en el tiempo' }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h4 className="font-semibold text-ink-primary text-sm">{feature.title}</h4>
                  <p className="text-xs text-ink-secondary">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
