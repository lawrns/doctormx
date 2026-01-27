'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Pill,
  Heart,
  AlertTriangle,
  BookOpen,
  Clock,
  Stethoscope,
  Leaf,
  ShoppingBag,
  Package,
  Truck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TreatmentPlan } from '@/lib/soap/types';

interface TreatmentPlanDisplayProps {
  plan: TreatmentPlan;
  className?: string;
}

const urgencyColors = {
  emergency: 'bg-red-50 border-red-300 text-red-900',
  urgent: 'bg-orange-50 border-orange-300 text-orange-900',
  moderate: 'bg-yellow-50 border-yellow-300 text-yellow-900',
  routine: 'bg-blue-50 border-blue-300 text-blue-900',
  'self-care': 'bg-green-50 border-green-300 text-green-900',
};

const urgencyLabels = {
  emergency: 'Emergencia - Buscar atención inmediata',
  urgent: 'Urgente - Cita en 24-48 horas',
  moderate: 'Moderado - Cita en 1-2 semanas',
  routine: 'Rutina - Cita programada',
  'self-care': 'Autocuidado - Monitoreo en casa',
};

// Mock function to simulate finding available products
function findAvailableProducts(medicationName: string) {
  // This would connect to a real pharmacy API in production
  const mockProducts = {
    'Tempra': [
      { id: 'tempra-500mg', name: 'Tempra 500mg', price: 45.50, pharmacy: 'Farmacias Guadalajara', delivery: '2-4 horas' },
      { id: 'tempra-650mg', name: 'Tempra 650mg', price: 52.30, pharmacy: 'Farmacias del Ahorro', delivery: '1-2 horas' },
    ],
    'Advil': [
      { id: 'advil-200mg', name: 'Advil 200mg (12 tabletas)', price: 38.90, pharmacy: 'Farmacias Similares', delivery: '1 hora' },
    ],
    'Tabcin': [
      { id: 'tabcin-original', name: 'Tabcin Original', price: 28.75, pharmacy: 'Farmacias Benavides', delivery: '2 horas' },
      { id: 'tabcin-plus', name: 'Tabcin Plus', price: 35.20, pharmacy: 'Farmacias San Pablo', delivery: '2-4 horas' },
    ],
    'Pepto-Bismol': [
      { id: 'pepto-liquido', name: 'Pepto-Bismol Líquido 118ml', price: 42.50, pharmacy: 'Farmacias Yza', delivery: '1-2 horas' },
    ],
  };

  return mockProducts[medicationName as keyof typeof mockProducts] || [];
}

