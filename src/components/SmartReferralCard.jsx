import { motion } from 'framer-motion';
import { MapPin, Users, ArrowRight, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SmartReferralCard({
  specialty,
  doctorCount = 0,
  doctors = [],
  userLocation = 'tu área'
}) {
  const navigate = useNavigate();

  const handleViewDoctors = () => {
    navigate(`/doctors?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full my-4 bg-gradient-to-br from-brand-50 via-white to-brand-50/30 border-2 border-brand-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
    >
      {/* Animated background accent */}
      <motion.div
        className="absolute -right-20 -top-20 w-40 h-40 bg-brand-200/20 rounded-full blur-3xl"
        animate={{ x: [0, 30], y: [0, -30] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-md">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>

          <div>
            <h3 className="font-bold text-ink-primary">
              🏥 Especialistas en {specialty}
            </h3>
            <p className="text-xs text-ink-muted">Recomendado según tu diagnóstico</p>
          </div>
        </div>

        {/* Doctor count */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-white rounded-lg border border-brand-100">
          <Users className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-ink-primary">
            {doctorCount} doctores disponibles
          </span>
          <span className="text-xs text-ink-muted ml-auto">en {userLocation}</span>
        </div>

        {/* Doctor samples */}
        {doctors && doctors.length > 0 && (
          <div className="mb-4 space-y-2">
            {doctors.slice(0, 2).map((doctor, idx) => (
              <motion.div
                key={doctor.id || idx}
                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-brand-100/50 hover:border-brand-300 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-brand-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-primary">{doctor.name}</p>
                  <p className="text-xs text-ink-muted">{doctor.specialty}</p>
                </div>
                {doctor.rating && (
                  <span className="text-xs font-semibold text-yellow-500">
                    ⭐ {doctor.rating}
                  </span>
                )}
              </motion.div>
            ))}
            {doctorCount > 2 && (
              <p className="text-xs text-ink-muted text-center pt-1">
                + {doctorCount - 2} más
              </p>
            )}
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          onClick={handleViewDoctors}
          className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Ver doctores disponibles
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Info footer */}
        <p className="text-xs text-ink-muted text-center mt-3 px-2">
          Podrás contactar directamente, agendar citas y recibir orientación profesional
        </p>
      </div>
    </motion.div>
  );
}
