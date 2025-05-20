import React, { useState } from 'react';
import { createBroadcast, BroadcastCreateParams } from '../../lib/api/broadcasts';
import { AlertCircle, MessageCircle, Send, CalendarClock, ChevronDown, X } from 'lucide-react';

interface BroadcastCreatorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BroadcastCreator: React.FC<BroadcastCreatorProps> = ({ 
  onSuccess,
  onCancel
}) => {
  const [form, setForm] = useState<{
    title: string;
    content: string;
    broadcastType: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
    isUrgent: boolean;
    targetAudienceType: 'all' | 'appointments' | 'conditions' | 'custom';
    startDate?: string;
    endDate?: string;
    condition?: string;
    category?: string;
    scheduledFor?: string;
  }>({
    title: '',
    content: '',
    broadcastType: 'broadcast',
    isUrgent: false,
    targetAudienceType: 'all'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Format the target audience based on the selected type
      let targetAudience: any = { type: form.targetAudienceType };
      
      if (form.targetAudienceType === 'appointments' && form.startDate && form.endDate) {
        targetAudience.data = {
          startDate: form.startDate,
          endDate: form.endDate
        };
      } else if (form.targetAudienceType === 'conditions' && form.condition) {
        targetAudience.data = {
          condition: form.condition
        };
      }
      
      // Create the broadcast params
      const params: BroadcastCreateParams = {
        title: form.title,
        content: form.content,
        broadcastType: form.broadcastType,
        isUrgent: form.isUrgent,
        targetAudience,
        category: form.category,
        scheduledFor: form.scheduledFor
      };
      
      // Send the broadcast
      await createBroadcast(params);
      
      // Show success message
      setSuccessMessage('Mensaje enviado correctamente');
      
      // Clear form
      setForm({
        title: '',
        content: '',
        broadcastType: 'broadcast',
        isUrgent: false,
        targetAudienceType: 'all'
      });
      
      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error creating broadcast:', err);
      setError(err.message || 'No se pudo enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const broadcastTypes = [
    { value: 'broadcast', label: 'Anuncio General', icon: <MessageCircle size={16} className="mr-2" /> },
    { value: 'health_tip', label: 'Consejo de Salud', icon: <AlertCircle size={16} className="mr-2" /> },
    { value: 'practice_update', label: 'Actualización del Consultorio', icon: <CalendarClock size={16} className="mr-2" /> }
  ];
  
  const targetAudienceTypes = [
    { value: 'all', label: 'Todos mis pacientes' },
    { value: 'appointments', label: 'Pacientes con citas próximas' },
    { value: 'conditions', label: 'Pacientes con condición específica' }
  ];
  
  const conditionOptions = [
    'Hipertensión',
    'Diabetes',
    'Asma',
    'Artritis',
    'Colesterol Alto',
    'Obesidad',
    'Depresión',
    'Ansiedad',
    'Migrañas',
    'Enfermedad Cardíaca'
  ];
  
  const categoryOptions = [
    'Prevención',
    'Tratamientos',
    'Nutrición',
    'Ejercicio',
    'Salud Mental',
    'Vacunación',
    'Medicamentos',
    'Seguimiento',
    'Horarios'
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Enviar mensaje a pacientes</h2>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Broadcast type and urgency */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de mensaje
              </label>
              <div className="flex space-x-2">
                {broadcastTypes.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      form.broadcastType === type.value
                        ? 'bg-blue-50 border-blue-600 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="broadcastType"
                      value={type.value}
                      checked={form.broadcastType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {type.icon}
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 space-x-2">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={form.isUrgent}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span>Marcar como urgente</span>
              </label>
            </div>
          </div>
          
          {/* Message title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Horario especial Semana Santa"
              required
            />
          </div>
          
          {/* Message content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Contenido del mensaje *
            </label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escribe aquí tu mensaje..."
              rows={6}
              required
            ></textarea>
          </div>
          
          {/* Target audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destinatarios *
            </label>
            <div className="space-y-3">
              {targetAudienceTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center px-4 py-3 rounded-lg border ${
                    form.targetAudienceType === type.value
                      ? 'bg-blue-50 border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetAudienceType"
                    value={type.value}
                    checked={form.targetAudienceType === type.value}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">{type.label}</span>
                </label>
              ))}
              
              {/* Appointments date range */}
              {form.targetAudienceType === 'appointments' && (
                <div className="flex flex-col md:flex-row md:space-x-4 mt-3 ml-6">
                  <div className="mb-3 md:mb-0">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Desde
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={form.startDate || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required={form.targetAudienceType === 'appointments'}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Hasta
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={form.endDate || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required={form.targetAudienceType === 'appointments'}
                    />
                  </div>
                </div>
              )}
              
              {/* Condition selection */}
              {form.targetAudienceType === 'conditions' && (
                <div className="mt-3 ml-6">
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Condición
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={form.condition || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required={form.targetAudienceType === 'conditions'}
                  >
                    <option value="">Seleccionar condición</option>
                    {conditionOptions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría (opcional)
            </label>
            <select
              id="category"
              name="category"
              value={form.category || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar categoría</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Schedule for later */}
          <div>
            <div className="flex items-center mb-3">
              <label htmlFor="scheduledFor" className="text-sm font-medium text-gray-700 mr-3">
                Programar envío para después
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="scheduledFor"
                  name="scheduledFor"
                  value={form.scheduledFor || ''}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 italic">
              Si no seleccionas una fecha, el mensaje se enviará inmediatamente.
            </p>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Send size={18} className="mr-2" />
                  Enviar mensaje
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BroadcastCreator;