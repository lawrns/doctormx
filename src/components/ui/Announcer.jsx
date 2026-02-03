import React, { useEffect, useState } from 'react';

const Announcer = ({ message, priority = 'polite' }) => {
  const [announcement, setAnnouncement] = useState('');

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
export const useAnnouncer = () => {
  const [message, setMessage] = useState('');

  const announce = (text, priority = 'polite') => {
    setMessage(text);
  };

  return {
    announce,
    Announcer: () => <Announcer message={message} priority="polite" />
  };
};

export default Announcer;

