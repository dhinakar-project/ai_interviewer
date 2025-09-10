// Advanced analytics and insights
export interface InterviewAnalytics {
  totalInterviews: number;
  averageScore: number;
  improvementRate: number;
  strengths: string[];
  weaknesses: string[];
  timeSpent: number;
  completionRate: number;
}

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  private data: Map<string, any> = new Map();

  static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  // Track interview session
  trackInterviewSession(sessionData: {
    userId: string;
    interviewId: string;
    startTime: number;
    endTime: number;
    score: number;
    questions: string[];
    responses: string[];
  }) {
    const duration = sessionData.endTime - sessionData.startTime;
    const session = {
      ...sessionData,
      duration,
      timestamp: new Date().toISOString(),
    };
    
    this.data.set(`session_${sessionData.interviewId}`, session);
    console.log('Interview session tracked:', session);
  }

  // Generate insights
  generateInsights(userId: string): InterviewAnalytics {
    const userSessions = Array.from(this.data.values())
      .filter(session => session.userId === userId);

    if (userSessions.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        improvementRate: 0,
        strengths: [],
        weaknesses: [],
        timeSpent: 0,
        completionRate: 0,
      };
    }

    const totalInterviews = userSessions.length;
    const averageScore = userSessions.reduce((sum, session) => sum + session.score, 0) / totalInterviews;
    const timeSpent = userSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Calculate improvement rate
    const recentScores = userSessions.slice(-5).map(s => s.score);
    const olderScores = userSessions.slice(-10, -5).map(s => s.score);
    const improvementRate = this.calculateImprovementRate(recentScores, olderScores);

    // Analyze strengths and weaknesses
    const { strengths, weaknesses } = this.analyzePerformance(userSessions);

    return {
      totalInterviews,
      averageScore: Math.round(averageScore),
      improvementRate: Math.round(improvementRate),
      strengths,
      weaknesses,
      timeSpent,
      completionRate: 100, // Assuming all tracked sessions are completed
    };
  }

  private calculateImprovementRate(recent: number[], older: number[]): number {
    if (recent.length === 0 || older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private analyzePerformance(sessions: any[]): { strengths: string[]; weaknesses: string[] } {
    // This is a simplified analysis - in a real app, you'd use ML or more sophisticated analysis
    const scores = sessions.map(s => s.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (avgScore >= 80) {
      strengths.push('High performance', 'Consistent scoring');
    } else if (avgScore >= 60) {
      strengths.push('Good performance');
      weaknesses.push('Room for improvement');
    } else {
      weaknesses.push('Needs significant improvement', 'Low performance');
    }
    
    return { strengths, weaknesses };
  }

  // Export data for external analysis
  exportData(): any {
    return {
      sessions: Array.from(this.data.values()),
      timestamp: new Date().toISOString(),
    };
  }
}

// Real-time performance monitoring
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Keep only last 100 values
    const values = this.metrics.get(name)!;
    if (values.length > 100) {
      values.splice(0, values.length - 100);
    }
  }

  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, count: values.length };
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};
    this.metrics.forEach((_, name) => {
      result[name] = this.getMetricStats(name);
    });
    return result;
  }
}

// Export singleton instances
export const analyticsEngine = AnalyticsEngine.getInstance();
export const performanceTracker = PerformanceTracker.getInstance();



