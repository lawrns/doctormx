import { useState } from 'react';
import Icon from './ui/Icon';

export default function FAQ({ type = 'patients' }) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const patientFAQs = [
    {
      question: "¿Cómo funciona la consulta con IA?",
      answer: "Nuestra IA médica utiliza tecnología avanzada para evaluar tus síntomas, proporcionar orientación inicial y sugerir especialistas cuando sea necesario. Es un complemento a la atención médica tradicional, no un reemplazo."
    },
    {
      question: "¿Es seguro compartir mi información médica?",
      answer: "Sí, utilizamos encriptación de extremo a extremo y cumplimos con la NOM-004-SSA3-2012 y la LFPDPPP. Tu información está protegida y solo se comparte con profesionales médicos verificados."
    },
    {
      question: "¿Puedo agendar citas directamente desde la plataforma?",
      answer: "Sí, puedes agendar citas presenciales y de telemedicina directamente desde el perfil del doctor. El sistema muestra horarios disponibles en tiempo real y envía confirmaciones automáticas."
    },
    {
      question: "¿Qué especialidades están disponibles?",
      answer: "Tenemos más de 3,400 doctores verificados en todas las especialidades médicas: medicina general, cardiología, dermatología, ginecología, pediatría, psiquiatría, neurología, y muchas más."
    },
    {
      question: "¿Cómo funciona el sistema de reseñas?",
      answer: "Las reseñas son verificadas y solo pueden ser escritas por pacientes que han tenido consultas reales. Esto garantiza la autenticidad y ayuda a otros pacientes a tomar decisiones informadas."
    },
    {
      question: "¿Qué seguros médicos aceptan?",
      answer: "Muchos de nuestros doctores aceptan IMSS, ISSSTE, Seguro Popular, GNP, AXA, Metlife y consultas particulares. Puedes filtrar por aseguradora en la búsqueda de doctores."
    }
  ];

  const doctorFAQs = [
    {
      question: "¿Cómo me registro como doctor?",
      answer: "El registro es gratuito y toma menos de 5 minutos. Necesitas tu cédula profesional, comprobante de estudios y documentación de tu consultorio. La verificación se completa en 24 horas."
    },
    {
      question: "¿Cuáles son las tarifas para doctores?",
      answer: "Ofrecemos un plan básico de $499 MXN mensuales que incluye perfil completo, sistema de citas y acceso a pacientes. También hay comisiones por consulta completada a través de la plataforma."
    },
    {
      question: "¿Cómo gestiono mis citas?",
      answer: "Tu panel de control incluye calendario integrado, confirmación automática de citas, recordatorios a pacientes y gestión de horarios disponibles. Todo se sincroniza en tiempo real."
    },
    {
      question: "¿Puedo emitir recetas electrónicas?",
      answer: "Sí, el sistema incluye emisión de recetas electrónicas conforme a la NOM-004-SSA3-2012, con firma digital y almacenamiento seguro en la nube."
    },
    {
      question: "¿Cómo recibo pagos?",
      answer: "Los pagos se procesan automáticamente a través de la plataforma. Puedes configurar tu cuenta bancaria y recibir pagos semanales o mensuales según prefieras."
    },
    {
      question: "¿Qué soporte técnico ofrecen?",
      answer: "Proporcionamos soporte técnico 24/7, capacitación en el uso de la plataforma, integración con sistemas existentes y asistencia para cumplimiento normativo."
    }
  ];

  const faqs = type === 'patients' ? patientFAQs : doctorFAQs;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Preguntas Frecuentes
        </h2>
        <p className="text-lg text-neutral-600">
          {type === 'patients' 
            ? 'Encuentra respuestas a las preguntas más comunes sobre nuestros servicios'
            : 'Información importante para profesionales médicos'
          }
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-neutral-200 rounded-lg shadow-sm">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <span className="font-semibold text-neutral-900 pr-4">
                {faq.question}
              </span>
              <Icon 
                name="chevron-down" 
                size="sm" 
                className={`text-neutral-500 transition-transform ${
                  openItems.has(index) ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {openItems.has(index) && (
              <div className="px-6 pb-4 border-t border-neutral-100">
                <p className="text-neutral-700 leading-relaxed pt-4">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-neutral-600 mb-4">
          ¿No encuentras la respuesta que buscas?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Icon name="chat-bubble-left-right" size="sm" />
            Contactar Soporte
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
            <Icon name="envelope" size="sm" />
            Enviar Email
          </button>
        </div>
      </div>
    </div>
  );
}
