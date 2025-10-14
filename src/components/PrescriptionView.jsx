import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PrescriptionView({ prescription, patient, doctor }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // Generate QR code URL using a public QR code API
    if (prescription?.qr_token) {
      const qrData = JSON.stringify({
        token: prescription.qr_token,
        type: 'erx',
        id: prescription.id
      });
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [prescription]);

  if (!prescription) return null;

  const payload = prescription.payload || {};
  const medications = payload.medications || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-medical-500 to-medical-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Receta Médica Electrónica</h2>
            <p className="text-white/90 text-sm">NOM-004 Cumplimiento Digital</p>
          </div>
          {prescription.controlled && (
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
              CONTROLADO
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Patient Info */}
        <div className="grid md:grid-cols-2 gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="text-sm text-gray-600 mb-1">Paciente</div>
            <div className="font-semibold text-gray-900">{patient?.name || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Fecha de emisión</div>
            <div className="font-semibold text-gray-900">
              {new Date(prescription.created_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Médico</div>
            <div className="font-semibold text-gray-900">{doctor?.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">Cédula: {doctor?.cedula || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Válida hasta</div>
            <div className="font-semibold text-gray-900">
              {payload.valid_until ? new Date(payload.valid_until).toLocaleDateString('es-MX') : '30 días'}
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        {payload.diagnosis && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-900 mb-1">Diagnóstico</div>
            <div className="text-sm text-blue-800">{payload.diagnosis}</div>
          </div>
        )}

        {/* Medications */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Medicamentos prescritos</h3>
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-medical-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-gray-900 text-lg">{med.drug}</div>
                  <div className="text-sm text-gray-600">#{index + 1}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Dosis:</span>
                    <span className="ml-2 font-semibold text-gray-900">{med.dose}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="ml-2 font-semibold text-gray-900">{med.frequency}</span>
                  </div>
                  {med.duration && (
                    <div>
                      <span className="text-gray-600">Duración:</span>
                      <span className="ml-2 font-semibold text-gray-900">{med.duration}</span>
                    </div>
                  )}
                  {med.instructions && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Instrucciones:</span>
                      <span className="ml-2 font-semibold text-gray-900">{med.instructions}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {payload.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900 mb-1">Notas adicionales</div>
            <div className="text-sm text-gray-700">{payload.notes}</div>
          </div>
        )}

        {/* QR Code Section */}
        <div className="bg-gradient-to-br from-medical-50 to-brand-50 rounded-xl p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-3">Código QR para farmacia</h3>
          <div className="bg-white rounded-lg p-4 inline-block shadow-md mb-3">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            )}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Token: <span className="font-mono font-semibold">{prescription.qr_token}</span>
          </div>
          <p className="text-xs text-gray-500">
            Presenta este código en la farmacia para surtir tu receta
          </p>
        </div>

        {/* Pharmacy Options */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h4 className="font-semibold text-green-900">Farmacias disponibles</h4>
          </div>
          <div className="text-sm text-green-800 space-y-1">
            <div>• Farmacia Piloto (todas las sucursales)</div>
            <div>• Entrega a domicilio disponible</div>
            <div>• Precios especiales con Doctor.mx</div>
          </div>
        </div>

        {/* Prescription ID */}
        <div className="text-center pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            ID de receta: {prescription.id}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Estado: <span className={`font-semibold ${
              prescription.status === 'issued' ? 'text-green-600' :
              prescription.status === 'filled' ? 'text-blue-600' :
              'text-gray-600'
            }`}>
              {prescription.status === 'issued' ? 'Emitida' :
               prescription.status === 'filled' ? 'Surtida' :
               prescription.status === 'routed' ? 'En farmacia' :
               'Cancelada'}
            </span>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
          <p className="mb-2">
            <strong>Aviso Legal:</strong> Esta receta electrónica es válida conforme a la NOM-004-SSA3-2012.
            Puede ser surtida en cualquier farmacia que participe en el programa Doctor.mx.
          </p>
          <p>
            La autenticidad de este documento puede ser verificada con el código QR o token único.
            No se requiere receta física para medicamentos no controlados.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-6 py-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          🖨️ Imprimir
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/prescription/${prescription.id}`;
            navigator.clipboard.writeText(url);
            alert('Enlace copiado al portapapeles');
          }}
          className="flex-1 py-3 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
        >
          🔗 Compartir
        </button>
      </div>
    </motion.div>
  );
}
