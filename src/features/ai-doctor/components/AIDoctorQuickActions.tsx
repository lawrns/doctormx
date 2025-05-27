import React, { memo } from 'react';
import { User } from 'lucide-react';

interface AIDoctorQuickActionsProps {
  familyMember: string;
  showFamilySetup: boolean;
  setShowFamilySetup: (show: boolean) => void;
  setFamilyMember: (member: string) => void;
  setInput: (input: string) => void;
  onSendMessage: (message?: string) => void;
}

const MEXICAN_FAMILY_OPTIONS = [
  { value: 'myself', label: 'Para mí' },
  { value: 'spouse', label: 'Para mi esposo/a' },
  { value: 'child', label: 'Para mi hijo/a' },
  { value: 'parent', label: 'Para mis padres' },
  { value: 'family', label: 'Para otro familiar' }
];

const MEXICAN_QUICK_SYMPTOMS = [
  { text: 'Tengo diabetes y necesito orientación', icon: '🩺' },
  { text: 'Dolor de cabeza fuerte', icon: '🤕' },
  { text: 'Fiebre y malestar general', icon: '🌡️' },
  { text: 'Presión arterial alta', icon: '❤️' },
  { text: 'Dolor de estómago', icon: '😷' },
  { text: 'Problemas respiratorios', icon: '🤧' }
];

function AIDoctorQuickActions({
  familyMember,
  showFamilySetup,
  setShowFamilySetup,
  setFamilyMember,
  setInput,
  onSendMessage
}: AIDoctorQuickActionsProps) {
  const handleSymptomClick = (symptom: { text: string; icon: string }) => {
    const familyContext = familyMember === 'myself' 
      ? '' 
      : ` (${MEXICAN_FAMILY_OPTIONS.find(o => o.value === familyMember)?.label})`;
    // Send message immediately without setting input
    onSendMessage(symptom.text + familyContext);
  };

  const handleFamilyMemberSelect = (value: string) => {
    setFamilyMember(value);
    setShowFamilySetup(false);
  };

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      {/* Family Member Selector */}
      {showFamilySetup && (
        <div className="bg-[#D0F0EF] border border-[#006D77] rounded-lg p-4 mb-4">
          <h4 className="font-medium text-[#006D77] mb-3">¿Para quién es la consulta?</h4>
          <div className="flex flex-wrap gap-2">
            {MEXICAN_FAMILY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFamilyMemberSelect(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  familyMember === option.value
                    ? 'bg-[#006D77] text-white'
                    : 'bg-white text-[#006D77] hover:bg-[#006D77]/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Quick Mexican Symptoms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-700 text-sm">Consultas rápidas:</h4>
          <button
            onClick={() => setShowFamilySetup(!showFamilySetup)}
            className="text-[#006D77] text-sm font-medium flex items-center hover:underline"
          >
            <User className="w-4 h-4 mr-1" />
            {familyMember === 'myself' 
              ? 'Para mí' 
              : MEXICAN_FAMILY_OPTIONS.find(o => o.value === familyMember)?.label}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {MEXICAN_QUICK_SYMPTOMS.map((symptom, index) => (
            <button
              key={index}
              onClick={() => handleSymptomClick(symptom)}
              className="bg-white border border-[#006D77]/30 hover:border-[#006D77] hover:bg-[#D0F0EF]/30 rounded-lg px-3 py-2 text-sm transition-all flex items-center space-x-2"
            >
              <span>{symptom.icon}</span>
              <span className="text-[#006D77]">{symptom.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(AIDoctorQuickActions);