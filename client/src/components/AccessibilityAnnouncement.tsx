import { useEffect, useState } from 'react';

interface AccessibilityAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export function AccessibilityAnnouncement({ 
  message, 
  priority = 'polite', 
  delay = 100 
}: AccessibilityAnnouncementProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      // Clear previous announcement
      setAnnouncement('');
      
      // Set new announcement after a brief delay to ensure screen readers pick it up
      const timer = setTimeout(() => {
        setAnnouncement(message);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [message, delay]);

  if (!announcement) return null;

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcement}
    </div>
  );
}

// Hook for managing announcements
export function useAccessibilityAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first
    setTimeout(() => setAnnouncement(message), 100);
  };

  const clear = () => setAnnouncement('');

  return { announcement, announce, clear };
}