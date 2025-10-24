import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

export default function AppointmentCard({ appointment, onBookNow }) {
  if (!appointment) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-4 p-4 bg-gradient-to-br from-brand-50 via-white to-brand-50/30 border-2 border-brand-200 rounded-xl shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-ink-primary mb-2">
            Cita disponible con {appointment.doctorName}
          </h3>
          
          <div className="space-y-2 text-sm text-ink-secondary">
            {appointment.date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{appointment.date}</span>
              </div>
            )}
            
            {appointment.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{appointment.time}</span>
              </div>
            )}
            
            {appointment.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{appointment.location}</span>
              </div>
            )}
            
            {appointment.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Duración: {appointment.duration}</span>
              </div>
            )}
          </div>
          
          {appointment.price && (
            <div className="mt-3 pt-3 border-t border-brand-200">
              <p className="text-lg font-bold text-brand-700">
                {appointment.price}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {onBookNow && (
        <motion.button
          onClick={onBookNow}
          className="w-full mt-4 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckCircle className="w-5 h-5" />
          Confirmar cita
        </motion.button>
      )}
    </motion.div>
  );
}

