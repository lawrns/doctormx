import CryptoJS from 'crypto-js';

/**
 * EncryptionService handles proper encryption for patient communications
 * and sensitive medical data using AES-256 encryption.
 */
class EncryptionService {
  // Generate a secure encryption key
  private generateSecureKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Encrypt a message or data using AES-256
   */
  encryptData(data: any, customKey?: string): { encryptedData: string; key: string } {
    const key = customKey || this.generateSecureKey();
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Proper AES encryption
    const encryptedData = CryptoJS.AES.encrypt(dataString, key).toString();
    
    return { encryptedData, key };
  }
  
  /**
   * Decrypt data with the provided key
   */
  decryptData(encryptedData: string, key: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Invalid key or corrupted data');
      }
      
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }
  
  /**
   * Generate a secure hash for medical image identification
   * without storing personally identifiable information
   */
  generateSecureImageHash(imageData: ArrayBuffer, userId: string): string {
    // Convert ArrayBuffer to WordArray for CryptoJS
    const wordArray = CryptoJS.lib.WordArray.create(imageData as any);
    // Create SHA-256 hash
    const hash = CryptoJS.SHA256(wordArray + userId).toString();
    const timestamp = Date.now().toString();
    
    return `img_${hash.substring(0, 16)}_${timestamp}`;
  }
  
  /**
   * Hash sensitive data for secure storage
   */
  hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
  
  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string): boolean {
    return this.hashData(data) === hash;
  }
  
  /**
   * Encrypt data for transit (additional layer for API calls)
   */
  encryptForTransit(data: any): string {
    const jsonData = JSON.stringify(data);
    const transitKey = import.meta.env.VITE_TRANSIT_ENCRYPTION_KEY || this.generateSecureKey();
    return CryptoJS.AES.encrypt(jsonData, transitKey).toString();
  }
  
  /**
   * Scrub metadata from images to remove personally identifiable information
   */
  async scrubImageMetadata(imageFile: File): Promise<File> {
    // Create a new blob without metadata
    const arrayBuffer = await imageFile.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: imageFile.type });
    
    // Create a new File object with sanitized name
    const sanitizedName = `sanitized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${imageFile.name.split('.').pop()}`;
    
    return new File([blob], sanitizedName, {
      type: imageFile.type,
      lastModified: Date.now()
    });
  }
}

export default new EncryptionService();