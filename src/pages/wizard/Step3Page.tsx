import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../contexts/WizardContext';
import { useChat } from '../../core/hooks/useChat';

const Step3Page: React.FC = () => {
  const navigate = useNavigate();
  const { wizardData, setAcceptedDisclaimer, resetWizard } = useWizard();
  const { clearMessages, addMessage, setIsExpanded } = useChat();
  const [accepted, setAccepted] = useState<boolean>(wizardData.acceptedDisclaimer ?? false);

  const handleFinish = () => {
    if (!accepted) return;
    setAcceptedDisclaimer(accepted);
    // Seed chat with initial user summary and open chat
    clearMessages();
    const { age, sex, symptom } = wizardData;
    const summary = `Tengo ${age} años, sexo ${sex}. Mis síntomas: ${symptom}.`;
    addMessage(summary, 'user');
    setIsExpanded(true);
    // Reset wizard state
    resetWizard();
    // After onboarding, navigate to the AI chat page
    navigate('/ai-doctor');
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Paso 3: Términos y Condiciones</h1>
      <div className="mb-4 h-48 overflow-auto border p-4 rounded bg-white">
        <p className="text-sm text-gray-700">
          {/* Placeholder disclaimer text */}
          Al utilizar este servicio de orientación médica por IA, usted acepta que no sustituye una consulta médica profesional. En caso de emergencia, por favor acuda a un centro de salud.
        </p>
      </div>
      <div className="mb-6 flex items-center">
        <input
          id="accept"
          type="checkbox"
          checked={accepted}
          onChange={e => setAccepted(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="accept" className="text-gray-800">
          He leído y acepto los términos
        </label>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/wizard/step-2')}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800"
        >
          Atrás
        </button>
        <button
          onClick={handleFinish}
          disabled={!accepted}
          className={`px-4 py-2 rounded ${accepted ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default Step3Page;