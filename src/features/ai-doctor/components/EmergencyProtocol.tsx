import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, Phone, MapPin, Clock, Users, 
  Heart, Navigation, Shield, Zap, Hospital
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface EmergencyProtocolProps {
  onEmergencyAction: (action: string) => void;
  userLocation?: {
    coordinates: { lat: number; lng: number };
    address: string;
  };
}

const EMERGENCY_ACTIONS = [
  {
    id: 'call_911',
    icon: Phone,
    label: 'Llamar 911',
    description: 'Emergencias médicas',
    color: 'bg-red-600 hover:bg-red-700',
    urgent: true
  },
  {
    id: 'call_cruz_roja',
    icon: Heart,
    label: 'Cruz Roja',
    description: '065 - Ambulancia',
    color: 'bg-red-500 hover:bg-red-600',
    urgent: true
  },
  {
    id: 'find_hospital',
    icon: Hospital,
    label: 'Hospital Más Cercano',
    description: 'Buscar ubicación',
    color: 'bg-blue-600 hover:bg-blue-700',
    urgent: false
  },
  {
    id: 'contact_family',
    icon: Users,
    label: 'Contactar Familia',
    description: 'Notificar emergencia',
    color: 'bg-green-600 hover:bg-green-700',
    urgent: false
  }
];

const MEXICAN_EMERGENCY_NUMBERS = [
  { service: 'Emergencias Generales', number: '911', description: 'Policía, Bomberos, Ambulancia' },
  { service: 'Cruz Roja', number: '065', description: 'Servicios médicos de emergencia' },
  { service: 'Bomberos', number: '911', description: 'Incendios y rescates' },
  { service: 'SUEM', number: '911', description: 'Sistema de Urgencias Médicas CDMX' }
];

const EMERGENCY_HOSPITALS = [
  {
    name: 'Hospital General de México',
    distance: '2.1 km',
    time: '8 min',
    type: 'Público',
    specialty: 'General',
    phone: '555-999-1000'
  },
  {
    name: 'Hospital ABC Santa Fe',
    distance: '3.5 km', 
    time: '12 min',
    type: 'Privado',
    specialty: 'Especializado',
    phone: '555-230-8000'
  },
  {
    name: 'Cruz Roja Polanco',
    distance: '1.8 km',
    time: '6 min',
    type: 'Cruz Roja',
    specialty: 'Emergencias',
    phone: '555-395-1111'
  }
];

export default function EmergencyProtocol({ onEmergencyAction, userLocation }: EmergencyProtocolProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (countdown === 0 && selectedAction) {
      onEmergencyAction(selectedAction);
      setCountdown(null);
      setSelectedAction(null);
    }

    return () => clearInterval(interval);
  }, [countdown, selectedAction, onEmergencyAction]);

  const handleEmergencyAction = (actionId: string, requiresCountdown: boolean = false) => {
    if (requiresCountdown) {
      setSelectedAction(actionId);
      setCountdown(5);
    } else {
      onEmergencyAction(actionId);
    }
  };

  const cancelAction = () => {
    setCountdown(null);
    setSelectedAction(null);
  };

  return (
    <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700">
      <div className="space-y-4">
        {/* Emergency Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
              Protocolo de Emergencia
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Activado automáticamente
            </p>
          </div>
        </motion.div>

        {/* Countdown Warning */}
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white p-4 rounded-lg text-center"
          >
            <div className="text-2xl font-bold mb-2">{countdown}</div>
            <div className="text-sm mb-3">
              Ejecutando acción en {countdown} segundo{countdown !== 1 ? 's' : ''}
            </div>
            <Button
              onClick={cancelAction}
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-red-600"
            >
              Cancelar
            </Button>
          </motion.div>
        )}

        {/* Emergency Actions */}
        <div className="grid grid-cols-2 gap-3">
          {EMERGENCY_ACTIONS.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={() => handleEmergencyAction(action.id, action.urgent)}
                className={`w-full h-20 flex flex-col items-center justify-center space-y-1 ${action.color} text-white`}
                disabled={countdown !== null}
              >
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="text-sm font-semibold">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* User Location */}
        {userLocation && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Tu Ubicación Actual
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {userLocation.address}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  📍 Lat: {userLocation.coordinates.lat.toFixed(4)}, 
                  Lng: {userLocation.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Numbers */}
        <div>
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            Números de Emergencia México
          </h4>
          <div className="space-y-2">
            {MEXICAN_EMERGENCY_NUMBERS.slice(0, 2).map((emergency, index) => (
              <div
                key={emergency.service}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {emergency.service}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {emergency.description}
                  </div>
                </div>
                <div className="text-lg font-bold text-red-600">
                  {emergency.number}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest Hospitals */}
        <div>
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center">
            <Hospital className="w-4 h-4 mr-1" />
            Hospitales Más Cercanos
          </h4>
          <div className="space-y-2">
            {EMERGENCY_HOSPITALS.slice(0, 2).map((hospital, index) => (
              <div
                key={hospital.name}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {hospital.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {hospital.type} • {hospital.specialty}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">
                    {hospital.distance}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {hospital.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Information */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Información Crítica
              </h5>
              <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Mantén la calma y respira profundo</li>
                <li>• Si estás solo, contacta a alguien de confianza</li>
                <li>• Ten lista tu identificación y tarjeta médica</li>
                <li>• Proporciona ubicación exacta a los servicios</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Protocol Status */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Protocolo activo</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Tiempo de respuesta: &lt;5min</span>
          </div>
        </div>
      </div>
    </Card>
  );
}