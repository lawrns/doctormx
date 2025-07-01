const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { channelName, uid, role = 'publisher', expirationTimeInSeconds = 3600 } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!channelName || !uid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters: channelName and uid are required' 
        })
      };
    }

    // Get Agora credentials from environment variables
    // Try both VITE_ prefixed and non-prefixed versions for compatibility
    const appId = process.env.VITE_AGORA_APP_ID || process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    console.log('[AgoraToken] App ID:', appId ? 'Present' : 'Missing');
    console.log('[AgoraToken] Certificate:', appCertificate ? 'Present' : 'Missing');

    if (!appId || !appCertificate) {
      console.error('Missing Agora credentials in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error: Missing Agora credentials' 
        })
      };
    }

    // Calculate expiration time
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Determine role
    const rtcRole = role === 'audience' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs
    );

    // Log token generation (remove in production)
    console.log(`[AgoraToken] Generated token for channel: ${channelName}, uid: ${uid}, role: ${role}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        appId,
        channelName,
        uid,
        expirationTime: privilegeExpiredTs,
        role
      })
    };

  } catch (error) {
    console.error('[AgoraToken] Error generating token:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate video call token',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
