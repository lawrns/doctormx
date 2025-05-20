import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ConditionOverviewProps {
  title: string;
  description: string;
  sections?: {
    title: string;
    content: string | React.ReactNode;
  }[];
  symptoms?: string[];
  causes?: string[];
  treatments?: string[];
  preventionTips?: string[];
}

const ConditionOverview: React.FC<ConditionOverviewProps> = ({
  title,
  description,
  sections = [],
  symptoms = [],
  causes = [],
  treatments = [],
  preventionTips = []
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  // Generate default sections from condition data if not provided
  const allSections = sections.length > 0 ? sections : [
    symptoms.length > 0 ? {
      title: 'Síntomas',
      content: (
        <ul className="space-y-2">
          {symptoms.map((symptom, index) => (
            <li key={index} className="flex items-start">
              <ChevronRight size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>{symptom}</span>
            </li>
          ))}
        </ul>
      )
    } : null,
    causes.length > 0 ? {
      title: 'Causas',
      content: (
        <ul className="space-y-2">
          {causes.map((cause, index) => (
            <li key={index} className="flex items-start">
              <ChevronRight size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>{cause}</span>
            </li>
          ))}
        </ul>
      )
    } : null,
    treatments.length > 0 ? {
      title: 'Tratamientos',
      content: (
        <ul className="space-y-2">
          {treatments.map((treatment, index) => (
            <li key={index} className="flex items-start">
              <ChevronRight size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>{treatment}</span>
            </li>
          ))}
        </ul>
      )
    } : null,
    preventionTips.length > 0 ? {
      title: 'Prevención',
      content: (
        <ul className="space-y-2">
          {preventionTips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <ChevronRight size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )
    } : null,
  ].filter(Boolean) as {title: string, content: string | React.ReactNode}[];

  return (
    <div className="space-y-6">
      <p className="text-gray-700 leading-relaxed">{description}</p>
      
      {allSections.map((section, index) => (
        <div key={index} className="mt-6">
          <button
            onClick={() => toggleSection(`section-${index}`)}
            className="flex justify-between items-center w-full text-left border-b border-gray-200 pb-2"
          >
            <h4 className="text-lg font-medium text-gray-900">{section.title}</h4>
            {expandedSections.includes(`section-${index}`) ? (
              <ChevronDown size={20} className="text-gray-500" />
            ) : (
              <ChevronRight size={20} className="text-gray-500" />
            )}
          </button>
          
          {expandedSections.includes(`section-${index}`) && (
            <div className="pt-4 pb-2">
              {typeof section.content === 'string' ? (
                <p className="text-gray-700">{section.content}</p>
              ) : (
                section.content
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConditionOverview;