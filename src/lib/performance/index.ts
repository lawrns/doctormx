/**
 * Performance monitoring module exports
 */

export * from './monitor'
export type { PerformanceOperation, PerformanceConfig } from './monitor'

// Web Vitals tracking
export * from './web-vitals'
export type { WebVitalsMetric, WebVitalsConfig, WebVitalMetric } from './web-vitals'

// Image blur placeholders for LCP optimization
export * from './image-blur'
export type { LCPImageProps } from './image-blur'

