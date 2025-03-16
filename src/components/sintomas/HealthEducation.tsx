import { useState } from 'react';
import { Book, ChevronRight, ChevronDown, ExternalLink, AlertTriangle } from 'lucide-react';
import { getConditionInfo, generalHealthInfo, type ConditionInfo } from '../../data/healthEducationData';
import ResourcesList from './health-education/ResourcesList';
import MedicalTermsList from './health-education/MedicalTermsList';
import ConditionOverview from './health-education/ConditionOverview';

interface HealthEducationProps {
  conditionId?: string;
  conditionName?: string;
  symptomId?: string;
  symptomName?: string;
  customContent?: {
    title: string;
    description: string;
    sections?: {
      title: string;
      content: string | React.ReactNode;
    }[];
    resources?: any[];
  };
}

const HealthEducation: React.FC<HealthEducationProps> = ({
  conditionId,
  conditionName,
  symptomId,
  symptomName,
  customContent
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'terms'>('overview');
  
  // Get data to display
  const getDisplayData = () => {
    if (customContent) {
      return customContent;
    }
    
    const conditionInfo = getConditionInfo(conditionId, symptomId);
    
    if (conditionInfo) {
      return {
        info: conditionInfo,
        title: conditionInfo.name,
        description: conditionInfo.description,
      };
    }
    
    // Default content if no specific condition is found
    return {
      title: conditionName || symptomName || generalHealthInfo.title,
      description: generalHealthInfo.description,
      sections: generalHealthInfo.sections.map(section => ({
        title: section.title,
        content: (
          <ul className="space-y-2">
            {section.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <ChevronRight size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      })),
      resources: generalHealthInfo.resources
    };
  };

  const displayData = getDisplayData();
  const conditionInfo = 'info' in displayData ? displayData.info as ConditionInfo : null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-blue-900">Información de Salud: {displayData.title}</h3>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recursos Educativos
          </button>
          {conditionInfo?.medicalTerms && conditionInfo.medicalTerms.length > 0 && (
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'terms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Glosario Médico
            </button>
          )}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <ConditionOverview 
            title={displayData.title}
            description={displayData.description}
            sections={displayData.sections || []}
            symptoms={conditionInfo?.symptoms}
            causes={conditionInfo?.causes}
            treatments={conditionInfo?.treatments}
            preventionTips={conditionInfo?.preventionTips}
          />
        )}
        
        {activeTab === 'resources' && (
          <ResourcesList 
            resources={conditionInfo?.resources || displayData.resources || []} 
          />
        )}
        
        {activeTab === 'terms' && conditionInfo?.medicalTerms && (
          <MedicalTermsList terms={conditionInfo.medicalTerms} />
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Aviso importante</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Esta información es de carácter educativo y no sustituye la atención médica profesional. 
                    Consulte siempre a un profesional de la salud para diagnóstico y tratamiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthEducation;