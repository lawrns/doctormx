/**
 * Health Sync Module for PWA
 * 
 * This module provides functionality for syncing health data
 * in a PWA context, managing offline data storage and syncing.
 */

import { HealthDataPointUnion, HealthMetricType } from './types';

// Try to import localforage, but fallback to mock if it fails
let localforage: any;

try {
  // Dynamic import to avoid build issues
  localforage = require('localforage');
} catch (e) {
  console.warn('LocalForage not available, using mock implementation');
  // Use a mock implementation when localforage isn't available
  localforage = require('./mock-localforage').default;
}

// Initialize localforage instance for health data
const healthStore = localforage.createInstance({
  name: 'doctormx-health',
  description: 'Health data for offline use'
});

// Store for pending health data uploads (when offline)
const healthSyncOutbox = localforage.createInstance({
  name: 'doctormx-health-sync',
  description: 'Pending health data syncs'
});

/**
 * Store health data locally for offline access
 */
export const storeHealthData = async (data: HealthDataPointUnion[]): Promise<void> => {
  try {
    // Group data by type
    const dataByType = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<HealthMetricType, HealthDataPointUnion[]>);
    
    // Store each type separately
    for (const [type, items] of Object.entries(dataByType)) {
      await healthStore.setItem(`health_${type}`, items);
    }
    
    // Store last updated timestamp
    await healthStore.setItem('health_last_updated', new Date().toISOString());
  } catch (error) {
    console.error('Failed to store health data locally:', error);
    throw error;
  }
};

/**
 * Retrieve health data from local storage
 */
export const getLocalHealthData = async (type?: HealthMetricType): Promise<HealthDataPointUnion[]> => {
  try {
    if (type) {
      // Get specific type
      return (await healthStore.getItem(`health_${type}`)) || [];
    } else {
      // Get all health data
      const allData: HealthDataPointUnion[] = [];
      const keys = await healthStore.keys();
      
      for (const key of keys) {
        if (key.startsWith('health_') && key !== 'health_last_updated') {
          const data = await healthStore.getItem(key);
          if (Array.isArray(data)) {
            allData.push(...data);
          }
        }
      }
      
      return allData;
    }
  } catch (error) {
    console.error('Failed to retrieve local health data:', error);
    return [];
  }
};

/**
 * Queue health data for sync when online
 */
export const queueHealthDataForSync = async (data: HealthDataPointUnion[]): Promise<void> => {
  try {
    // Get existing queue
    const queue = await healthSyncOutbox.getItem('health-sync-outbox') || [];
    
    // Add new data with unique IDs
    const dataWithIds = data.map(item => ({
      ...item,
      syncId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    // Update queue
    await healthSyncOutbox.setItem('health-sync-outbox', [...queue, ...dataWithIds]);
    
    // Trigger sync if service worker and SyncManager are available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-health-data');
    }
  } catch (error) {
    console.error('Failed to queue health data for sync:', error);
    throw error;
  }
};

/**
 * Check if there is pending health data to sync
 */
export const hasPendingHealthSync = async (): Promise<boolean> => {
  try {
    const queue = await healthSyncOutbox.getItem('health-sync-outbox') || [];
    return queue.length > 0;
  } catch (error) {
    console.error('Failed to check pending health sync:', error);
    return false;
  }
};

/**
 * Initialize IndexedDB for health data
 */
export const initHealthDataStorage = async (): Promise<void> => {
  try {
    // Check if we already have initialized
    const isInitialized = await healthStore.getItem('health_initialized');
    
    if (!isInitialized) {
      // Set initialized flag
      await healthStore.setItem('health_initialized', true);
      
      // Set empty arrays for each health data type
      for (const type of Object.values(HealthMetricType)) {
        await healthStore.setItem(`health_${type}`, []);
      }
      
      // Set initial last updated timestamp
      await healthStore.setItem('health_last_updated', new Date().toISOString());
      
      console.log('Health data storage initialized');
    }
  } catch (error) {
    console.error('Failed to initialize health data storage:', error);
    throw error;
  }
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await healthStore.getItem('health_last_updated');
  } catch (error) {
    console.error('Failed to get last sync time:', error);
    return null;
  }
};

/**
 * Clear all health data from local storage
 */
export const clearHealthData = async (): Promise<void> => {
  try {
    await healthStore.clear();
    console.log('Health data cleared');
  } catch (error) {
    console.error('Failed to clear health data:', error);
    throw error;
  }
};
