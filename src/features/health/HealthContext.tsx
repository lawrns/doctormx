import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  HealthConnectionStatus, 
  HealthMetricType, 
  HealthDataPointUnion,
  HealthConnectionSettings,
  DailyHealthSummary,
  HealthUserProfile
} from './types';
import { formatISO, subDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext exists

// Define the context shape
interface HealthContextType {
  connectionStatus: HealthConnectionStatus;
  isLoading: boolean;
  errorMessage: string | null;
  healthData: {
    recent: HealthDataPointUnion[];
    dailySummaries: DailyHealthSummary[];
  };
  userProfile: HealthUserProfile | null;
  connectionSettings: HealthConnectionSettings | null;
  // Methods
  connectToAppleHealth: () => Promise<void>;
  disconnectFromAppleHealth: () => Promise<void>;
  syncHealthData: () => Promise<void>;
  updateConnectionSettings: (settings: Partial<HealthConnectionSettings>) => Promise<void>;
}

// Create the context with default values
const HealthContext = createContext<HealthContextType>({
  connectionStatus: HealthConnectionStatus.NOT_CONNECTED,
  isLoading: false,
  errorMessage: null,
  healthData: {
    recent: [],
    dailySummaries: [],
  },
  userProfile: null,
  connectionSettings: null,
  // Default methods that will be replaced by the provider
  connectToAppleHealth: async () => {},
  disconnectFromAppleHealth: async () => {},
  syncHealthData: async () => {},
  updateConnectionSettings: async () => {},
});

// Hook for using the health context
export const useHealth = () => useContext(HealthContext);

interface HealthProviderProps {
  children: ReactNode;
}

export const HealthProvider: React.FC<HealthProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<HealthConnectionStatus>(
    HealthConnectionStatus.NOT_CONNECTED
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<{
    recent: HealthDataPointUnion[];
    dailySummaries: DailyHealthSummary[];
  }>({
    recent: [],
    dailySummaries: [],
  });
  const [userProfile, setUserProfile] = useState<HealthUserProfile | null>(null);
  const [connectionSettings, setConnectionSettings] = useState<HealthConnectionSettings | null>(null);

  // Initialization effect
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load health connection status
      fetchHealthConnectionStatus();
    }
  }, [isAuthenticated, user]);

  // Fetch initial connection status
  const fetchHealthConnectionStatus = async () => {
    setIsLoading(true);
    try {
      // This would be an API call to your backend
      // For now, we'll simulate a response
      const response = await fetch('/api/health/status');
      const data = await response.json();
      
      setConnectionStatus(data.status);
      if (data.status === HealthConnectionStatus.CONNECTED) {
        setConnectionSettings(data.settings);
        await fetchHealthData();
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Failed to fetch health connection status:', error);
      setErrorMessage('Failed to retrieve health connection status');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch health data
  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      // This would be an API call to your backend
      // For now, we'll simulate a response
      
      // In a real implementation, this would fetch from your backend API
      // which would retrieve data synced from Apple HealthKit
      const recentResponse = await fetch('/api/health/recent');
      const recentData = await recentResponse.json();
      
      const summaryResponse = await fetch('/api/health/summary');
      const summaryData = await summaryResponse.json();
      
      setHealthData({
        recent: recentData,
        dailySummaries: summaryData,
      });
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      setErrorMessage('Failed to retrieve health data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user health profile
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // This would be an API call to your backend
      const response = await fetch('/api/health/profile');
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to fetch health profile:', error);
      setErrorMessage('Failed to retrieve health profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Apple Health - this initiates the connection process
  const connectToAppleHealth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setConnectionStatus(HealthConnectionStatus.CONNECTING);
      
      // In a real implementation, this would:
      // 1. Call your backend to generate a connection token
      // 2. Return a deep link URL or QR code to open your iOS app
      // 3. The iOS app would then handle the HealthKit permission request
      // 4. After successful connection, the iOS app would notify the backend
      
      // For now, we'll simulate this process
      const response = await fetch('/api/health/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          metrics: [
            HealthMetricType.HEART_RATE,
            HealthMetricType.STEPS,
            HealthMetricType.SLEEP,
            HealthMetricType.ACTIVE_ENERGY,
            HealthMetricType.BLOOD_OXYGEN,
          ],
        }),
      });
      
      const data = await response.json();
      
      // In a real implementation, you would show the QR code or deep link here
      // For this example, we'll just simulate a successful connection
      
      // Simulate the connection process completing after 3 seconds
      setTimeout(() => {
        setConnectionStatus(HealthConnectionStatus.CONNECTED);
        setConnectionSettings({
          status: HealthConnectionStatus.CONNECTED,
          lastSyncTime: formatISO(new Date()),
          connectedDevice: 'iPhone',
          sharedMetrics: [
            HealthMetricType.HEART_RATE,
            HealthMetricType.STEPS,
            HealthMetricType.SLEEP,
            HealthMetricType.ACTIVE_ENERGY,
            HealthMetricType.BLOOD_OXYGEN,
          ],
          syncFrequency: '4hours',
          autoSync: true,
        });
        fetchHealthData();
        fetchUserProfile();
        setIsLoading(false);
      }, 3000);
      
      return data;
    } catch (error) {
      console.error('Failed to connect to Apple Health:', error);
      setErrorMessage('Failed to connect to Apple Health');
      setConnectionStatus(HealthConnectionStatus.ERROR);
      setIsLoading(false);
    }
  };

  // Disconnect from Apple Health
  const disconnectFromAppleHealth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // This would be an API call to your backend
      await fetch('/api/health/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });
      
      setConnectionStatus(HealthConnectionStatus.NOT_CONNECTED);
      setConnectionSettings(null);
      setHealthData({
        recent: [],
        dailySummaries: [],
      });
    } catch (error) {
      console.error('Failed to disconnect from Apple Health:', error);
      setErrorMessage('Failed to disconnect from Apple Health');
    } finally {
      setIsLoading(false);
    }
  };

  // Manually sync health data
  const syncHealthData = async () => {
    if (connectionStatus !== HealthConnectionStatus.CONNECTED) {
      setErrorMessage('Not connected to Apple Health');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // This would be an API call to your backend
      await fetch('/api/health/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });
      
      // Update the connection settings with the latest sync time
      if (connectionSettings) {
        setConnectionSettings({
          ...connectionSettings,
          lastSyncTime: formatISO(new Date()),
        });
      }
      
      // Fetch the updated health data
      await fetchHealthData();
    } catch (error) {
      console.error('Failed to sync health data:', error);
      setErrorMessage('Failed to sync health data');
    } finally {
      setIsLoading(false);
    }
  };

  // Update connection settings
  const updateConnectionSettings = async (settings: Partial<HealthConnectionSettings>) => {
    if (!connectionSettings) {
      setErrorMessage('Not connected to Apple Health');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // This would be an API call to your backend
      await fetch('/api/health/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          settings,
        }),
      });
      
      // Update the local connection settings
      setConnectionSettings({
        ...connectionSettings,
        ...settings,
      });
    } catch (error) {
      console.error('Failed to update connection settings:', error);
      setErrorMessage('Failed to update connection settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value: HealthContextType = {
    connectionStatus,
    isLoading,
    errorMessage,
    healthData,
    userProfile,
    connectionSettings,
    connectToAppleHealth,
    disconnectFromAppleHealth,
    syncHealthData,
    updateConnectionSettings,
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};

export default HealthContext;
