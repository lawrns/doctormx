import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Star } from 'lucide-react';

// Mock data for recent patients
const recentPatients = [
  { id: 1, initial: 'MR', location: 'CDMX', rating: 5 },
  { id: 2, initial: 'JP', location: 'Guadalajara', rating: 5 },
  { id: 3, initial: 'LS', location: 'Monterrey', rating: 4 },
  { id: 4, initial: 'AC', location: 'Puebla', rating: 5 },
  { id: 5, initial: 'DT', location: 'Querétaro', rating: 4 },
  { id: 6, initial: 'EG', location: 'CDMX', rating: 5 },
  { id: 7, initial: 'RV', location: 'Tijuana', rating: 5 },
  { id: 8, initial: 'BM', location: 'Mérida', rating: 4 },
  { id: 9, initial: 'NL', location: 'CDMX', rating: 5 },
  { id: 10, initial: 'FP', location: 'Cancún', rating: 5 },
  { id: 11, initial: 'GS', location: 'Monterrey', rating: 4 },
  { id: 12, initial: 'HT', location: 'CDMX', rating: 5 }
];

// Generate random positions for the cloud
const generatePositions = (count: number) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      x: Math.random() * 80 + 10, // 10% to 90% of container width
      y: Math.random() * 80 + 10, // 10% to 90% of container height
      scale: Math.random() * 0.4 + 0.8, // 0.8 to 1.2 scale
      delay: Math.random() * 0.5 // 0 to 0.5s delay
    });
  }
  return positions;
};

function SocialProofCloud() {
  const [positions] = useState(generatePositions(recentPatients.length));
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  return (
    <div 
      ref={ref} 
      className="relative h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg overflow-hidden"
    >
      <div className="absolute inset-0">
        {recentPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            className="absolute"
            style={{
              left: `${positions[index].x}%`,
              top: `${positions[index].y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { 
              opacity: 1, 
              scale: positions[index].scale,
              x: [0, 10, -10, 5, 0],
              y: [0, -5, 8, -3, 0]
            } : { opacity: 0, scale: 0 }}
            transition={{ 
              opacity: { duration: 0.5, delay: positions[index].delay },
              scale: { duration: 0.5, delay: positions[index].delay },
              x: { 
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 10 + Math.random() * 5,
                delay: positions[index].delay
              },
              y: { 
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 15 + Math.random() * 5,
                delay: positions[index].delay
              }
            }}
          >
            <div className="bg-white rounded-full shadow-md p-1 flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">{patient.initial}</span>
              </div>
              <div className="ml-2 pr-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill={i < patient.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin size={8} className="mr-1" />
                  <span>{patient.location}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg text-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Comunidad de pacientes</h3>
          <p className="text-sm text-gray-600">
            Más de <span className="font-bold text-blue-600">500,000</span> pacientes confían en nosotros
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SocialProofCloud;