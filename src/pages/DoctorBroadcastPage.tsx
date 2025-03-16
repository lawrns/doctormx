import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle, Users, Calendar, X, Filter, Plus, Check } from 'lucide-react';
import { createBroadcast } from '../lib/api/broadcasts';

const DoctorBroadcastPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [broadcastType, setBroadcastType] = useState<'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update'>('broadcast');
  const [isUrgent, setIsUrgent] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  
  // Audience targeting
  const [audienceType, setAudienceType] = useState<'all' | 'appointments' | 'conditions' | 'custom'>('all');
  const [appointmentDateRange, setAppointmentDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  
  // Conditions list (mock for now, would come from API)
  const conditions = [
    'Hipertensión', 
    'Diabetes', 
    'Asma', 
    'Artritis',
    'Enfermedad cardíaca',
    'Depresión',
    'Ansiedad'
  ];
  
  // Patient list (mock for now, would come from API)
  const patients = [
    { id: 'p1', name: 'María González' },
    { id: 'p2', name: 'Carlos Rodríguez' },
    { id: 'p3', name: 'Ana López' },
    { id: 'p4', name: 'Juan Martínez' }
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Por favor complete el título y el contenido del mensaje');
      return;
    }
    
    // Build target audience data based on type
    let targetAudienceData: any = {};
    
    if (audienceType === 'appointments') {
      if (!appointmentDateRange.startDate || !appointmentDateRange.endDate) {
        setError('Por favor seleccione un rango de fechas válido');
        return;
      }
      targetAudienceData = appointmentDateRange;
    } else if (audienceType === 'conditions') {
      if (!selectedCondition) {
        setError('Por favor seleccione una condición');
        return;
      }
      targetAudienceData = { condition: selectedCondition };
    } else if (audienceType === 'custom') {
      if (selectedPatients.length === 0) {
        setError('Por favor seleccione al menos un paciente');
        return;
      }
      targetAudienceData = { patientIds: selectedPatients };
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await createBroadcast({
        title,
        content,
        broadcastType,
        isUrgent,
        targetAudience: {
          type: audienceType,
          data: targetAudienceData
        },
        scheduledFor: scheduledFor || null
      });
      
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/doctor-dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating broadcast:', err);
      setError('Ocurrió un error al enviar el mensaje. Por favor intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Enviar mensaje a pacientes</h1>
          <p className="text-gray-600">Conecte con sus pacientes compartiendo noticias, consejos o recordatorios</p>
        </div>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <Check size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-green-800 mb-2">Mensaje enviado correctamente</h2>
            <p className="text-green-700 mb-4">
              Su mensaje ha sido enviado a los pacientes seleccionados.
            </p>
            <button
              onClick={() => navigate('/doctor-dashboard')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Volver al panel
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Message Type */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tipo de mensaje</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="messageType"
                    className="sr-only"
                    checked={broadcastType === 'broadcast'}
                    onChange={() => setBroadcastType('broadcast')}
                  />
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${broadcastType === 'broadcast' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                      {broadcastType === 'broadcast' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Noticia general</span>
                      <p className="text-sm text-gray-500">Actualización general para todos sus pacientes</p>
                    </div>
                  </div>
                </label>
                
                <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="messageType"
                    className="sr-only"
                    checked={broadcastType === 'health_tip'}
                    onChange={() => setBroadcastType('health_tip')}
                  />
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${broadcastType === 'health_tip' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                      {broadcastType === 'health_tip' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Consejo de salud</span>
                      <p className="text-sm text-gray-500">Recomendación o consejo para mejorar la salud</p>
                    </div>
                  </div>
                </label>
                
                <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="messageType"
                    className="sr-only"
                    checked={broadcastType === 'appointment_reminder'}
                    onChange={() => setBroadcastType('appointment_reminder')}
                  />
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${broadcastType === 'appointment_reminder' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                      {broadcastType === 'appointment_reminder' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Recordatorio de cita</span>
                      <p className="text-sm text-gray-500">Información sobre citas próximas</p>
                    </div>
                  </div>
                </label>
                
                <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="messageType"
                    className="sr-only"
                    checked={broadcastType === 'practice_update'}
                    onChange={() => setBroadcastType('practice_update')}
                  />
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${broadcastType === 'practice_update' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                      {broadcastType === 'practice_update' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Actualización del consultorio</span>
                      <p className="text-sm text-gray-500">Cambios de horario, ubicación, etc.</p>
                    </div>
                  </div>
                </label>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">Marcar como urgente</span>
                </label>
              </div>
            </div>
            
            {/* Message Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Contenido del mensaje</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Título del mensaje"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Escriba el contenido de su mensaje aquí..."
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-1">
                    Programar envío (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledFor"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Deje en blanco para enviar inmediatamente.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Audience Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Destinatarios</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audienceType"
                      className="sr-only"
                      checked={audienceType === 'all'}
                      onChange={() => setAudienceType('all')}
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${audienceType === 'all' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                        {audienceType === 'all' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Todos mis pacientes</span>
                        <p className="text-sm text-gray-500">Enviar a todos los pacientes en su lista</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audienceType"
                      className="sr-only"
                      checked={audienceType === 'appointments'}
                      onChange={() => setAudienceType('appointments')}
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${audienceType === 'appointments' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                        {audienceType === 'appointments' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Pacientes con citas</span>
                        <p className="text-sm text-gray-500">Enviar a pacientes con citas próximas</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audienceType"
                      className="sr-only"
                      checked={audienceType === 'conditions'}
                      onChange={() => setAudienceType('conditions')}
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${audienceType === 'conditions' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                        {audienceType === 'conditions' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Por condición médica</span>
                        <p className="text-sm text-gray-500">Enviar a pacientes con una condición específica</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="audienceType"
                      className="sr-only"
                      checked={audienceType === 'custom'}
                      onChange={() => setAudienceType('custom')}
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${audienceType === 'custom' ? 'bg-blue-600' : 'border border-gray-300'}`}>
                        {audienceType === 'custom' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Selección personalizada</span>
                        <p className="text-sm text-gray-500">Seleccionar pacientes específicos</p>
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* Audience specific options */}
                {audienceType === 'appointments' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Seleccionar rango de fechas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de inicio
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={appointmentDateRange.startDate}
                          onChange={(e) => setAppointmentDateRange({
                            ...appointmentDateRange,
                            startDate: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de fin
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={appointmentDateRange.endDate}
                          onChange={(e) => setAppointmentDateRange({
                            ...appointmentDateRange,
                            endDate: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Los mensajes serán enviados a pacientes con citas en este rango de fechas.
                    </p>
                  </div>
                )}
                
                {audienceType === 'conditions' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Seleccionar condición médica</h3>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar condición</option>
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                      Los mensajes serán enviados a pacientes con esta condición registrada.
                    </p>
                  </div>
                )}
                
                {audienceType === 'custom' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Seleccionar pacientes</h3>
                    <div className="border border-gray-300 rounded-md mb-3">
                      <div className="max-h-60 overflow-y-auto p-2">
                        {patients.map(patient => (
                          <label key={patient.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                            <input
                              type="checkbox"
                              checked={selectedPatients.includes(patient.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPatients([...selectedPatients, patient.id]);
                                } else {
                                  setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 text-gray-700">{patient.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {selectedPatients.length} pacientes seleccionados
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPatients(patients.map(p => p.id))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Seleccionar todos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/doctor-dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Enviar mensaje
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorBroadcastPage;