/**
 * Pact Configuration for Contract Testing
 * TST-010: Contract Testing Implementation
 */

import path from 'path'

export const pactConfig = {
  // Consumer configuration
  consumer: {
    name: 'DoctorMX-Web',
    dir: path.resolve(process.cwd(), 'pacts'),
    log: path.resolve(process.cwd(), 'logs', 'pact-consumer.log'),
    logLevel: 'info' as const,
    pactfileWriteMode: 'update' as const,
    port: 1234,
    host: '127.0.0.1',
  },
  
  // Provider configuration
  provider: {
    name: 'DoctorMX-API',
    pactBrokerUrl: process.env.PACT_BROKER_URL || 'http://localhost:9292',
    pactBrokerToken: process.env.PACT_BROKER_TOKEN,
    publishVerificationResult: process.env.CI === 'true',
    providerVersion: process.env.GIT_COMMIT || 'dev',
    providerVersionBranch: process.env.GIT_BRANCH || 'main',
    logLevel: 'info' as const,
  },
  
  // Pact file paths
  pactFiles: {
    dir: path.resolve(process.cwd(), 'pacts'),
    pattern: '**/*.json',
  },
}

export default pactConfig
