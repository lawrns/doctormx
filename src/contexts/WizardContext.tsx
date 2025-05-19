import React, { createContext, useContext, useState, ReactNode } from 'react';

// Data collected across the onboarding wizard steps
export interface WizardData {
  age?: number;
  sex?: 'male' | 'female' | 'other';
  symptom?: string;
  image?: File;
  acceptedDisclaimer?: boolean;
}

interface WizardContextProps {
  wizardData: WizardData;
  setAge: (age: number) => void;
  setSex: (sex: WizardData['sex']) => void;
  setSymptom: (symptom: string) => void;
  setImage: (image: File) => void;
  setAcceptedDisclaimer: (accepted: boolean) => void;
  resetWizard: () => void;
  isComplete: boolean;
}

const WizardContext = createContext<WizardContextProps | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [wizardData, setWizardData] = useState<WizardData>({});
  const setAge = (age: number) => setWizardData(data => ({ ...data, age }));
  const setSex = (sex: WizardData['sex']) => setWizardData(data => ({ ...data, sex }));
  const setSymptom = (symptom: string) => setWizardData(data => ({ ...data, symptom }));
  const setImage = (image: File) => setWizardData(data => ({ ...data, image }));
  const setAcceptedDisclaimer = (accepted: boolean) => setWizardData(data => ({ ...data, acceptedDisclaimer: accepted }));
  const resetWizard = () => setWizardData({});
  
  const isComplete =
    wizardData.age !== undefined &&
    wizardData.sex !== undefined &&
    (wizardData.symptom !== undefined || wizardData.image !== undefined) &&
    wizardData.acceptedDisclaimer === true;

  return (
    <WizardContext.Provider
      value={{ wizardData, setAge, setSex, setSymptom, setImage, setAcceptedDisclaimer, resetWizard, isComplete }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = (): WizardContextProps => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};