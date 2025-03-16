
import { motion } from 'framer-motion';

interface StatCardProps {
  value: string;
  label: string;
  delay: number;
}

const StatCard = ({ value, label, delay }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center"
  >
    <div className="text-4xl font-bold text-blue-600 mb-2">{value}</div>
    <p className="text-gray-500">{label}</p>
  </motion.div>
);

const ConnectStatsSection = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
      <StatCard 
        value="35%"
        label="Aumento promedio en nuevos pacientes"
        delay={0.1}
      />
      <StatCard 
        value="92%"
        label="Tasa de retención de pacientes"
        delay={0.2}
      />
      <StatCard 
        value="3x"
        label="Más interacciones médico-paciente"
        delay={0.3}
      />
      <StatCard 
        value="2,500+"
        label="Médicos ya en la plataforma"
        delay={0.4}
      />
    </div>
  );
};

export default ConnectStatsSection;
