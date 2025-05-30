// Test endpoint for feature flags
exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  try {
    // Return mock feature flags for testing
    const mockFeatureFlags = {
      herbDatabase: true,
      rootCauseAnalysis: true,
      protocolBuilder: false,
      constitutionalAnalysis: false,
      redFlagDetection: true,
      imageAnalysisV2: false,
      progressTracking: false,
      knowledgeGraph: false,
      expertPortal: false,
      marketplace: false,
      community: false,
      multilingual: false
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        flags: mockFeatureFlags,
        message: 'Feature flags retrieved successfully (mock data)',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Feature flags test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to retrieve feature flags'
      })
    };
  }
};
