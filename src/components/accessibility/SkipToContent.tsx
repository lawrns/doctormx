import React from 'react';

interface SkipToContentProps {
  contentId?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ contentId = 'main-content' }) => {
  return (
    <a 
      href={`#${contentId}`} 
      className="skip-to-content"
    >
      Saltar al contenido principal
    </a>
  );
};

export default SkipToContent;