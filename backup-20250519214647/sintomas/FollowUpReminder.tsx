import { useState } from 'react';
import { Calendar, Bell, Check, Clock, AlarmClock, Save } from 'lucide-react';

interface FollowUpReminderProps {
  symptomName: string;
  severityLevel: 'low' | 'moderate' | 'high';
  onSave?: (reminderData: ReminderData) => void;
}

export interface ReminderData {
  symptomName: string;
  reminderDate: Date;
  reminderType: 'app' | 'email' | 'both';
  notes: string;
}

const FollowUpReminder: React.FC<FollowUpReminderProps> = ({
  symptomName,
  severityLevel,
  onSave
}) => {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderType, setReminderType] = useState<'app' | 'email' | 'both'>('app');
  const [reminderDate, setReminderDate] = useState<Date>(() => {
    // Default reminder date based on severity level
    const date = new Date();
    if (severityLevel === 'high') {
      date.setDate(date.getDate() + 2); // 2 days for high severity
    } else if (severityLevel === 'moderate') {
      date.setDate(date.getDate() + 5); // 5 days for moderate severity
    } else {
      date.setDate(date.getDate() + 7); // 7 days for low severity
    }
    return date;
  });
  const [notes, setNotes] = useState('');
  const [confirmationShown, setConfirmationShown] = useState(false);

  const handleSaveReminder = () => {
    const reminderData: ReminderData = {
      symptomName,
      reminderDate,
      reminderType,
      notes
    };
    
    // Save reminder to localStorage
    try {
      const existingReminders = JSON.parse(localStorage.getItem('symptom_reminders') || '[]');
      localStorage.setItem('symptom_reminders', JSON.stringify([...existingReminders, reminderData]));
    } catch (e) {
      console.error('Error saving reminder', e);
    }
    
    // Call onSave prop if provided
    if (onSave) {
      onSave(reminderData);
    }
    
    // Show confirmation message
    setConfirmationShown(true);
    setTimeout(() => setConfirmationShown(false), 3000);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell size={18} className="mr-2 text-blue-600" />
          Seguimiento de síntomas
        </h3>
        
        <div className="relative inline-block w-10 mr-2 align-middle select-none">
          <input 
            type="checkbox" 
            id="toggle-reminder" 
            className="sr-only"
            checked={reminderEnabled}
            onChange={() => setReminderEnabled(!reminderEnabled)}
          />
          <label 
            htmlFor="toggle-reminder" 
            className={`${reminderEnabled ? 'bg-blue-600' : 'bg-gray-300'} block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200`}
          >
            <span 
              className={`${reminderEnabled ? 'translate-x-4' : 'translate-x-0'} inline-block w-6 h-6 transform bg-white rounded-full shadow transition-transform duration-200 ease-in-out`}
            ></span>
          </label>
        </div>
      </div>
      
      {!reminderEnabled ? (
        <div className="text-center py-4 text-gray-500">
          <p>Activa recordatorios para hacer seguimiento de este síntoma en los próximos días.</p>
          <p className="text-sm mt-1">Esto te ayudará a monitorear tu condición y compartir información valiosa con tu médico.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="reminder-date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de recordatorio
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <Calendar size={16} />
              </span>
              <input
                type="date"
                id="reminder-date"
                value={formatDateForInput(reminderDate)}
                onChange={(e) => setReminderDate(new Date(e.target.value))}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Fecha sugerida basada en la severidad de tus síntomas.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de recordatorio
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReminderType('app')}
                className={`py-2 px-3 border text-sm rounded-md flex items-center justify-center ${
                  reminderType === 'app' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell size={16} className="mr-1" />
                App
              </button>
              <button
                onClick={() => setReminderType('email')}
                className={`py-2 px-3 border text-sm rounded-md flex items-center justify-center ${
                  reminderType === 'email' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Email
              </button>
              <button
                onClick={() => setReminderType('both')}
                className={`py-2 px-3 border text-sm rounded-md flex items-center justify-center ${
                  reminderType === 'both' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AlarmClock size={16} className="mr-1" />
                Ambos
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="reminder-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              id="reminder-notes"
              rows={2}
              placeholder="Añade notas o preguntas para revisar durante el seguimiento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleSaveReminder}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save size={16} className="mr-2" />
              Guardar recordatorio
            </button>
          </div>
          
          {confirmationShown && (
            <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
              <Check size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>Recordatorio guardado correctamente. Te notificaremos el {reminderDate.toLocaleDateString()} para revisar tu síntoma.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={12} className="mr-1" />
          El seguimiento regular de síntomas ayuda a mejorar el diagnóstico y tratamiento.
        </div>
      </div>
    </div>
  );
};

export default FollowUpReminder;