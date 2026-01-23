/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics for optimization
 */

import React, { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface ComponentRenderMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRenderTimestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private componentMetrics: Map<string, ComponentRenderMetric> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    // Only enable in development or with debug flag
    this.isEnabled = import.meta.env.DEV || 
                    localStorage.getItem('debug_performance') === 'true';
  }

  /**
   * Measure function execution time
   */
  measureAsync = async <T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    if (!this.isEnabled) return fn();

    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime, 'ms');
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`${name}_error`, endTime - startTime, 'ms');
      throw error;
    }
  };

  /**
   * Measure sync function execution time
   */
  measureSync = <T>(
    name: string,
    fn: () => T
  ): T => {
    if (!this.isEnabled) return fn();

    const startTime = performance.now();
    try {
      const result = fn();
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime, 'ms');
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`${name}_error`, endTime - startTime, 'ms');
      throw error;
    }
  };

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number, unit: string = 'ms') {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 100 metrics per name
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Track React component render performance
   */
  trackComponentRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;

    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      existing.renderTime += renderTime;
      existing.renderCount += 1;
      existing.lastRenderTimestamp = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        lastRenderTimestamp: Date.now()
      });
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary: Record<string, any> = {};

    // Aggregate metrics
    this.metrics.forEach((metrics, name) => {
      const values = metrics.map(m => m.value);
      summary[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        last: values[values.length - 1]
      };
    });

    // Component render metrics
    const componentSummary: any[] = [];
    this.componentMetrics.forEach((metric) => {
      componentSummary.push({
        name: metric.componentName,
        avgRenderTime: metric.renderTime / metric.renderCount,
        renderCount: metric.renderCount,
        totalRenderTime: metric.renderTime
      });
    });

    // Sort by total render time
    componentSummary.sort((a, b) => b.totalRenderTime - a.totalRenderTime);

    return {
      metrics: summary,
      components: componentSummary,
      memory: this.getMemoryUsage()
    };
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    if (!('memory' in performance)) return null;
    
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      usage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Start observing specific performance metrics
   */
  observeMetrics(types: string[] = ['navigation', 'resource', 'measure']) {
    if (!this.isEnabled || !('PerformanceObserver' in window)) return;

    types.forEach(type => {
      if (this.observers.has(type)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric(
              `${type}_${entry.name}`,
              entry.duration,
              'ms'
            );
          });
        });

        observer.observe({ entryTypes: [type] });
        this.observers.set(type, observer);
      } catch (error) {
        console.warn(`Failed to observe ${type} metrics:`, error);
      }
    });
  }

  /**
   * Log performance report to console
   */
  logReport() {
    if (!this.isEnabled) return;

    const summary = this.getSummary();
    
    console.group('🚀 Performance Report');
    
    console.group('📊 Metrics Summary');
    Object.entries(summary.metrics).forEach(([name, stats]: [string, any]) => {
      console.log(`${name}:`, {
        avg: `${stats.avg.toFixed(2)}ms`,
        min: `${stats.min.toFixed(2)}ms`,
        max: `${stats.max.toFixed(2)}ms`,
        count: stats.count
      });
    });
    console.groupEnd();

    console.group('⚛️ Component Render Times');
    summary.components.slice(0, 10).forEach((comp: any) => {
      console.log(`${comp.name}:`, {
        avgRender: `${comp.avgRenderTime.toFixed(2)}ms`,
        renders: comp.renderCount,
        totalTime: `${comp.totalRenderTime.toFixed(2)}ms`
      });
    });
    console.groupEnd();

    if (summary.memory) {
      console.group('💾 Memory Usage');
      console.log(summary.memory);
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.componentMetrics.clear();
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React component performance tracking hook
export const useComponentPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      performanceMonitor.trackComponentRender(componentName, endTime - startTime);
    };
  });
};

// Performance monitoring HOC
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    useComponentPerformance(componentName);
    return <Component {...props} />;
  });
};