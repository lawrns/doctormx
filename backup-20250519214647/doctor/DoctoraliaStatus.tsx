import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Calendar, ExternalLink } from 'lucide-react';
import { Button, Card } from '../ui';

interface DoctoraliaStatusProps {
  lastSynced: Date | null;
  newAppointments: number;
  status: 'success' | 'warning' | 'error';
  onSync: () => void;
}

const DoctoraliaStatus: React.FC<DoctoraliaStatusProps> = ({ 
  lastSynced, 
  newAppointments, 
  status, 
  onSync 
}) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Integración con Doctoralia</h2>
        
        <Button 
          variant="outline" 
          size="sm"
          icon={<RefreshCw size={16} />}
          onClick={onSync}
        >
          Sincronizar ahora
        </Button>
      </div>
      
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-blue-500" />
        </div>
        
        <div className="ml-3">
          <p className="text-sm text-gray-500">
            Última sincronización
          </p>
          <p className="text-base font-medium text-gray-900">
            {lastSynced 
              ? format(lastSynced, 'PPPp', { locale: es })
              : 'Nunca sincronizado'}
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          {status === 'success' && (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
          )}
          
          {status === 'warning' && (
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
          )}
          
          {status === 'error' && (
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
          )}
          
          <div>
            {status === 'success' && (
              <>
                <p className="text-sm font-medium text-gray-900">
                  Conectado correctamente con Doctoralia
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {newAppointments > 0 
                    ? `${newAppointments} nuevas citas desde Doctoralia`
                    : 'Todas las citas están sincronizadas'}
                </p>
              </>
            )}
            
            {status === 'warning' && (
              <>
                <p className="text-sm font-medium text-gray-900">
                  Conectado con advertencias
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Algunas citas pueden no haberse sincronizado correctamente
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <p className="text-sm font-medium text-gray-900">
                  Error de sincronización
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  No se ha podido conectar con Doctoralia. Por favor, verifica tus credenciales.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Opciones de sincronización</h3>
        
        <div className="space-y-2">
          <Button 
            variant="secondary" 
            size="sm"
            className="w-full justify-start"
            icon={<ExternalLink size={16} />}
            onClick={() => window.open('https://prd.doctoralia.com.mx/dashboard', '_blank')}
          >
            Ir a mi dashboard de Doctoralia
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm"
            className="w-full justify-start"
            onClick={() => window.location.href = '/doctor-dashboard/doctoralia-settings'}
          >
            Configurar integración
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DoctoraliaStatus;