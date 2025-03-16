
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Qué incluye exactamente el programa?",
    answer: "Doctor.mx Connect te ofrece acceso gratuito a todas las funciones premium por 6 meses, incluyendo perfil verificado, sistema de citas avanzado, mensajería con pacientes, análisis de desempeño, posicionamiento preferente en búsquedas y acceso a nuestra red de especialistas."
  },
  {
    question: "¿Qué sucede después de los 6 meses?",
    answer: "Al finalizar el período promocional, puedes elegir continuar con una suscripción premium o pasar al plan básico gratuito. Te notificaremos con anticipación antes del fin del período y no hay renovación automática ni cargos sorpresa."
  },
  {
    question: "¿Necesito una tarjeta de crédito para registrarme?",
    answer: "No, no necesitas proporcionar información de pago para acceder a esta oferta. El programa es completamente gratuito durante 6 meses sin compromiso de permanencia."
  },
  {
    question: "¿Cuáles son los requisitos para participar?",
    answer: "Solo necesitas ser un profesional médico certificado en México. Durante el proceso de registro verificaremos tus credenciales médicas para mantener los estándares de calidad de nuestra plataforma."
  },
  {
    question: "¿Puedo invitar a otros colegas al programa?",
    answer: "¡Absolutamente! Una vez que te registres, podrás generar enlaces de invitación personalizados para compartir con tus colegas. Por cada médico que se une a través de tu enlace, recibirás beneficios adicionales."
  }
];

const ConnectFAQSection = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  return (
    <div className="my-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Respuestas a las dudas más comunes sobre el programa Doctor.mx Connect
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto divide-y divide-gray-200">
        {faqs.map((faq, index) => (
          <div key={index} className="py-5">
            <button
              onClick={() => toggleQuestion(index)}
              className="flex w-full justify-between items-start text-left"
              aria-expanded={expandedIndex === index}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {faq.question}
              </h3>
              <motion.div
                animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-2 flex-shrink-0 text-gray-400"
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-gray-600">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectFAQSection;
