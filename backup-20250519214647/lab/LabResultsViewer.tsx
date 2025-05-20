import React, { useState, useEffect } from 'react';
import { SearchX, FileText, Download, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import Input from '../ui/Input';

interface LabResultsViewerProps {
  requestId?: string | null;
}

interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'pending' | 'processing' | 'completed';
  result?: {
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
  };
  pdfUrl?: string;
}

const LabResultsViewer: React.FC<LabResultsViewerProps> = ({ requestId: propRequestId }) => {
  const [requestId, setRequestId] = useState(propRequestId || '');
  const [results, setResults] = useState<LabResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchResults = async (id: string) => {
    if (!id) {
      setError('Por favor ingresa un ID de solicitud válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // In a real implementation, this would fetch from your API
    // For demo purposes, we'll use mock data
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (id === 'demo123') {
        // Sample completed results
        setResults([
          {
            id: 'res_1',
            testName: 'Hemograma Completo',
            date: '2025-05-19',
            status: 'completed',
            result: {
              value: '5.2',
              unit: 'millones/μL',
              referenceRange: '4.5 - 5.5',
              isAbnormal: false
            },
            pdfUrl: '#'
          },
          {
            id: 'res_2',
            testName: 'Glucosa',
            date: '2025-05-19',
            status: 'completed',
            result: {
              value: '110',
              unit: 'mg/dL',
              referenceRange: '70 - 100',
              isAbnormal: true
            },
            pdfUrl: '#'
          },
          {
            id: 'res_3',
            testName: 'Perfil Lipídico',
            date: '2025-05-19',
            status: 'completed',
            result: {
              value: '190',
              unit: 'mg/dL',
              referenceRange: '< 200',
              isAbnormal: false
            },
            pdfUrl: '#'
          }
        ]);
      } else if (id === 'pending456') {
        // Sample pending results
        setResults([
          {
            id: 'res_4',
            testName: 'Hemograma Completo',
            date: '2025-05-19',
            status: 'processing'
          },
          {
            id: 'res_5',
            testName: 'Glucosa',
            date: '2025-05-19',
            status: 'processing'
          }
        ]);
      } else {
        setError('No se encontraron resultados para el ID proporcionado');
        setResults(null);
      }
    } catch (err) {
      setError('Error al recuperar los resultados. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (propRequestId) {
      fetchResults(propRequestId);
    }
  }, [propRequestId]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(requestId);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completado
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            En proceso
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <HelpCircle className="w-3 h-3 mr-1" />
            Pendiente
          </span>
        );
      default:
        return null;
    }
  };
  
  if (!propRequestId) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 mb-4">
            Para consultar tus resultados, ingresa el ID de tu solicitud:
          </p>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="Ej. req_123456789"
              className="flex-1"
              required
            />
            <button
              type="submit"
              className="bg-brand-jade-600 hover:bg-brand-jade-700 text-white px-4 py-2 rounded-md font-medium"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              ID de prueba para demostración: <code className="bg-gray-100 p-1 rounded">demo123</code> (resultados completos) o <code className="bg-gray-100 p-1 rounded">pending456</code> (en proceso)
            </p>
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <SearchX className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-start">
          <SearchX className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-gray-600 mt-2">
              Verifica que el ID sea correcto e intenta de nuevo.
            </p>
            <button
              onClick={() => setRequestId('')}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium"
            >
              Buscar otro ID
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="text-center py-6">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">
          No se encontraron resultados para el ID proporcionado.
        </p>
      </div>
    );
  }
  
  const allCompleted = results.every(result => result.status === 'completed');
  const anyProcessing = results.some(result => result.status === 'processing');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Resultados para solicitud #{propRequestId}</h3>
        <button
          onClick={() => setRequestId('')}
          className="text-gray-600 hover:text-gray-800 underline text-sm bg-transparent"
        >
          Consultar otro ID
        </button>
      </div>
      
      {anyProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Algunos resultados aún están siendo procesados. Los resultados completos estarán disponibles en un plazo de 24-48 horas.
          </p>
        </div>
      )}
      
      <div className="divide-y divide-gray-200 border rounded-lg">
        {results.map(result => (
          <div key={result.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{result.testName}</h4>
                <p className="text-sm text-gray-500">Fecha: {result.date}</p>
              </div>
              <div>
                {getStatusBadge(result.status)}
              </div>
            </div>
            
            {result.status === 'completed' && result.result && (
              <>
                <div className="bg-gray-50 rounded-md p-3 mb-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Resultado</p>
                      <p className="font-medium">{result.result.value} {result.result.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Rango de referencia</p>
                      <p className="font-medium">{result.result.referenceRange}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Estado</p>
                      {result.result.isAbnormal ? (
                        <p className="font-medium text-amber-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Fuera de rango
                        </p>
                      ) : (
                        <p className="font-medium text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Normal
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {result.pdfUrl && (
                  <a
                    href={result.pdfUrl}
                    className="inline-flex items-center text-sm text-brand-jade-600 hover:text-brand-jade-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Descargar PDF
                  </a>
                )}
              </>
            )}
            
            {result.status !== 'completed' && (
              <p className="text-sm text-gray-600 italic">
                Los resultados estarán disponibles próximamente.
              </p>
            )}
          </div>
        ))}
      </div>
      
      {allCompleted && (
        <div className="flex justify-end">
          <button
            className="bg-brand-jade-600 hover:bg-brand-jade-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            onClick={() => alert('Esta funcionalidad enviará todos los resultados por correo electrónico.')}
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar todos los resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default LabResultsViewer;