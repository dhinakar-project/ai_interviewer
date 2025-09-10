// Performance monitoring and analytics
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track page load times
  trackPageLoad(page: string, loadTime: number) {
    this.metrics.set(`page_load_${page}`, loadTime);
    console.log(`Page ${page} loaded in ${loadTime}ms`);
  }

  // Track API response times
  trackApiCall(endpoint: string, responseTime: number) {
    this.metrics.set(`api_${endpoint}`, responseTime);
    console.log(`API ${endpoint} responded in ${responseTime}ms`);
  }

  // Track user interactions
  trackUserAction(action: string, timestamp: number = Date.now()) {
    this.metrics.set(`action_${action}`, timestamp);
    console.log(`User action: ${action} at ${new Date(timestamp).toISOString()}`);
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      summary[key] = value;
    });
    return summary;
  }

  // Track interview completion
  trackInterviewCompletion(interviewId: string, duration: number, score: number) {
    this.metrics.set(`interview_${interviewId}_duration`, duration);
    this.metrics.set(`interview_${interviewId}_score`, score);
    console.log(`Interview ${interviewId} completed: ${duration}ms, score: ${score}`);
  }
}

// Error tracking
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Error[] = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, context?: string) {
    this.errors.push(error);
    console.error(`Error tracked${context ? ` in ${context}` : ''}:`, error);
    
    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, LogRocket, or similar service
      console.log('Would send error to monitoring service:', error);
    }
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getRecentErrors(limit: number = 10): Error[] {
    return this.errors.slice(-limit);
  }
}

// Usage tracking
export class UsageTracker {
  private static instance: UsageTracker;
  private usage: Map<string, number> = new Map();

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  trackFeatureUsage(feature: string) {
    const current = this.usage.get(feature) || 0;
    this.usage.set(feature, current + 1);
    console.log(`Feature usage: ${feature} (${current + 1} times)`);
  }

  getFeatureUsage(feature: string): number {
    return this.usage.get(feature) || 0;
  }

  getAllUsage(): Record<string, number> {
    const result: Record<string, number> = {};
    this.usage.forEach((count, feature) => {
      result[feature] = count;
    });
    return result;
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const errorTracker = ErrorTracker.getInstance();
export const usageTracker = UsageTracker.getInstance();



