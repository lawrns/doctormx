
import { 
  MessageSquare, 
  Users, 
  BookOpen, 
  UserCircle2, 
  LayoutGrid, 
  BarChart 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
  >
    <div className="p-6 text-center bg-blue-100 text-blue-800">
      <div className="flex justify-center mb-2">
        {icon}
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

const ConnectFeaturesSection = () => {
  return (
    <div className="my-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Características Revolucionarias</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transforme su práctica médica con nuestras herramientas exclusivas
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<MessageSquare size={36} />}
          title="Sistema de Difusión para Médicos"
          description="Comuníquese directamente con sus pacientes a través de anuncios, consejos de salud personalizados y alertas importantes."
          delay={0.1}
        />
        
        <FeatureCard 
          icon={<Users size={36} />}
          title="Comunidades de Pacientes"
          description="Modere grupos específicos por condición médica, posicionándose como líder de opinión en su especialidad."
          delay={0.2}
        />
        
        <FeatureCard 
          icon={<BookOpen size={36} />}
          title="Plataforma de Contenido Educativo"
          description="Publique y comparta contenido personalizado para sus pacientes, mejorando la adherencia al tratamiento."
          delay={0.3}
        />
        
        <FeatureCard 
          icon={<UserCircle2 size={36} />}
          title="Panel 'Mi Equipo Médico'"
          description="Sus pacientes ven a todos sus médicos conectados en un solo lugar, con su perfil destacado."
          delay={0.4}
        />
        
        <FeatureCard 
          icon={<LayoutGrid size={36} />}
          title="Flujos Pre/Post Consulta"
          description="Automatice cuestionarios, seguimientos y verificaciones para mejorar la eficiencia y satisfacción."
          delay={0.5}
        />
        
        <FeatureCard 
          icon={<BarChart size={36} />}
          title="Analytics Avanzados"
          description="Obtenga insights detallados sobre crecimiento, retención y engagement para optimizar su práctica."
          delay={0.6}
        />
      </div>
    </div>
  );
};

export default ConnectFeaturesSection;
