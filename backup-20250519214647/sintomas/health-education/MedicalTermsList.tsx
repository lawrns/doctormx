import React from 'react';
import { MedicalTerm } from '../../../data/healthEducationData';

interface MedicalTermsListProps {
  condition?: string;
  terms?: MedicalTerm[];
}

const MedicalTermsList: React.FC<MedicalTermsListProps> = ({ condition, terms = [] }) => {
  if (!terms || terms.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <p className="text-gray-700 mb-4">
        Este glosario explica los términos médicos relacionados con esta condición para ayudarle a comprender mejor su diagnóstico y tratamiento.
      </p>
      
      <div className="space-y-3">
        {terms.map((item, index) => (
          <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-blue-900 font-medium mb-1">{item.term}</h4>
            <p className="text-gray-700 text-sm">{item.definition}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          Estos términos son proporcionados con fines educativos. Si tiene dudas sobre la terminología médica, consulte con su profesional de la salud.
        </p>
      </div>
    </div>
  );
};

export default MedicalTermsList;