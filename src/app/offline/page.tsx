/**
 * Offline Page
 * 
 * Displayed when the user is offline and tries to access
 * a page that is not cached.
 * 
 * @module app/offline
 */

import React from 'react';
import { WifiOff, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata = {
  title: 'Sin Conexión | DoctorMX',
  description: 'No hay conexión a internet disponible',
};

/**
 * Offline page component
 */
export default function OfflinePage(): JSX.Element {
  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-amber-600" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Sin Conexión</CardTitle>
          <CardDescription>
            Parece que no tienes conexión a internet en este momento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900">Funcionalidad limitada</h3>
                <p className="text-sm text-amber-800 mt-1">
                  Algunas funciones pueden no estar disponibles sin conexión. 
                  Los datos se sincronizarán automáticamente cuando vuelvas a estar en línea.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Lo que puedes hacer:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Ver citas programadas previamente
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Revisar notas de consultas pasadas
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Acceder a información guardada localmente
              </li>
            </ul>
          </div>

          <Button 
            onClick={handleRetry}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>

          <p className="text-xs text-center text-gray-500">
            Si el problema persiste, verifica tu conexión WiFi o datos móviles
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
