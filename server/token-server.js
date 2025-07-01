const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['https://localhost:3001', 'http://localhost:3001', 'https://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Environment variables
const AGORA_APP_ID = process.env.VITE_AGORA_APP_ID || 'fffa925cd399432a895ab9a46688d279';
const AGORA_APP_CERTIFICATE = process.env.VITE_AGORA_APP_CERTIFICATE || '6389a8f7e7ce4b8fa66a2600207e7858';

// Token generation endpoint
app.post('/api/agora/token', (req, res) => {
  try {
    const { channelName, uid, role = 'publisher', expirationTimeInSeconds = 3600 } = req.body;

    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Convert role to Agora role
    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    // Calculate expiration time
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Generate token using official Agora library
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      agoraRole,
      privilegeExpiredTs
    );

    console.log(`[TokenServer] Generated token for channel: ${channelName}, uid: ${uid}, role: ${role}`);

    res.json({
      token,
      appId: AGORA_APP_ID,
      channelName,
      uid,
      role,
      expiresAt: privilegeExpiredTs
    });

  } catch (error) {
    console.error('[TokenServer] Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback for SPA routing - handle specific routes
app.get('/video-test-simple', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;

// Try to start HTTPS server first, fallback to HTTP
try {
  // Check if certificates exist
  const certPath = path.join(__dirname, '../certs');
  const keyPath = path.join(certPath, 'localhost-key.pem');
  const certFilePath = path.join(certPath, 'localhost.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
    // HTTPS server with certificates
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certFilePath)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`🔒 HTTPS Token Server running on https://localhost:${PORT}`);
      console.log(`🎯 Token API available at: https://localhost:${PORT}/api/agora/token`);
      console.log(`🌐 DoctorMX available at: https://localhost:${PORT}/video-test-simple`);
    });
  } else {
    // HTTP fallback
    app.listen(PORT, () => {
      console.log(`🌐 HTTP Token Server running on http://localhost:${PORT}`);
      console.log(`🎯 Token API available at: http://localhost:${PORT}/api/agora/token`);
      console.log(`⚠️  Note: Video calling may not work over HTTP due to browser security restrictions`);
    });
  }
} catch (error) {
  console.error('Failed to start server:', error);
  // HTTP fallback
  app.listen(PORT, () => {
    console.log(`🌐 HTTP Token Server running on http://localhost:${PORT} (fallback)`);
  });
}
