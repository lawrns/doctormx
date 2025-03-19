import React, { useEffect, useState, useRef } from 'react';

interface Activity {
  id: string;
  type: 'booking' | 'review' | 'signup';
  user: {
    name: string;
    location: string;
  };
  doctor?: {
    name: string;
    specialty: string;
  };
  rating?: number;
  timestamp: Date;
}

const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visibleActivity, setVisibleActivity] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate mock activity data
  useEffect(() => {
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'booking',
        user: {
          name: 'Carlos M.',
          location: 'Ciudad de México',
        },
        doctor: {
          name: 'Dra. García',
          specialty: 'Dermatología',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        id: '2',
        type: 'review',
        user: {
          name: 'María L.',
          location: 'Guadalajara',
        },
        doctor: {
          name: 'Dr. Rodríguez',
          specialty: 'Pediatría',
        },
        rating: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 minutes ago
      },
      {
        id: '3',
        type: 'signup',
        user: {
          name: 'José R.',
          location: 'Monterrey',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 18), // 18 minutes ago
      },
      {
        id: '4',
        type: 'booking',
        user: {
          name: 'Ana P.',
          location: 'Puebla',
        },
        doctor: {
          name: 'Dr. López',
          specialty: 'Cardiología',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      },
      {
        id: '5',
        type: 'review',
        user: {
          name: 'Roberto S.',
          location: 'Cancún',
        },
        doctor: {
          name: 'Dra. Martínez',
          specialty: 'Ginecología',
        },
        rating: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 38), // 38 minutes ago
      },
      {
        id: '6',
        type: 'signup',
        user: {
          name: 'Laura F.',
          location: 'Tijuana',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      },
      {
        id: '7',
        type: 'booking',
        user: {
          name: 'Daniel O.',
          location: 'Mérida',
        },
        doctor: {
          name: 'Dra. Sánchez',
          specialty: 'Neurología',
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
      },
    ];

    setActivities(mockActivities);
    setVisibleActivity(0);
  }, []);

  // Cycle through activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setVisibleActivity((prev) => {
        if (prev === null || prev >= activities.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activities]);

  // Format timestamp as "X minutes ago"
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Justo ahora';
    } else if (diffInMinutes === 1) {
      return 'Hace 1 minuto';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 120) {
      return 'Hace 1 hora';
    } else {
      return `Hace ${Math.floor(diffInMinutes / 60)} horas`;
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'booking':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'review':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      case 'signup':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Get activity text
  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'booking':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> de {activity.user.location} agendó una cita con{' '}
            <span className="font-semibold">{activity.doctor?.name}</span>, {activity.doctor?.specialty}
          </>
        );
      case 'review':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> de {activity.user.location} calificó a{' '}
            <span className="font-semibold">{activity.doctor?.name}</span> con {activity.rating} estrellas
          </>
        );
      case 'signup':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> de {activity.user.location} se unió a Doctor.mx
          </>
        );
      default:
        return null;
    }
  };

  // Check if activities are loaded
  if (activities.length === 0 || visibleActivity === null) {
    return null;
  }

  const currentActivity = activities[visibleActivity];

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm" ref={containerRef}>
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100 animate-slide-in-up">
        <div className="flex items-start">
          {getActivityIcon(currentActivity.type)}
          <div className="ml-4 flex-1">
            <p className="text-sm text-gray-700">{getActivityText(currentActivity)}</p>
            <p className="text-xs text-gray-500 mt-1">{formatTimestamp(currentActivity.timestamp)}</p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 ml-2"
            aria-label="Close"
            onClick={() => {
              containerRef.current?.classList.add('animate-slide-out-down');
              setTimeout(() => {
                setVisibleActivity(null);
              }, 300);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;