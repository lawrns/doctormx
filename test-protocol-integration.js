/**
 * Test script to verify the protocol integration works
 */

// Simple test to check if our integration works
function testProtocolIntegration() {
  console.log('Testing protocol integration...');
  
  try {
    // Import paths that would work in Node.js environment
    const { ComprehensiveProtocolDatabase } = require('./packages/services/ComprehensiveProtocolDatabase.ts');
    
    console.log('✅ ComprehensiveProtocolDatabase import successful');
    
    const protocolDB = ComprehensiveProtocolDatabase.getInstance();
    console.log('✅ ComprehensiveProtocolDatabase instance created');
    
    const protocols = protocolDB.getAllProtocols();
    console.log(`✅ Found ${protocols.size} protocols in database`);
    
    // List protocol IDs
    const protocolIds = Array.from(protocols.keys());
    console.log('📋 Available protocols:', protocolIds);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testProtocolIntegration();
}

module.exports = { testProtocolIntegration };