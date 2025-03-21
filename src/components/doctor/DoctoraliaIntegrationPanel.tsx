import React, { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { Card, Button } from '../ui';

interface DoctoraliaIntegrationPanelProps {
  lastSynced: Date | null;
  newAppointments: number;
  status: 'success' | 'warning' | 'error';
  onSync: () => void;
  onConfigure: () => void;
}

const DoctoraliaIntegrationPanel: React.FC<DoctoraliaIntegrationPanelProps> = ({
  lastSynced,
  newAppointments,
  status,
  onSync,
  onConfigure
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };
  
  const formatLastSynced = () => {
    if (!lastSynced) return 'Nunca';
    
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Hace unos minutos';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return lastSynced.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  const renderStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'error':
        return <XCircle size={18} className="text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Sincronización exitosa';
      case 'warning':
        return 'Sincronización parcial';
      case 'error':
        return 'Error de sincronización';
      default:
        return '';
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Integración con Doctoralia</h2>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Settings size={16} />}
            onClick={onConfigure}
          >
            Configurar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            icon={<ExternalLink size={16} />}
            onClick={() => window.open('https://www.doctoralia.com.mx', '_blank')}
          >
            Ir a Doctoralia
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {renderStatusIcon()}
            <span className="ml-2 font-medium">{getStatusText()}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />}
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <p>Última sincronización: {formatLastSynced()}</p>
          {newAppointments > 0 && (
            <p className="mt-1 text-blue-600 font-medium">
              {newAppointments} {newAppointments === 1 ? 'nueva cita' : 'nuevas citas'} desde Doctoralia
            </p>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Estado de la integración</h3>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <CheckCircle size={16} className="text-green-500 mr-2" />
            <span className="text-sm text-gray-600">Sincronización de citas</span>
          </div>
          
          <div className="flex items-center">
            <CheckCircle size={16} className="text-green-500 mr-2" />
            <span className="text-sm text-gray-600">Perfil profesional</span>
          </div>
          
          <div className="flex items-center">
            <CheckCircle size={16} className="text-green-500 mr-2" />
            <span className="text-sm text-gray-600">Opiniones de pacientes</span>
          </div>
          
          <div className="flex items-center">
            <AlertTriangle size={16} className="text-amber-500 mr-2" />
            <span className="text-sm text-gray-600">Calendario bidireccional</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DoctoraliaIntegrationPanel;