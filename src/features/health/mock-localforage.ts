/**
 * Mock implementation of localforage for environments 
 * where the actual library is not available
 */

// Mock storage
const mockStorage = new Map<string, any>();

// Mock localforage instance
const mockLocalForage = {
  getItem: async (key: string): Promise<any> => {
    console.log(`[Mock LocalForage] Getting item: ${key}`);
    return mockStorage.get(key) || null;
  },
  
  setItem: async (key: string, value: any): Promise<any> => {
    console.log(`[Mock LocalForage] Setting item: ${key}`);
    mockStorage.set(key, value);
    return value;
  },
  
  removeItem: async (key: string): Promise<void> => {
    console.log(`[Mock LocalForage] Removing item: ${key}`);
    mockStorage.delete(key);
  },
  
  clear: async (): Promise<void> => {
    console.log(`[Mock LocalForage] Clearing all items`);
    mockStorage.clear();
  },
  
  keys: async (): Promise<string[]> => {
    console.log(`[Mock LocalForage] Getting all keys`);
    return Array.from(mockStorage.keys());
  },
  
  length: async (): Promise<number> => {
    return mockStorage.size;
  },
  
  // Factory method to create instance
  createInstance: (config: any): any => {
    console.log(`[Mock LocalForage] Creating instance:`, config);
    // Return a new instance with the same methods
    return { ...mockLocalForage };
  }
};

export default mockLocalForage;
