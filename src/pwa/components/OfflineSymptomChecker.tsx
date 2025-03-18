import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, Save, Check, AlertCircle, FileText } from 'lucide-react';
import { symptomDb, SymptomEntry } from '../utils/offlineDb';
import { usePwa } from '../PwaContext';

interface OfflineSymptomCheckerProps {
  onSelectOfflineMode: () => void;
  onViewSavedResults: () => void;
  className?: string;
}

const OfflineSymptomChecker: React.FC<OfflineSymptomCheckerProps> = ({
  onSelectOfflineMode,
  onViewSavedResults,
  className = '',
}) => {
  const { isOnline } = usePwa();
  const [savedEntries, setSavedEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved symptom entries when component mounts
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entries = await symptomDb.getAll();
        setSavedEntries(entries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (error) {
        console.error('Error loading symptom entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {!isOnline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex">
            <WifiOff className="h-6 w-6 text-amber-500 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-amber-800">Sin conexión a Internet</h3>
              <div className="mt-2 text-amber-700">
                <p>Puedes continuar usando el evaluador de síntomas en modo offline con funcionalidad limitada.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Evaluador de Síntomas</h2>
            <p className="text-gray-600 mb-4">
              Evalúa tus síntomas y guarda los resultados para sincronizarlos cuando vuelvas a estar en línea.
            </p>
            
            <button
              onClick={onSelectOfflineMode}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} className="mr-2" />
              Iniciar evaluación offline
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluaciones guardadas</h3>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : savedEntries.length > 0 ? (
              <div className="space-y-4">
                {savedEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <FileText size={20} className="text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(entry.date).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {entry.symptoms.map(s => s.name).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {!entry.synced && !isOnline && (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-amber-100 text-amber-800 mr-2">
                            <AlertCircle size={12} className="mr-1" />
                            Pendiente de sincronizar
                          </span>
                        )}
                        {entry.synced && (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">
                            <Check size={12} className="mr-1" />
                            Sincronizado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {savedEntries.length > 5 && (
                  <button
                    onClick={onViewSavedResults}
                    className="text-blue-600 font-medium text-sm hover:text-blue-800 mt-2"
                  >
                    Ver todas las evaluaciones ({savedEntries.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 px-4 border border-gray-200 rounded-lg">
                <div className="flex justify-center mb-4">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No hay evaluaciones guardadas</p>
                <p className="text-sm text-gray-500">
                  Los resultados de tus evaluaciones se guardarán automáticamente aunque no tengas conexión a Internet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <Info size={16} className="text-gray-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">
              La funcionalidad offline te permite realizar evaluaciones básicas de síntomas cuando no tienes conexión a Internet. 
              Los resultados completos estarán disponibles cuando vuelvas a conectarte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ size, className }: { size: number; className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default OfflineSymptomChecker;