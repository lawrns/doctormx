import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../contexts/WizardContext';

const Step2Page: React.FC = () => {
  const navigate = useNavigate();
  const { wizardData, setSymptom, setImage } = useWizard();
  const [symptomInput, setSymptomInput] = useState<string>(wizardData.symptom ?? '');
  const [fileInput, setFileInput] = useState<File | null>(wizardData.image ?? null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileInput(file);
  };

  const isValid = symptomInput.trim() !== '' || fileInput !== null;

  const handleNext = () => {
    if (!isValid) return;
    setSymptom(symptomInput.trim());
    if (fileInput) setImage(fileInput);
    navigate('/wizard/step-3');
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Paso 2: Síntomas o Imagen</h1>
      <div className="mb-4">
        <label className="block mb-2">Describe tus síntomas</label>
        <textarea
          value={symptomInput}
          onChange={e => setSymptomInput(e.target.value)}
          className="w-full border p-2 rounded h-24"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2">O sube una foto</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {fileInput && (
          <p className="mt-2 text-sm text-gray-600">Seleccionado: {fileInput.name}</p>
        )}
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/wizard/step-1')}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800"
        >
          Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`px-4 py-2 rounded ${isValid ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Step2Page;