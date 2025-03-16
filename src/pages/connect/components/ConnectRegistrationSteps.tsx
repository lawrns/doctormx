
import { motion } from 'framer-motion';

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Regístrese en doctor.mx/connect",
    description: "Complete nuestro formulario de registro simplificado y suba sus credenciales para verificación. Aprobación en 24-48 horas."
  },
  {
    number: 2,
    title: "Configure su Perfil y Comunidades",
    description: "Personalice su perfil profesional, configure sus horas de disponibilidad y establezca su primera comunidad de pacientes."
  },
  {
    number: 3,
    title: "Comience a Conectar con Pacientes",
    description: "Invite a sus pacientes actuales a unirse a la plataforma y comience a recibir nuevos pacientes a través de nuestro sistema de búsqueda optimizado."
  }
];

const ConnectRegistrationSteps = () => {
  return (
    <div className="my-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Comience en 3 Pasos Simples</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Únase a Doctor.mx Connect y transforme su práctica médica hoy
        </p>
      </div>
      
      <div className="space-y-10 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-start"
          >
            <div className="flex-shrink-0 mr-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                {step.number}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConnectRegistrationSteps;