export function TreatmentPlanDisplay({
  plan,
  className,
}: TreatmentPlanDisplayProps) {
  const [selectedPharmacy, setSelectedPharmacy] = React.useState<Record<string, string>>({});
  const [showOrderConfirmation, setShowOrderConfirmation] = React.useState<string | null>(null);

  const handleOrderMedication = (medicationName: string, productId: string) => {
    // In a real implementation, this would connect to the pharmacy's API
    console.log(`Ordering medication: ${medicationName}, Product ID: ${productId}`);
    setSelectedPharmacy(prev => ({ ...prev, [medicationName]: productId }));
    setShowOrderConfirmation(productId);
    setTimeout(() => setShowOrderConfirmation(null), 3000);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with urgency indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Plan de Tratamiento Personalizado
        </h2>
        {plan.referralUrgency && (
          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold text-sm',
              urgencyColors[plan.referralUrgency]
            )}
          >
            <Clock className="w-4 h-4" />
            {urgencyLabels[plan.referralUrgency]}
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Natural Remedies & Self-Care */}
        {plan.selfCareInstructions && plan.selfCareInstructions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  Remedios Naturales & Autocuidado
                </h3>
              </div>
              <ul className="space-y-3">
                {plan.selfCareInstructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Heart className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {instruction}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Medical Recommendations */}
        {plan.recommendations && plan.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  Recomendaciones Médicas
                </h3>
              </div>
              <ul className="space-y-3">
                {plan.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Suggested Medications */}
      {plan.suggestedMedications && plan.suggestedMedications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  Medicamentos Sugeridos (OTC)
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Disponibles sin receta - Consulta al farmacéutico
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {plan.suggestedMedications.map((med, i) => {
                const availableProducts = findAvailableProducts(med.name);
                
                return (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 border border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{med.name}</h4>
                        {med.genericName && (
                          <p className="text-xs text-gray-500">
                            Genérico: {med.genericName}
                          </p>
                        )}
                      </div>
                      <ShoppingBag className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Dosis:</span>{' '}
                        <span className="text-gray-600">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Frecuencia:
                        </span>{' '}
                        <span className="text-gray-600">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Duración:
                        </span>{' '}
                        <span className="text-gray-600">{med.duration}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Vía:</span>{' '}
                        <span className="text-gray-600">
                          {med.route === 'oral'
                            ? 'Oral'
                            : med.route === 'topical'
                            ? 'Tópica'
                            : med.route === 'injection'
                            ? 'Inyección'
                            : 'Otra'}
                        </span>
                      </div>
                    </div>
                    
                    {med.warnings && med.warnings.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs font-semibold text-yellow-900 mb-1">
                          ⚠️ Advertencias:
                        </p>
                        <ul className="text-xs text-yellow-800 space-y-1">
                          {med.warnings.map((warning, j) => (
                            <li key={j}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Product Availability and Ordering */}
                    {availableProducts.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-purple-100">
                        <h5 className="font-medium text-sm text-purple-800 mb-2 flex items-center gap-1">
                          <Package className="w-4 h-4" /> Disponible para ordenar
                        </h5>
                        
                        <div className="space-y-2">
                          {availableProducts.map(product => (
                            <div 
                              key={product.id} 
                              className={`flex items-center justify-between p-2 rounded border ${
                                selectedPharmacy[med.name] === product.id 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-gray-200'
                              }`}
                            >
                              <div>
                                <p className="text-sm font-medium">{product.name}</p>
                                <p className="text-xs text-gray-600">{product.pharmacy}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Truck className="w-3 h-3" /> Entrega: {product.delivery}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">${product.price.toFixed(2)}</p>
                                <button
                                  onClick={() => handleOrderMedication(med.name, product.id)}
                                  className={`text-xs px-2 py-1 rounded ${
                                    selectedPharmacy[med.name] === product.id
                                      ? 'bg-green-600 text-white'
                                      : 'bg-purple-600 text-white hover:bg-purple-700'
                                  }`}
                                >
                                  {selectedPharmacy[med.name] === product.id ? 'Ordenado' : 'Ordenar'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {showOrderConfirmation === availableProducts[0].id && (
                          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-xs text-center">
                            ¡Producto ordenado exitosamente! Pronto recibirás instrucciones de entrega.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-purple-100">
                        <p className="text-xs text-gray-500 italic">
                          Este medicamento puede estar disponible en farmacias locales. 
                          Consulta con tu farmacéutico más cercano.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-900">
                <strong>Nota importante:</strong> Estos medicamentos son solo
                sugerencias orientativas. Consulta con tu farmacéutico o médico
                antes de tomarlos, especialmente si tienes alergias, estás
                embarazada, o tomas otros medicamentos.
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Specialist Referral */}
      {plan.referralNeeded && plan.referralSpecialty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  Consulta con Especialista Recomendada
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Basado en tu evaluación, te recomendamos consultar con:
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
              <p className="text-lg font-semibold text-indigo-900 mb-2">
                {getSpecialtyLabel(plan.referralSpecialty)}
              </p>
              <p className="text-sm text-gray-700">
                {plan.followUpTiming}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Warning Signs - Return Precautions */}
      {plan.returnPrecautions && plan.returnPrecautions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                🚨 Signos de Alarma - Busca atención inmediata si:
              </h3>
            </div>
            <ul className="space-y-3">
              {plan.returnPrecautions.map((precaution, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {precaution}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* Patient Education */}
      {plan.patientEducation && plan.patientEducation.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Información Educativa
              </h3>
            </div>
            <div className="space-y-3">
              {plan.patientEducation.map((info, i) => (
                <div
                  key={i}
                  className="p-3 bg-white rounded-lg border border-cyan-200"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {info}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function getSpecialtyLabel(specialty: string): string {
  const labels: Record<string, string> = {
    'general-practitioner': 'Médico General',
    dermatologist: 'Dermatólogo/a',
    internist: 'Internista',
    psychiatrist: 'Psiquiatra',
    cardiologist: 'Cardiólogo/a',
    neurologist: 'Neurólogo/a',
    orthopedist: 'Ortopedista',
    oncologist: 'Oncólogo/a',
    pediatrician: 'Pediatra',
    gynecologist: 'Ginecólogo/a',
  };
  return labels[specialty] || specialty;
}