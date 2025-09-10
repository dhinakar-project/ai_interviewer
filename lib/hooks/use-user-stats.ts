import { useQuery } from '@tanstack/react-query';

interface UserPerformanceStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  bestScore: number;
  interviewsThisWeek: number;
  interviewsThisMonth: number;
  improvementRate: number;
  categoryAverages: Record<string, number>;
  recentScores: Array<{ score: number; date: string; interviewId: string }>;
  strengths: string[];
  areasForImprovement: string[];
  interviewTypes: Record<string, number>;
  techStackPerformance: Record<string, { count: number; avgScore: number }>;
  weeklyProgress: Array<{ week: string; interviews: number; averageScore: number }>;
  monthlyProgress: Array<{ month: string; interviews: number; averageScore: number }>;
}

export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async (): Promise<UserPerformanceStats> => {
      const response = await fetch(`/api/user/stats?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}






















