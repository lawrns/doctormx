import React, { useEffect, useState, type ReactNode } from 'react';

interface AnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

interface UseAnnouncerReturn {
  announce: (text: string, priority?: 'polite' | 'assertive') => void;
  Announcer: React.FC;
}

const Announcer: React.FC<AnnouncerProps> = ({ message, priority = 'polite' }) => {
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      
      // Clear the announcement after a short delay
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

// Hook for managing announcements
export const useAnnouncer = (): UseAnnouncerReturn => {
  const [message, setMessage] = useState<string>('');

  const announce = (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    setMessage(text);
  };

  return {
    announce,
    Announcer: () => <Announcer message={message} priority="polite" />
  };
};

export default Announcer;
