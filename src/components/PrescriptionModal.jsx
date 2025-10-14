import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function PrescriptionModal({ consult, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([{
    drug: '',
    dose: '',
    frequency: '',
    duration: '',
    instructions: ''
  }]);
  const [notes, setNotes] = useState('');
  const [isControlled, setIsControlled] = useState(false);

  const addMedication = () => {
    setMedications([...medications, {
      drug: '',
      dose: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const generateQRToken = () => {
    return 'ERX-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate medications
      const validMedications = medications.filter(m => m.drug && m.dose && m.frequency);
      if (validMedications.length === 0) {
        toast.error('Agrega al menos un medicamento');
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Generate QR token
      const qrToken = generateQRToken();

      // Create prescription payload
      const payload = {
        medications: validMedications,
        notes: notes,
        diagnosis: consult.triage?.symptoms || '',
        issued_date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      // Insert e-prescription
      const { data: erxData, error: erxError } = await supabase
        .from('erx')
        .insert({
          consult_id: consult.id,
          doctor_id: user.id,
          patient_id: consult.patient_id,
          payload: payload,
          controlled: isControlled,
          status: 'issued',
          qr_token: qrToken
        })
        .select()
        .single();

      if (erxError) throw erxError;

      // Log audit trail
      await supabase.from('audit_trail').insert({
        actor_user_id: user.id,
        entity: 'erx',
        entity_id: erxData.id,
        action: 'prescription_issued',
        diff: { medications: validMedications.length, controlled: isControlled }
      });

      toast.success('Receta emitida exitosamente');
      onSuccess?.(erxData);
      onClose();

    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.message || 'Error al crear receta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear receta electrónica</h2>
            <p className="text-sm text-gray-600">Paciente: {consult.users?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Medicamentos</h3>
              <button
                type="button"
                onClick={addMedication}
                className="px-4 py-2 text-sm bg-medical-100 text-medical-700 rounded-lg hover:bg-medical-200 transition-colors font-medium"
              >
                + Agregar medicamento
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Medicamento {index + 1}
                    </span>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del medicamento *
                      </label>
                      <input
                        type="text"
                        value={med.drug}
                        onChange={(e) => updateMedication(index, 'drug', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                        placeholder="ej. Paracetamol"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosis *
                      </label>
                      <input
                        type="text"
                        value={med.dose}
                        onChange={(e) => updateMedication(index, 'dose', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                        placeholder="ej. 500mg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frecuencia *
                      </label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                        placeholder="ej. Cada 8 horas"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración
                      </label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                        placeholder="ej. 5 días"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instrucciones
                      </label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                        placeholder="ej. Tomar con alimentos"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Indicaciones especiales para el paciente..."
            />
          </div>

          {/* Controlled Substance */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isControlled}
                onChange={(e) => setIsControlled(e.target.checked)}
                className="mt-1 w-4 h-4 text-medical-600 rounded focus:ring-2 focus:ring-medical-500"
              />
              <div>
                <div className="font-semibold text-gray-900">
                  Medicamento controlado
                </div>
                <div className="text-sm text-gray-600">
                  Marca esta casilla si la receta incluye sustancias controladas que requieren
                  verificación adicional en farmacia
                </div>
              </div>
            </label>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información importante</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• La receta será válida por 30 días</li>
              <li>• Se generará un código QR único para validación en farmacia</li>
              <li>• El paciente recibirá la receta por WhatsApp y email</li>
              <li>• Cumple con NOM-004 para prescripción electrónica</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-medical-500 to-medical-600 text-white font-bold rounded-lg hover:from-medical-600 hover:to-medical-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Emitiendo receta...' : 'Emitir receta'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
