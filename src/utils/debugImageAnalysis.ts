/**
 * Debug utility for image analysis issues
 */

export const debugImageAnalysis = {
  logAnalysisStep: (step: string, data?: any) => {
    console.group(`🔍 Image Analysis Debug: ${step}`);
    console.log(`Time: ${new Date().toISOString()}`);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  },

  logError: (step: string, error: any) => {
    console.group(`❌ Image Analysis Error at: ${step}`);
    console.error('Error:', error);
    console.error('Error Message:', error?.message);
    console.error('Error Stack:', error?.stack);
    console.error('Error Type:', error?.constructor?.name);
    console.groupEnd();
  },

  checkDependencies: () => {
    console.group('🔧 Checking Image Analysis Dependencies');
    
    // Check if we're in a browser environment
    console.log('Environment:', {
      hasDocument: typeof document !== 'undefined',
      hasWindow: typeof window !== 'undefined',
      hasCanvas: typeof document !== 'undefined' && !!document.createElement('canvas').getContext,
      hasImageData: typeof ImageData !== 'undefined'
    });

    // Check API configuration
    console.log('API Configuration:', {
      hasOpenAIKey: !!import.meta.env.VITE_OPENAI_API_KEY,
      useVisionAPI: import.meta.env.VITE_USE_VISION_API === 'true',
      imageAnalysisModel: import.meta.env.VITE_IMAGE_ANALYSIS_MODEL,
      apiEndpoint: import.meta.env.VITE_API_URL
    });

    console.groupEnd();
  },

  analyzeImageData: (imageData: ImageData) => {
    console.group('📊 Image Data Analysis');
    console.log('Dimensions:', `${imageData.width}x${imageData.height}`);
    console.log('Total Pixels:', imageData.width * imageData.height);
    console.log('Data Length:', imageData.data.length);
    console.log('Bytes per Pixel:', imageData.data.length / (imageData.width * imageData.height));
    
    // Sample some pixels to check data integrity
    const samplePixels = [];
    for (let i = 0; i < 10; i++) {
      const idx = Math.floor(Math.random() * imageData.data.length / 4) * 4;
      samplePixels.push({
        index: idx / 4,
        r: imageData.data[idx],
        g: imageData.data[idx + 1],
        b: imageData.data[idx + 2],
        a: imageData.data[idx + 3]
      });
    }
    console.log('Sample Pixels:', samplePixels);
    
    console.groupEnd();
  },

  checkServices: async () => {
    console.group('🏗️ Checking Service Initialization');
    
    try {
      // Check if services are available
      const services = await import('../../packages/services');
      console.log('Available Services:', Object.keys(services));
      
      // Check specific services
      if (services.RealComprehensiveMedicalImageAnalyzer) {
        const analyzer = services.RealComprehensiveMedicalImageAnalyzer.getInstance();
        console.log('RealComprehensiveMedicalImageAnalyzer:', !!analyzer);
      }
      
      if (services.realTimeImageProcessor) {
        console.log('RealTimeImageProcessor:', !!services.realTimeImageProcessor);
      }
      
    } catch (error) {
      console.error('Failed to check services:', error);
    }
    
    console.groupEnd();
  },

  traceAnalysisFlow: async (imageDataUrl: string, analysisType: string) => {
    console.group('🔄 Tracing Complete Analysis Flow');
    
    const steps = [
      'Image Capture',
      'Quality Assessment', 
      'Pixel Analysis',
      'Feature Extraction',
      'Diagnostic Analysis',
      'Constitutional Assessment',
      'Treatment Recommendations',
      'Vision API Call',
      'Result Merging'
    ];
    
    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step} - Pending`);
    });
    
    console.groupEnd();
  }
};