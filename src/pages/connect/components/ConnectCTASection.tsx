
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ConnectCTASectionProps {
  referralId?: string;
}

const ConnectCTASection = ({ referralId }: ConnectCTASectionProps) => {
  const navigate = useNavigate();
  
  const handleRegisterClick = () => {
    navigate('/medicos/registro?connect=true' + (referralId ? `&ref=${referralId}` : ''));
  };
  
  return (
    <div className="my-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="py-12 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white mb-6"
        >
          Transforme su Práctica Médica Hoy
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
        >
          Únase a los más de 2,500 profesionales de la salud que ya están aprovechando el poder de las comunidades centradas en el paciente.
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition-all"
          onClick={handleRegisterClick}
        >
          Comenzar ahora
        </motion.button>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 text-blue-200"
        >
          Sin compromisos. Cancele cuando quiera.
        </motion.p>
      </div>
      
      <div className="bg-blue-700/50 py-6 px-4 text-center">
        <p className="text-blue-100">
          ¿Preguntas? Contáctenos al <strong>(55) 1234-5678</strong> o envíe un email a <strong>connect@doctor.mx</strong>
        </p>
      </div>
    </div>
  );
};

export default ConnectCTASection;
