import React, { useState } from 'react';
import { 
  Users, Calendar, Heart, AlertCircle, 
  Send, X, Info, CheckCircle, Clock, 
  MessageCircle, FileText 
} from 'lucide-react';

// Message template types
interface MessageTemplate {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  type: 'health_tip' | 'seasonal_advice' | 'practice_update' | 'urgent_notice';
  color: string;
}

// Audience options
interface AudienceOption {
  id: string;
  name: string;
  description: string;
  count: number;
}

const messageTemplates: MessageTemplate[] = [
  {
    id: 'health_tip_1',
    title: 'Consejo de salud: Hipertensión',
    icon: <Heart className="text-red-500" size={20} />,
    content: 'Recuerde monitorear su presión arterial regularmente y mantener una dieta baja en sodio. La actividad física moderada puede ayudar a mantener niveles saludables.',
    type: 'health_tip',
    color: 'bg-red-50 border-red-200 text-red-800'
  },
  {
    id: 'seasonal_advice_1',
    title: 'Consejos para la temporada de alergias',
    icon: <Calendar className="text-green-500" size={20} />,
    content: 'La temporada de alergias ha comenzado. Recuerde mantener las ventanas cerradas, usar mascarilla al salir y tomar sus medicamentos según lo prescrito.',
    type: 'seasonal_advice',
    color: 'bg-green-50 border-green-200 text-green-800'
  },
  {
    id: 'practice_update_1',
    title: 'Actualización de la práctica: Nuevos horarios',
    icon: <Clock className="text-blue-500" size={20} />,
    content: 'Nos complace informarle que hemos ampliado nuestros horarios de atención. Ahora estamos disponibles también los sábados de 9:00 AM a 1:00 PM.',
    type: 'practice_update',
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  {
    id: 'urgent_notice_1',
    title: 'Aviso importante sobre medicamentos',
    icon: <AlertCircle className="text-amber-500" size={20} />,
    content: 'Ha habido un cambio en la disponibilidad de ciertos medicamentos. Por favor, póngase en contacto con nosotros si está tomando [nombre del medicamento].',
    type: 'urgent_notice',
    color: 'bg-amber-50 border-amber-200 text-amber-800'
  },
];

const audienceOptions: AudienceOption[] = [
  {
    id: 'all_patients',
    name: 'Todos los pacientes',
    description: 'Enviar a todos los pacientes registrados',
    count: 248
  },
  {
    id: 'upcoming_appointments',
    name: 'Citas próximas',
    description: 'Pacientes con citas en los próximos 7 días',
    count: 23
  },
  {
    id: 'condition_hypertension',
    name: 'Pacientes con hipertensión',
    description: 'Pacientes con diagnóstico de hipertensión',
    count: 42
  },
  {
    id: 'condition_diabetes',
    name: 'Pacientes con diabetes',
    description: 'Pacientes con diagnóstico de diabetes',
    count: 31
  },
  {
    id: 'recent_patients',
    name: 'Pacientes recientes',
    description: 'Pacientes vistos en los últimos 30 días',
    count: 56
  }
];

interface ProviderBroadcastProps {
  onClose?: () => void;
}

const ProviderBroadcast: React.FC<ProviderBroadcastProps> = ({ onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [messageTitle, setMessageTitle] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [selectedAudience, setSelectedAudience] = useState<string>('all_patients');
  const [deliveryMethod, setDeliveryMethod] = useState<{
    inApp: boolean;
    email: boolean;
    sms: boolean;
  }>({
    inApp: true,
    email: false,
    sms: false
  });
  const [scheduleSetting, setScheduleSetting] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    setSelectedTemplate(templateId);
    
    if (template) {
      setMessageTitle(template.title);
      setMessageContent(template.content);
    }
  };

  const handleSendMessage = () => {
    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      
      // Reset after showing success
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          setStep(1);
          setSelectedTemplate(null);
          setMessageTitle('');
          setMessageContent('');
          setSelectedAudience('all_patients');
          setDeliveryMethod({ inApp: true, email: false, sms: false });
          setScheduleSetting('now');
          setScheduleDate('');
          setScheduleTime('');
          setIsSent(false);
        }
      }, 3000);
    }, 1500);
  };

  const getSelectedTemplate = () => {
    return messageTemplates.find(t => t.id === selectedTemplate);
  };

  const getSelectedAudienceInfo = () => {
    return audienceOptions.find(a => a.id === selectedAudience);
  };

  // Render step 1 - Template selection
  const renderStepOne = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Elegir plantilla de mensaje</h3>
          <button
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messageTemplates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 hover:border-blue-200 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="flex items-start">
                <span className="mr-3 mt-1">{template.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {template.content.length > 100
                      ? template.content.substring(0, 100) + '...'
                      : template.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <Info size={16} />
          <span>También puede crear un mensaje personalizado</span>
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!selectedTemplate && (!messageTitle || !messageContent)}
            onClick={() => setStep(2)}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  };

  // Render step 2 - Message customization
  const renderStepTwo = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Personalizar mensaje</h3>
          <button
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div>
          <label htmlFor="messageTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Título del mensaje
          </label>
          <input
            type="text"
            id="messageTitle"
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contenido del mensaje
          </label>
          <textarea
            id="messageContent"
            rows={5}
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            required
          ></textarea>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Escriba el mensaje que desea enviar a sus pacientes. Puede usar variables como {'{nombre_paciente}'} 
            que se reemplazarán con la información real del paciente.
          </p>
        </div>
        
        {/* Message Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa</h4>
          <div className={`border rounded-lg p-4 ${getSelectedTemplate()?.color || 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-400'}`}>
            <div className="flex items-start">
              <span className="mr-3 mt-1">
                {getSelectedTemplate()?.icon || <MessageCircle className="text-blue-500" size={20} />}
              </span>
              <div>
                <h4 className="font-medium">{messageTitle}</h4>
                <p className="text-sm mt-1">{messageContent}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => setStep(1)}
          >
            Atrás
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!messageTitle || !messageContent}
            onClick={() => setStep(3)}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  };

  // Render step 3 - Audience selection
  const renderStepThree = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Seleccionar audiencia</h3>
          <button
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {audienceOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                selectedAudience === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 hover:border-blue-200 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedAudience(option.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{option.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{option.description}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{option.count}</span>
                  <Users size={16} className="ml-1 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => setStep(2)}
          >
            Atrás
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setStep(4)}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  };

  // Render step 4 - Delivery method and schedule
  const renderStepFour = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Método de entrega</h3>
          <button
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="inApp"
                name="inApp"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={deliveryMethod.inApp}
                onChange={(e) => setDeliveryMethod({...deliveryMethod, inApp: e.target.checked})}
              />
            </div>
            <div className="ml-3">
              <label htmlFor="inApp" className="font-medium text-gray-700 dark:text-gray-300">Notificación en la aplicación</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Los pacientes verán el mensaje en su panel de control</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="email"
                name="email"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={deliveryMethod.email}
                onChange={(e) => setDeliveryMethod({...deliveryMethod, email: e.target.checked})}
              />
            </div>
            <div className="ml-3">
              <label htmlFor="email" className="font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enviar como correo electrónico (solo para pacientes que han aceptado)</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="sms"
                name="sms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={deliveryMethod.sms}
                onChange={(e) => setDeliveryMethod({...deliveryMethod, sms: e.target.checked})}
              />
            </div>
            <div className="ml-3">
              <label htmlFor="sms" className="font-medium text-gray-700 dark:text-gray-300">SMS</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enviar como mensaje de texto (solo para mensajes urgentes y pacientes que han aceptado)</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Programación</h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="sendNow"
                name="scheduleSetting"
                type="radio"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={scheduleSetting === 'now'}
                onChange={() => setScheduleSetting('now')}
              />
              <label htmlFor="sendNow" className="ml-3 font-medium text-gray-700 dark:text-gray-300">
                Enviar ahora
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                id="sendLater"
                name="scheduleSetting"
                type="radio"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                checked={scheduleSetting === 'later'}
                onChange={() => setScheduleSetting('later')}
              />
              <div className="ml-3">
                <label htmlFor="sendLater" className="font-medium text-gray-700 dark:text-gray-300">
                  Programar para más tarde
                </label>
                
                {scheduleSetting === 'later' && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="scheduleDate" className="block text-sm text-gray-500 dark:text-gray-400">
                        Fecha
                      </label>
                      <input
                        type="date"
                        id="scheduleDate"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label htmlFor="scheduleTime" className="block text-sm text-gray-500 dark:text-gray-400">
                        Hora
                      </label>
                      <input
                        type="time"
                        id="scheduleTime"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => setStep(3)}
          >
            Atrás
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={
              !deliveryMethod.inApp && !deliveryMethod.email && !deliveryMethod.sms ||
              (scheduleSetting === 'later' && (!scheduleDate || !scheduleTime))
            }
            onClick={() => setStep(5)}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  };

  // Render step 5 - Confirmation
  const renderStepFive = () => {
    const audienceInfo = getSelectedAudienceInfo();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Confirmar y enviar</h3>
          <button
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Título del mensaje</h4>
            <p className="mt-1 text-gray-900 dark:text-gray-100">{messageTitle}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Audiencia</h4>
            <p className="mt-1 text-gray-900 dark:text-gray-100">
              {audienceInfo?.name} ({audienceInfo?.count} pacientes)
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Método de entrega</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {deliveryMethod.inApp && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Notificación en la aplicación
                </span>
              )}
              {deliveryMethod.email && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Correo electrónico
                </span>
              )}
              {deliveryMethod.sms && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  SMS
                </span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Programación</h4>
            <p className="mt-1 text-gray-900 dark:text-gray-100">
              {scheduleSetting === 'now' 
                ? 'Enviar inmediatamente' 
                : `Programado para ${scheduleDate} a las ${scheduleTime}`}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa del mensaje</h4>
          <div className={`border rounded-lg p-4 ${getSelectedTemplate()?.color || 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-400'}`}>
            <div className="flex items-start">
              <span className="mr-3 mt-1">
                {getSelectedTemplate()?.icon || <MessageCircle className="text-blue-500" size={20} />}
              </span>
              <div>
                <h4 className="font-medium">{messageTitle}</h4>
                <p className="text-sm mt-1">{messageContent}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 flex items-start">
          <Info size={20} className="text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p>Este mensaje se enviará a {audienceInfo?.count} pacientes.</p>
            <p className="mt-1">
              {scheduleSetting === 'now' 
                ? 'Los pacientes recibirán el mensaje inmediatamente.' 
                : `El mensaje está programado para enviarse el ${scheduleDate} a las ${scheduleTime}.`}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => setStep(4)}
          >
            Atrás
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                {scheduleSetting === 'now' ? 'Enviar mensaje' : 'Programar mensaje'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Success message
  const renderSuccess = () => {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-100">Mensaje enviado con éxito</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {scheduleSetting === 'now' 
            ? `Su mensaje ha sido enviado a ${getSelectedAudienceInfo()?.count} pacientes.` 
            : `Su mensaje ha sido programado para enviarse el ${scheduleDate} a las ${scheduleTime}.`}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
      {isSent ? (
        renderSuccess()
      ) : (
        <>
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderStepThree()}
          {step === 4 && renderStepFour()}
          {step === 5 && renderStepFive()}
        </>
      )}
    </div>
  );
};

export default ProviderBroadcast;
