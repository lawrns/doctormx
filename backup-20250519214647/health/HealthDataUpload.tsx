import React, { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { queueHealthDataForSync } from './healthSync';
import { HealthMetricType } from './types';

/**
 * Component for uploading health data from photos or files
 * This is an alternative approach since direct Apple Health integration
 * is not possible in a PWA
 */
const HealthDataUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // In a real implementation, we would:
      // 1. Parse the health data from the CSV/XML
      // 2. Convert it to our health data format
      // 3. Store it for syncing
      
      // For now, we'll simulate processing a health data export
      await simulateHealthDataProcessing(files[0]);
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error processing health data:', error);
      setUploadError('No se pudo procesar el archivo. Asegúrate de que sea un archivo de exportación de salud válido.');
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Simulate health data processing
  const simulateHealthDataProcessing = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Create mock health data based on the file name
        const mockHealthData = generateMockHealthData(file.name);
        
        // Queue the mock data for sync
        await queueHealthDataForSync(mockHealthData);
        
        resolve();
      }, 1500);
    });
  };
  
  // Generate mock health data based on file name
  const generateMockHealthData = (fileName: string) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mockData = [];
    
    // Heart rate data
    if (fileName.toLowerCase().includes('heart') || fileName.toLowerCase().includes('health')) {
      for (let i = 0; i < 24; i++) {
        const date = new Date(yesterday);
        date.setHours(i);
        
        mockData.push({
          id: `hr-${date.toISOString()}`,
          type: HealthMetricType.HEART_RATE,
          startDate: date.toISOString(),
          endDate: date.toISOString(),
          bpm: 65 + Math.floor(Math.random() * 20),
          sourceApp: 'health-upload'
        });
      }
    }
    
    // Steps data
    if (fileName.toLowerCase().includes('steps') || fileName.toLowerCase().includes('activity') || fileName.toLowerCase().includes('health')) {
      const date = new Date(yesterday);
      mockData.push({
        id: `steps-${date.toISOString()}`,
        type: HealthMetricType.STEPS,
        startDate: date.toISOString(),
        endDate: now.toISOString(),
        count: 6000 + Math.floor(Math.random() * 4000),
        sourceApp: 'health-upload'
      });
    }
    
    // Blood oxygen data
    if (fileName.toLowerCase().includes('oxygen') || fileName.toLowerCase().includes('health')) {
      for (let i = 0; i < 5; i++) {
        const date = new Date(yesterday);
        date.setHours(6 + i * 3);
        
        mockData.push({
          id: `oxygen-${date.toISOString()}`,
          type: HealthMetricType.BLOOD_OXYGEN,
          startDate: date.toISOString(),
          endDate: date.toISOString(),
          percentage: 95 + Math.floor(Math.random() * 4),
          sourceApp: 'health-upload'
        });
      }
    }
    
    return mockData;
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 text-lg mb-4">Alternativa: Compartir datos de salud</h3>
      
      <p className="text-gray-600 mb-4">
        Puedes exportar tus datos de salud desde la app de Apple Health y subirlos aquí
        para visualizarlos en el dashboard.
      </p>
      
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2">¿Cómo exportar datos de Apple Health?</h4>
        <ol className="list-decimal list-inside text-gray-600 space-y-1">
          <li>Abre la app de Apple Health en tu iPhone</li>
          <li>Toca en tu perfil (esquina superior derecha)</li>
          <li>Selecciona "Exportar datos de salud"</li>
          <li>Sube el archivo exportado aquí</li>
        </ol>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isUploading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            <>
              <Upload size={18} className="mr-2" />
              Subir archivo
            </>
          )}
        </button>
        
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center justify-center py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Camera size={18} className="mr-2" />
          Tomar foto
        </button>
        
        <input
          type="file"
          accept=".xml,.csv,.txt"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      
      {uploadSuccess && (
        <div className="mt-4 bg-green-50 text-green-800 px-4 py-2 rounded-lg">
          ¡Datos procesados con éxito! Tu dashboard se actualizará en breve.
        </div>
      )}
      
      {uploadError && (
        <div className="mt-4 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default HealthDataUpload;
