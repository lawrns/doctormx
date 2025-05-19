import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../contexts/WizardContext';

const Step1Page: React.FC = () => {
  const navigate = useNavigate();
  const { wizardData, setAge, setSex } = useWizard();
  const [localAge, setLocalAge] = useState<number | ''>(wizardData.age ?? '');
  const [localSex, setLocalSex] = useState<string>(wizardData.sex ?? '');

  const isValid = localAge !== '' && localSex !== '';

  const handleNext = () => {
    if (!isValid) return;
    setAge(Number(localAge));
    setSex(localSex as any);
    navigate('/wizard/step-2');
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Paso 1: Edad y Sexo</h1>
      <div className="mb-4">
        <label className="block mb-2">Edad</label>
        <input
          type="number"
          min={0}
          value={localAge}
          onChange={e => setLocalAge(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border p-2 rounded"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2">Sexo</label>
        <select
          value={localSex}
          onChange={e => setLocalSex(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecciona tu sexo</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro</option>
        </select>
      </div>
      <button
        onClick={handleNext}
        disabled={!isValid}
        className={`w-full py-2 rounded ${isValid ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Step1Page;