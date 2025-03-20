import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, User } from 'lucide-react';

// Mock data for recent activities
const mockActivities = [
  { 
    id: 1, 
    name: 'María', 
    action: 'agendó una cita con', 
    specialty: 'Cardiología', 
    location: 'CDMX', 
    time: '2 minutos' 
  },
  { 
    id: 2, 
    name: 'Carlos', 
    action: 'tuvo una consulta de', 
    specialty: 'Pediatría', 
    location: 'Guadalajara', 
    time: '5 minutos' 
  },
  { 
    id: 3, 
    name: 'Ana', 
    action: 'reservó una cita de', 
    specialty: 'Dermatología', 
    location: 'Monterrey', 
    time: '7 minutos' 
  },
  { 
    id: 4, 
    name: 'Roberto', 
    action: 'agendó telemedicina de', 
    specialty: 'Psicología', 
    location: 'Puebla', 
    time: '10 minutos' 
  },
  { 
    id: 5, 
    name: 'Laura', 
    action: 'tuvo una consulta de', 
    specialty: 'Nutrición', 
    location: 'CDMX', 
    time: '15 minutos' 
  },
  { 
    id: 6, 
    name: 'Miguel', 
    action: 'agendó una cita con', 
    specialty: 'Oftalmología', 
    location: 'Querétaro', 
    time: '18 minutos' 
  }
];

function LiveActivityFeed() {
  const [activities, setActivities] = useState(mockActivities.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(3);

  // Rotate activities every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivities = [...prev];
        // Remove the first activity
        newActivities.shift();
        // Add a new activity
        newActivities.push(mockActivities[currentIndex % mockActivities.length]);
        return newActivities;
      });
      
      setCurrentIndex(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Clock size={18} className="mr-2 text-blue-600" />
        Actividad reciente
      </h3>
      
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={`${activity.id}-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <User size={16} className="text-blue-600" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{activity.name}</span> {activity.action}{' '}
                  <span className="text-blue-600 font-medium">{activity.specialty}</span>
                </p>
                
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <MapPin size={12} className="mr-1" />
                  <span className="mr-3">{activity.location}</span>
                  <Calendar size={12} className="mr-1" />
                  <span>Hace {activity.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LiveActivityFeed;