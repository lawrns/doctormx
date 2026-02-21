'use client';

import { useState } from 'react';
import { logger } from '@/lib/observability/logger';

type TranscriptionUploaderProps = {
  appointmentId: string;
  onCompleteAction: (summary: {
    diagnosis: string;
    symptoms: string[];
    prescriptions: string[];
    followUpInstructions: string;
    nextSteps: string[];
  }) => void;
};

export default function TranscriptionUploader({ appointmentId, onCompleteAction }: TranscriptionUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar formato
    const validFormats = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/webm'];
    if (!validFormats.includes(file.type)) {
      setError('Formato no soportado. Usa MP3, WAV, M4A o WebM');
      return;
    }

    // Validar tamaño (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('Archivo muy grande. Máximo 25MB');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('appointmentId', appointmentId);
      formData.append('audio', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onCompleteAction(data.summary);
        } else {
          setError('Error al procesar audio');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Error al subir archivo');
        setUploading(false);
      });

      xhr.open('POST', '/api/ai/transcription');
      xhr.send(formData);
    } catch (err) {
      logger.error('Error uploading transcription', { error: err instanceof Error ? err.message : String(err) });
      setError('Error inesperado');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {!uploading ? (
          <>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="mt-4">
              <label htmlFor="audio-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Subir grabación de consulta
                </span>
                <input
                  id="audio-upload"
                  type="file"
                  className="hidden"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/webm"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">MP3, WAV, M4A o WebM hasta 25MB</p>
          </>
        ) : (
          <div>
            <div className="mx-auto h-12 w-12 mb-4">
              <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              {progress < 100 ? `Subiendo... ${progress}%` : 'Transcribiendo con IA...'}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Transcripción automática</p>
            <p className="mt-1">La IA transcribirá el audio y generará un resumen estructurado con diagnóstico, síntomas y plan de tratamiento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
