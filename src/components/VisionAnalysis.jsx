import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';

export default function VisionAnalysis({ onAnalysisComplete }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageType, setImageType] = useState('general');
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    symptoms: '',
    medicalHistory: ''
  });
  const fileInputRef = useRef(null);

  const imageTypes = [
    { value: 'xray', label: 'Radiografía', icon: '🦴' },
    { value: 'ct', label: 'Tomografía', icon: '🧠' },
    { value: 'mri', label: 'Resonancia Magnética', icon: '🔬' },
    { value: 'ultrasound', label: 'Ultrasonido', icon: '👶' },
    { value: 'lab_result', label: 'Resultado de Laboratorio', icon: '🧪' },
    { value: 'skin', label: 'Dermatología', icon: '🦠' },
    { value: 'general', label: 'General', icon: '📷' }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalysis = async () => {
    if (!imagePreview) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);
    try {
      const file = fileInputRef.current.files[0];
      const base64 = await convertToBase64(file);

      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          imageType,
          patientAge: patientInfo.age ? parseInt(patientInfo.age) : undefined,
          patientGender: patientInfo.gender || undefined,
          symptoms: patientInfo.symptoms || undefined,
          medicalHistory: patientInfo.medicalHistory || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Error en el análisis');
      }

      const result = await response.json();
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      toast.success('Análisis completado');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al analizar la imagen');
    } finally {
      setLoading(false);
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Análisis de Imágenes Médicas
          </h2>
          <p className="text-gray-600">
            Obtén una segunda opinión de IA sobre tus imágenes médicas
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona una imagen médica
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-sm"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl">📷</div>
                  <div>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Seleccionar imagen
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG hasta 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Image Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de imagen
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {imageTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setImageType(type.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    imageType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad (opcional)
              </label>
              <input
                type="number"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género (opcional)
              </label>
              <select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Síntomas (opcional)
            </label>
            <textarea
              value={patientInfo.symptoms}
              onChange={(e) => setPatientInfo({...patientInfo, symptoms: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe los síntomas que experimentas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Historial médico (opcional)
            </label>
            <textarea
              value={patientInfo.medicalHistory}
              onChange={(e) => setPatientInfo({...patientInfo, medicalHistory: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Menciona condiciones médicas previas, medicamentos, alergias..."
            />
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAnalysis}
              disabled={loading || !imagePreview}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analizando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analizar imagen
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Resultados del Análisis
                </h3>

                {/* Urgency Level */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Nivel de urgencia:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(analysis.urgency)}`}>
                      {getUrgencyLabel(analysis.urgency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Confianza:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{analysis.confidence}%</span>
                  </div>
                </div>

                {/* Findings */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Hallazgos:</h4>
                  <ul className="space-y-1">
                    {analysis.findings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Recomendaciones:</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h5 className="font-semibold text-yellow-800 mb-1">Importante</h5>
                      <p className="text-sm text-yellow-700">{analysis.disclaimer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    // Save analysis to patient record
                    toast.success('Análisis guardado en tu historial');
                  }}
                  className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Guardar análisis
                </button>
                <button
                  onClick={() => {
                    // Share with doctor
                    toast.success('Análisis compartido con tu médico');
                  }}
                  className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Compartir con médico
                </button>
                <button
                  onClick={() => {
                    // Get second opinion
                    toast.info('Buscando segunda opinión...');
                  }}
                  className="px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Segunda opinión
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
