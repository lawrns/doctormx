import { useState, useEffect } from 'react';
import Icon from './ui/Icon';
import Badge from './ui/Badge';

export default function TrustIndicators({ type = 'homepage' }) {
  const [liveStats, setLiveStats] = useState({
    doctorsOnline: 0,
    consultationsToday: 0,
    averageResponseTime: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    // Simulate real-time data updates
    const updateStats = () => {
      setLiveStats({
        doctorsOnline: Math.floor(Math.random() * 50) + 150, // 150-200
        consultationsToday: Math.floor(Math.random() * 200) + 800, // 800-1000
        averageResponseTime: Math.floor(Math.random() * 15) + 15, // 15-30 minutes
        satisfactionRate: Math.floor(Math.random() * 5) + 95 // 95-99%
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (type === 'homepage') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Icon name="shield-check" size="sm" className="text-success-600" />
          Confianza y Transparencia
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {liveStats.doctorsOnline}
            </div>
            <div className="text-xs text-neutral-600">Doctores en línea</div>
            <div className="w-2 h-2 bg-success-500 rounded-full mx-auto mt-1 animate-pulse"></div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600 mb-1">
              {liveStats.consultationsToday}
            </div>
            <div className="text-xs text-neutral-600">Consultas hoy</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600 mb-1">
              {liveStats.averageResponseTime}min
            </div>
            <div className="text-xs text-neutral-600">Tiempo respuesta</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {liveStats.satisfactionRate}%
            </div>
            <div className="text-xs text-neutral-600">Satisfacción</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="success" size="sm">
              <Icon name="shield-check" size="xs" className="mr-1" />
              Cédulas Verificadas
            </Badge>
            <Badge variant="info" size="sm">
              <Icon name="lock-closed" size="xs" className="mr-1" />
              Datos Encriptados
            </Badge>
            <Badge variant="warning" size="sm">
              <Icon name="document-text" size="xs" className="mr-1" />
              NOM-004 Cumplida
            </Badge>
            <Badge variant="success" size="sm">
              <Icon name="check-circle" size="xs" className="mr-1" />
              Reseñas Verificadas
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'doctor-card') {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <Icon name="shield-check" size="xs" className="text-success-600" />
          <span>Verificado</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="clock" size="xs" />
          <span>Resp. rápida</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="star" size="xs" className="text-warning-500" />
          <span>4.8/5</span>
        </div>
      </div>
    );
  }

  if (type === 'footer') {
    return (
      <div className="bg-neutral-50 rounded-lg p-6">
        <h4 className="font-semibold text-neutral-900 mb-4">Información de la Empresa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-neutral-900 mb-2">Contacto</div>
            <div className="space-y-1 text-neutral-600">
              <div className="flex items-center gap-2">
                <Icon name="map-pin" size="xs" />
                <span>Ciudad de México, México</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="phone" size="xs" />
                <span>+52 55 1234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="envelope" size="xs" />
                <span>contacto@doctor.mx</span>
              </div>
            </div>
          </div>
          <div>
            <div className="font-medium text-neutral-900 mb-2">Cumplimiento</div>
            <div className="space-y-1 text-neutral-600">
              <div className="flex items-center gap-2">
                <Icon name="document-text" size="xs" />
                <span>NOM-004-SSA3-2012</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="lock-closed" size="xs" />
                <span>LFPDPPP</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="shield-check" size="xs" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
