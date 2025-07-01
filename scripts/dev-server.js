#!/usr/bin/env node

// Standalone development server for video calling testing
// This bypasses Netlify Dev issues with Agora.io dependencies

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Proxy API calls to a simple token generation endpoint
app.use('/api', express.json());

// Simple token generation endpoint
app.post('/api/generate-agora-token', async (req, res) => {
  try {
    const { channelName, uid, role = 'publisher', expirationTimeInSeconds = 3600 } = req.body;
    
    // Get credentials from environment
    const appId = process.env.VITE_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    if (!appId || !appCertificate) {
      return res.status(500).json({ 
        error: 'Missing Agora credentials in environment variables' 
      });
    }
    
    if (!channelName || !uid) {
      return res.status(400).json({ 
        error: 'Missing required parameters: channelName and uid' 
      });
    }

    // Import Agora token builder
    const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
    
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
    
    console.log(`[DevServer] Generated token for channel: ${channelName}, uid: ${uid}`);
    
    res.json({
      token,
      appId,
      channelName,
      uid,
      expirationTime: privilegeExpiredTs,
      role
    });
    
  } catch (error) {
    console.error('[DevServer] Token generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message 
    });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📹 Video calling test: http://localhost:${PORT}/video-test-simple`);
  console.log(`🔧 This server includes token generation for Agora.io`);
});
