import React, { useState, ReactNode, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  type?: 'bordered' | 'pills' | 'underlined';
  className?: string;
  animated?: boolean;
}

/**
 * Tabs component for organizing content into multiple panels
 */
const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  type = 'underlined',
  className = '',
  animated = true,
}) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Find the first non-disabled tab if defaultTab is not specified or is disabled
    if (!defaultTab || tabs.find(tab => tab.id === defaultTab)?.disabled) {
      const firstEnabledTab = tabs.find(tab => !tab.disabled);
      return firstEnabledTab ? firstEnabledTab.id : tabs[0]?.id;
    }
    return defaultTab;
  });

  useEffect(() => {
    if (defaultTab && !tabs.find(tab => tab.id === defaultTab)?.disabled) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, tabs]);

  const handleTabClick = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return;
    
    setActiveTab(tabId);
    if (onChange) onChange(tabId);
  };

  // Tab styling based on type
  const getTabStyle = (tabId: string, disabled: boolean = false) => {
    const isActive = activeTab === tabId;
    
    const baseClasses = "px-4 py-2 font-medium text-sm focus:outline-none transition-colors whitespace-nowrap flex items-center";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
    
    switch (type) {
      case 'bordered':
        return `${baseClasses} ${disabledClasses} rounded-t-lg ${
          isActive
            ? 'border-t border-l border-r border-gray-300 bg-white text-gray-900'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`;
        
      case 'pills':
        return `${baseClasses} ${disabledClasses} rounded-full ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`;
        
      case 'underlined':
      default:
        return `${baseClasses} ${disabledClasses} border-b-2 ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`;
    }
  };

  // Content animation classes
  const contentClasses = animated
    ? 'transition-opacity duration-200 ease-in-out'
    : '';

  return (
    <div className={`w-full ${className}`}>
      {/* Tab navigation */}
      <nav className={`flex overflow-x-auto ${type === 'underlined' ? 'border-b border-gray-200' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={getTabStyle(tab.id, tab.disabled)}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            role="tab"
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
      
      {/* Tab content */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tab-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            className={`${activeTab === tab.id ? 'block' : 'hidden'} ${contentClasses}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;