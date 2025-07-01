// Client-side token generation for development/testing
// WARNING: This exposes your certificate - only use for development!

// Note: agora-access-token is Node.js only, not browser compatible

interface TokenConfig {
  appId: string;
  appCertificate: string;
  channelName: string;
  uid: string;
  role: 'publisher' | 'audience';
  expirationTimeInSeconds?: number;
}

// Simple HMAC-SHA256 implementation for token generation
async function hmacSha256(key: string, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return await crypto.subtle.sign('HMAC', cryptoKey, messageData);
}

// Convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map(value => value.toString(16).padStart(2, '0'));
  return hexCodes.join('');
}

// Generate Agora token (simplified version for testing)
export async function generateAgoraToken(config: TokenConfig): Promise<string> {
  const {
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    expirationTimeInSeconds = 3600
  } = config;

  try {
    // Calculate expiration time
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Create message to sign
    const message = `${appId}${channelName}${uid}${privilegeExpiredTs}`;

    // Generate signature
    const signature = await hmacSha256(appCertificate, message);
    const signatureHex = arrayBufferToHex(signature);

    // Create simple token (this is a simplified version)
    const tokenData = {
      appId,
      channelName,
      uid,
      expire: privilegeExpiredTs,
      signature: signatureHex.substring(0, 32) // Truncate for simplicity
    };

    // Encode as base64
    const tokenString = btoa(JSON.stringify(tokenData));

    console.log('[TokenGenerator] Generated token for:', { channelName, uid, role });
    return tokenString;

  } catch (error) {
    console.error('[TokenGenerator] Failed to generate token:', error);
    throw new Error('Token generation failed');
  }
}

// Alternative: Use server-side token generation
export async function getTokenFromServer(config: TokenConfig): Promise<string> {
  try {
    const response = await fetch('/.netlify/functions/generate-agora-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName: config.channelName,
        uid: config.uid,
        role: config.role,
        expirationTimeInSeconds: config.expirationTimeInSeconds
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.token;

  } catch (error) {
    console.error('[TokenGenerator] Server token generation failed:', error);
    throw error;
  }
}

// Main token generation function using server-side API
export async function generateToken(config: TokenConfig): Promise<string> {
  try {
    console.log('[TokenGenerator] Requesting token from server...');
    console.log('[TokenGenerator] Config:', {
      channelName: config.channelName,
      uid: config.uid,
      role: config.role
    });

    // Try server-side token generation first
    const response = await fetch('/api/agora/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName: config.channelName,
        uid: config.uid,
        role: config.role,
        expirationTimeInSeconds: config.expirationTimeInSeconds || 3600
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[TokenGenerator] Server token generated successfully');
      return data.token;
    } else {
      throw new Error(`Server responded with ${response.status}`);
    }

  } catch (error) {
    console.warn('[TokenGenerator] Server token generation failed, using null token fallback:', error);

    // Fallback to null token for development
    console.log('[TokenGenerator] Using null token fallback for development');
    return '';
  }
}

// Generate a simple UID for testing
export function generateTestUID(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}
