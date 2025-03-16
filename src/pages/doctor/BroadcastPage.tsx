import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, Clock, MessageCircle, ArrowLeft, 
  Users, Calendar, Heart, Check, X, Send, ChevronDown 
} from 'lucide-react';
import { createBroadcast, getDoctorBroadcasts, BroadcastCreateParams } from '../../lib/api/broadcasts';

// Define the types for the page
type BroadcastType = 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
type TargetAudienceType = 'all' | 'appointments' | 'conditions' | 'custom';

interface DoctorBroadcast {
  id: string;
  title: string;
  content: string;
  broadcastType: BroadcastType;
  isUrgent: boolean;
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  targetAudience: string;
  analytics: {
    total: number;
    read: number;
    readRate: number;
    likes: number;
  };
}

// Component for the broadcast creation page
const BroadcastPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [broadcasts, setBroadcasts] = useState<DoctorBroadcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [broadcastType, setBroadcastType] = useState<BroadcastType>('broadcast');
  const [isUrgent, setIsUrgent] = useState(false);
  const [targetAudience, setTargetAudience] = useState<TargetAudienceType>('all');
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [category, setCategory] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  
  // Load broadcasts history
  useEffect(() => {
    if (activeTab === 'history') {
      fetchBroadcasts();
    }
  }, [activeTab]);
  
  const fetchBroadcasts = async () => {
    try {
      setIsLoading(true);
      const broadcastsData = await getDoctorBroadcasts();
      setBroadcasts(broadcastsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
      setError('No se pudieron cargar las actualizaciones enviadas');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !content) {
      setSendError('Por favor, complete todos los campos requeridos');
      return;
    }
    
    // Prepare scheduled date if applicable
    let scheduledFor = null;
    if (scheduleLater && scheduledDate && scheduledTime) {
      scheduledFor = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    }
    
    // Prepare target audience data
    const targetAudienceData: { 
      type: TargetAudienceType;
      data?: any;
    } = {
      type: targetAudience
    };
    
    // Add additional target audience data based on type
    if (targetAudience === 'conditions' && category) {
      targetAudienceData.data = { condition: category };
    } else if (targetAudience === 'appointments') {
      // In a real app, we'd include date range here
      targetAudienceData.data = { 
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ahead
      };
    }
    
    // Create broadcast params
    const params: BroadcastCreateParams = {
      title,
      content,
      broadcastType,
      isUrgent,
      targetAudience: targetAudienceData,
      scheduledFor,
      category: targetAudience === 'conditions' ? category : undefined
    };
    
    try {
      setIsSending(true);
      setSendError(null);
      
      // Send the broadcast
      const broadcastId = await createBroadcast(params);
      
      // Show success message
      setSendSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setTitle('');
        setContent('');
        setBroadcastType('broadcast');
        setIsUrgent(false);
        setTargetAudience('all');
        setScheduleLater(false);
        setScheduledDate('');
        setScheduledTime('');
        setCategory('');
        setSendSuccess(false);
        
        // Switch to history tab to see the new broadcast
        setActiveTab('history');
      }, 2000);
    } catch (err) {
      console.error('Error creating broadcast:', err);
      setSendError('Hubo un error al enviar la actualización. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Render the broadcast creation form
  const renderCreateForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {sendSuccess && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
            <Check size={20} className="mr-2" />
            <span>Actualización enviada correctamente a tus pacientes.</span>
          </div>
        )}
        
        {sendError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span>{sendError}</span>
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Contenido <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="broadcastType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de actualización
            </label>
            <select
              id="broadcastType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={broadcastType}
              onChange={(e) => setBroadcastType(e.target.value as BroadcastType)}
            >
              <option value="broadcast">Anuncio general</option>
              <option value="health_tip">Consejo de salud</option>
              <option value="practice_update">Actualización del consultorio</option>
              <option value="appointment_reminder">Recordatorio de citas</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
              Audiencia objetivo
            </label>
            <select
              id="targetAudience"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudienceType)}
            >
              <option value="all">Todos mis pacientes</option>
              <option value="appointments">Pacientes con citas próximas</option>
              <option value="conditions">Pacientes con condiciones específicas</option>
            </select>
          </div>
        </div>
        
        {targetAudience === 'conditions' && (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Condición
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required={targetAudience === 'conditions'}
            >
              <option value="">Seleccionar condición</option>
              <option value="Hipertensión">Hipertensión</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Asma">Asma</option>
              <option value="Artritis">Artritis</option>
              <option value="Depresión">Depresión</option>
              <option value="Ansiedad">Ansiedad</option>
            </select>
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isUrgent"
            className="h-4 w-4 text-blue-600 rounded"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
          />
          <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-700">
            Marcar como importante (los pacientes recibirán una notificación prioritaria)
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="scheduleLater"
            className="h-4 w-4 text-blue-600 rounded"
            checked={scheduleLater}
            onChange={(e) => setScheduleLater(e.target.checked)}
          />
          <label htmlFor="scheduleLater" className="ml-2 block text-sm text-gray-700">
            Programar para enviar más tarde
          </label>
        </div>
        
        {scheduleLater && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                id="scheduledDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required={scheduleLater}
              />
            </div>
            
            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <input
                type="time"
                id="scheduledTime"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required={scheduleLater}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <span className="mr-2">Enviando...</span>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Enviar actualización
              </>
            )}
          </button>
        </div>
      </form>
    );
  };
  
  // Render the broadcast history
  const renderHistory = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-600">Cargando historial de actualizaciones...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
          <AlertCircle size={32} className="mx-auto mb-4" />
          <p>{error}</p>
          <button
            onClick={fetchBroadcasts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      );
    }
    
    if (broadcasts.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No has enviado actualizaciones</h3>
          <p className="text-gray-600 mb-6">Mantén a tus pacientes informados enviando actualizaciones regulares.</p>
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Crear nueva actualización
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {broadcasts.map((broadcast) => (
          <div key={broadcast.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{broadcast.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock size={14} className="mr-1" />
                  <span>
                    {new Date(broadcast.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                {broadcast.isUrgent && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <AlertCircle size={12} className="mr-1" />
                    Importante
                  </span>
                )}
                
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {broadcast.broadcastType === 'broadcast' 
                    ? 'Anuncio general' 
                    : broadcast.broadcastType === 'health_tip' 
                      ? 'Consejo de salud' 
                      : broadcast.broadcastType === 'practice_update' 
                        ? 'Actualización del consultorio' 
                        : 'Recordatorio de citas'}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3 mb-3">
              <p className="text-gray-600 line-clamp-2">{broadcast.content}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Enviado a:</span> {broadcast.targetAudience}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users size={14} className="mr-1" />
                  <span>{broadcast.analytics.total} pacientes</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <MessageCircle size={14} className="mr-1" />
                  <span>{broadcast.analytics.read} leídos ({broadcast.analytics.readRate.toFixed(0)}%)</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Heart size={14} className="mr-1" />
                  <span>{broadcast.analytics.likes} likes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Volver</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Comunicación con pacientes</h1>
          <p className="text-gray-600">Mantén a tus pacientes informados con actualizaciones personalizadas.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'create'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('create')}
              >
                Crear nueva actualización
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Historial de actualizaciones
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'create' ? renderCreateForm() : renderHistory()}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h2 className="text-lg font-medium text-blue-900 mb-3">Consejos para comunicarse efectivamente con pacientes</h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <Check size={18} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Mantén tus mensajes claros y concisos.</span>
            </li>
            <li className="flex items-start">
              <Check size={18} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Utiliza un lenguaje que tus pacientes puedan entender fácilmente.</span>
            </li>
            <li className="flex items-start">
              <Check size={18} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Envía actualizaciones regulares para mantener el compromiso.</span>
            </li>
            <li className="flex items-start">
              <Check size={18} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Reserva la marca de "importante" para información verdaderamente urgente.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPage;