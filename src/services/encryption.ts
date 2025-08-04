import { supabase } from './supabase';

/**
 * Credential Encryption Service
 * Handles encryption and decryption of sensitive store connection credentials
 */
export class CredentialEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 16;

  /**
   * Encrypt sensitive data before storing in database
   */
  static async encrypt(data: any): Promise<string> {
    try {
      // Generate a random encryption key (in production, this should be stored securely)
      const encryptionKey = await this.generateEncryptionKey();
      
      // Convert data to string
      const dataString = JSON.stringify(data);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // Import the key
      const key = await crypto.subtle.importKey(
        'raw',
        encryptionKey,
        { name: this.ALGORITHM },
        false,
        ['encrypt']
      );
      
      // Encrypt the data
      const encodedData = new TextEncoder().encode(dataString);
      const encryptedData = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        encodedData
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedData.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedData), iv.length);
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  /**
   * Decrypt sensitive data from database
   */
  static async decrypt(encryptedData: string): Promise<any> {
    try {
      // Convert from base64
      const encryptedBytes = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract IV and encrypted data
      const iv = encryptedBytes.slice(0, this.IV_LENGTH);
      const data = encryptedBytes.slice(this.IV_LENGTH);
      
      // Generate the same encryption key
      const encryptionKey = await this.generateEncryptionKey();
      
      // Import the key
      const key = await crypto.subtle.importKey(
        'raw',
        encryptionKey,
        { name: this.ALGORITHM },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        data
      );
      
      // Convert back to string and parse
      const decryptedString = new TextDecoder().decode(decryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt credentials');
    }
  }

  /**
   * Generate encryption key (in production, use environment variables)
   */
  private static async generateEncryptionKey(): Promise<ArrayBuffer> {
    // In production, this should be a secure key from environment variables
    const keyString = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-here';
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyString);
    
    // Use PBKDF2 to derive a proper key
    const salt = encoder.encode('store-integration-salt');
    return await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      await crypto.subtle.importKey('raw', keyData, 'PBKDF2', false, ['deriveBits']),
      this.KEY_LENGTH
    );
  }

  /**
   * Validate if encrypted data can be decrypted
   */
  static async validateEncryptedData(encryptedData: string): Promise<boolean> {
    try {
      await this.decrypt(encryptedData);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Simple encryption for development/testing (less secure but easier to implement)
 */
export class SimpleEncryption {
  private static readonly SECRET_KEY = 'store-integration-secret-key-2024';

  static encrypt(data: any): string {
    try {
      const dataString = JSON.stringify(data);
      // Simple base64 encoding for development
      // In production, use the CredentialEncryption class above
      return btoa(dataString);
    } catch (error) {
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): any {
    try {
      const dataString = atob(encryptedData);
      return JSON.parse(dataString);
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }
} 