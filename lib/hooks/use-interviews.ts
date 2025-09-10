import { useQuery } from '@tanstack/react-query';

interface Interview {
  id: string;
  role: string;
  type: string;
  level: string;
  techstack: string[];
  questions: string[];
  userId: string;
  finalized: boolean;
  coverImage: string;
  createdAt: string;
}

interface UseInterviewsOptions {
  userId: string;
  page?: number;
  limit?: number;
  type?: 'user' | 'latest';
}

export function useInterviews({ userId, page = 1, limit = 10, type = 'user' }: UseInterviewsOptions) {
  return useQuery({
    queryKey: ['interviews', userId, type, page, limit],
    queryFn: async (): Promise<{ interviews: Interview[]; total: number; hasMore: boolean }> => {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: limit.toString(),
        type,
      });
      
      const response = await fetch(`/api/interviews?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}






















