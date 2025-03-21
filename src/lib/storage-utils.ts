/**
 * Utility functions for managing local storage safely
 * Helps prevent auth issues caused by corrupted local storage
 */

interface StorageOptions {
  namespace?: string;
  expiresIn?: number; // in seconds
}

// Set item in local storage with optional expiration
export const setStorageItem = (key: string, value: any, options: StorageOptions = {}) => {
  try {
    const { namespace, expiresIn } = options;
    const fullKey = namespace ? `${namespace}:${key}` : key;
    
    // If value is an object, stringify it
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Add expiration if specified
    const item = expiresIn 
      ? { value: valueToStore, expires: Date.now() + (expiresIn * 1000) }
      : { value: valueToStore };
    
    localStorage.setItem(fullKey, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('[Storage] Error setting item:', error);
    return false;
  }
};

// Get item from local storage, checking for expiration
export const getStorageItem = (key: string, options: StorageOptions = {}) => {
  try {
    const { namespace } = options;
    const fullKey = namespace ? `${namespace}:${key}` : key;
    
    const storedItem = localStorage.getItem(fullKey);
    if (!storedItem) return null;
    
    // Parse the stored item
    const parsedItem = JSON.parse(storedItem);
    
    // Check if the item has expired
    if (parsedItem.expires && parsedItem.expires < Date.now()) {
      localStorage.removeItem(fullKey);
      return null;
    }
    
    // If the value was originally an object (and not a string that was JSON.stringified)
    // we need to parse it again
    try {
      const value = JSON.parse(parsedItem.value);
      return value;
    } catch (e) {
      // If it wasn't a JSON string, just return the value
      return parsedItem.value;
    }
  } catch (error) {
    console.error('[Storage] Error getting item:', error);
    return null;
  }
};

// Remove item from local storage
export const removeStorageItem = (key: string, options: StorageOptions = {}) => {
  try {
    const { namespace } = options;
    const fullKey = namespace ? `${namespace}:${key}` : key;
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.error('[Storage] Error removing item:', error);
    return false;
  }
};

// Clear all items with a specific namespace
export const clearStorageNamespace = (namespace: string) => {
  try {
    const keysToRemove = [];
    
    // Find all keys with the namespace
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${namespace}:`)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('[Storage] Error clearing namespace:', error);
    return false;
  }
};

// Check if local storage for a specific app namespace is corrupted
export const isStorageCorrupted = (namespace: string) => {
  try {
    // Try to set and get a test item
    const testKey = `${namespace}:__test__`;
    const testValue = `test-${Date.now()}`;
    
    localStorage.setItem(testKey, testValue);
    const retrievedValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    return retrievedValue !== testValue;
  } catch (error) {
    console.error('[Storage] Storage access error:', error);
    return true; // If we can't access storage, consider it corrupted
  }
};

// Fix corrupted storage by clearing problematic items
export const repairStorage = (namespace: string) => {
  try {
    // If storage is corrupted, clear everything with this namespace
    if (isStorageCorrupted(namespace)) {
      clearStorageNamespace(namespace);
      
      // Also clear any Supabase auth related items to ensure clean auth state
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('doctor')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Storage] Error repairing storage:', error);
    return false;
  }
};

// Export a function to fix Supabase auth storage specifically
export const repairSupabaseAuthStorage = () => {
  try {
    // Clear all Supabase auth related items to force re-authentication
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase.auth') || 
        key.includes('doctormx-auth')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return keysToRemove.length > 0;
  } catch (error) {
    console.error('[Storage] Error repairing Supabase auth storage:', error);
    return false;
  }
};