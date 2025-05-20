import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, AlertCircle } from 'lucide-react';
import { Button, Modal, Textarea } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface DoctorActionButtonsProps {
  doctorId: string;
  supportsTelehealth?: boolean;
  className?: string;
}

const DoctorActionButtons: React.FC<DoctorActionButtonsProps> = ({ 
  doctorId, 
  supportsTelehealth = true,
  className = '' 
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for modals
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // State for follow-up form
  const [followUpData, setFollowUpData] = useState({
    date: '',
    time: '',
    type: 'telemedicine' as 'in_person' | 'telemedicine',
    notes: ''
  });
  
  // State for consultation form
  const [consultationData, setConsultationData] = useState({
    symptoms: '',
    notes: ''
  });
  
  // Loading states
  const [consultLoading, setConsultLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  
  // Handle login check
  const handleActionClick = (action: 'consult' | 'followUp') => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (action === 'consult') {
      setShowConsultModal(true);
    } else {
      setShowFollowUpModal(true);
    }
  };
  
  // Handle teleconsultation start
  const handleStartConsultation = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setConsultLoading(true);
      
      // Check if doctor is available for teleconsultation
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id, telemedicine_available')
        .eq('id', doctorId)
        .single();
      
      if (doctorError) throw doctorError;
      
      if (!doctor.telemedicine_available) {
        throw new Error('Este médico no está disponible para telemedicina');
      }
      
      // Create a unique meeting ID
      const meetingId = Math.random().toString(36).substring(2, 7) + 
                        Math.random().toString(36).substring(2, 7);
      
      // Create a consultation record
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          doctor_id: doctorId,
          patient_id: user.id,
          status: 'pending',
          type: 'telemedicine',
          meeting_id: meetingId,
          notes: consultationData.notes || '',
          symptoms: consultationData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (consultationError) throw consultationError;
      
      // Generate a meeting URL
      const meetingUrl = `/telemedicina/consulta/${meetingId}?doctorId=${doctorId}`;
      
      // Close modal and navigate to the consultation
      setShowConsultModal(false);
      navigate(meetingUrl);
    } catch (error) {
      console.error('Error starting consultation:', error);
      alert('No se pudo iniciar la consulta. Por favor intente nuevamente.');
    } finally {
      setConsultLoading(false);
    }
  };
  
  // Handle follow-up scheduling
  const handleScheduleFollowUp = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setFollowUpLoading(true);
      
      // Format the appointment date and time
      const appointmentDateTime = new Date(`${followUpData.date}T${followUpData.time}`);
      const endDateTime = new Date(appointmentDateTime.getTime() + 30 * 60 * 1000); // 30 minutes later
      
      // Create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorId,
          patient_id: user.id,
          title: `Cita de seguimiento - ${followUpData.type === 'in_person' ? 'Presencial' : 'Telemedicina'}`,
          description: followUpData.notes || 'Cita de seguimiento',
          start_time: appointmentDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: 'scheduled',
          appointment_type: 'follow_up',
          location_type: followUpData.type,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (appointmentError) throw appointmentError;
      
      // Close modal and show success
      setShowFollowUpModal(false);
      alert('Cita de seguimiento agendada con éxito.');
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      alert('No se pudo agendar la cita de seguimiento. Por favor intente nuevamente.');
    } finally {
      setFollowUpLoading(false);
    }
  };
  
  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {supportsTelehealth && (
        <Button
          variant="primary"
          icon={<Video size={18} />}
          onClick={() => handleActionClick('consult')}
          className="w-full justify-center"
        >
          Iniciar consulta ahora
        </Button>
      )}
      
      <Button
        variant="outline"
        icon={<Calendar size={18} />}
        onClick={() => handleActionClick('followUp')}
        className="w-full justify-center"
      >
        Agendar seguimiento
      </Button>
      
      {/* Login Prompt Modal */}
      <Modal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Iniciar sesión requerido"
      >
        <div className="p-4">
          <div className="flex items-start mb-4">
            <AlertCircle className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-gray-600">
              Para acceder a este servicio, necesitas iniciar sesión o crear una cuenta.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowLoginPrompt(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowLoginPrompt(false);
                navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
              }}
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Teleconsultation Modal */}
      <Modal
        isOpen={showConsultModal}
        onClose={() => !consultLoading && setShowConsultModal(false)}
        title="Iniciar consulta virtual"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Estás a punto de iniciar una consulta virtual con este médico. Por favor, proporciona la siguiente información:
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                Síntomas (separados por coma)
              </label>
              <Textarea
                id="symptoms"
                value={consultationData.symptoms}
                onChange={(e) => setConsultationData(prev => ({ ...prev, symptoms: e.target.value }))}
                placeholder="Ej: dolor de cabeza, fiebre, tos"
                className="w-full"
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <Textarea
                id="notes"
                value={consultationData.notes}
                onChange={(e) => setConsultationData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Información adicional sobre tu condición"
                className="w-full"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConsultModal(false)}
              disabled={consultLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleStartConsultation}
              loading={consultLoading}
            >
              Iniciar consulta
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Follow-up Modal */}
      <Modal
        isOpen={showFollowUpModal}
        onClose={() => !followUpLoading && setShowFollowUpModal(false)}
        title="Agendar cita de seguimiento"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Agenda una cita de seguimiento con este médico.
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de cita
              </label>
              <div className="flex space-x-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="appointmentType"
                    value="in_person"
                    checked={followUpData.type === 'in_person'}
                    onChange={() => setFollowUpData(prev => ({ ...prev, type: 'in_person' }))}
                  />
                  <span className="ml-2">Presencial</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="appointmentType"
                    value="telemedicine"
                    checked={followUpData.type === 'telemedicine'}
                    onChange={() => setFollowUpData(prev => ({ ...prev, type: 'telemedicine' }))}
                  />
                  <span className="ml-2">Telemedicina</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  id="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={followUpData.date}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  id="time"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={followUpData.time}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="followUpNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <Textarea
                id="followUpNotes"
                value={followUpData.notes}
                onChange={(e) => setFollowUpData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Razón de la cita, síntomas, etc."
                className="w-full"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFollowUpModal(false)}
              disabled={followUpLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleScheduleFollowUp}
              loading={followUpLoading}
              disabled={!followUpData.date || !followUpData.time}
            >
              Agendar cita
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorActionButtons;