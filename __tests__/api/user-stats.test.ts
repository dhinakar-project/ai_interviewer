import { NextRequest } from 'next/server'
import { GET } from '@/app/api/user/stats/route'
import { getUserPerformanceStats } from '@/lib/actions/general.action'

// Mock the general action
jest.mock('@/lib/actions/general.action', () => ({
  getUserPerformanceStats: jest.fn(),
}))

describe('/api/user/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns user stats successfully', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {
          'Communication Skills': 80,
          'Technical Knowledge': 70,
        },
        recentScores: [
          { score: 85, date: '2024-01-15T10:00:00Z', interviewId: '1' },
        ],
        strengths: ['Clear communication'],
        areasForImprovement: ['Problem solving'],
        interviewTypes: { 'Technical': 3, 'Behavioral': 2 },
        techStackPerformance: {
          'React': { count: 2, avgScore: 80 },
        },
        weeklyProgress: [
          { week: '2024-01-15', interviews: 1, averageScore: 85 },
        ],
        monthlyProgress: [
          { month: '2024-01', interviews: 2, averageScore: 80 },
        ],
      }

      ;(getUserPerformanceStats as jest.Mock).mockResolvedValue(mockStats)

      const request = new NextRequest('http://localhost:3000/api/user/stats?userId=test-user-id')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockStats)
      expect(getUserPerformanceStats).toHaveBeenCalledWith('test-user-id')
    })

    it('returns 400 error when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/stats')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'User ID is required' })
      expect(getUserPerformanceStats).not.toHaveBeenCalled()
    })

    it('returns 400 error when userId is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/stats?userId=')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'User ID is required' })
      expect(getUserPerformanceStats).not.toHaveBeenCalled()
    })

    it('returns 500 error when getUserPerformanceStats throws', async () => {
      const error = new Error('Database connection failed')
      ;(getUserPerformanceStats as jest.Mock).mockRejectedValue(error)

      const request = new NextRequest('http://localhost:3000/api/user/stats?userId=test-user-id')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch user statistics' })
      expect(getUserPerformanceStats).toHaveBeenCalledWith('test-user-id')
    })

    it('handles empty stats data', async () => {
      const emptyStats = {
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        interviewsThisWeek: 0,
        interviewsThisMonth: 0,
        improvementRate: 0,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      ;(getUserPerformanceStats as jest.Mock).mockResolvedValue(emptyStats)

      const request = new NextRequest('http://localhost:3000/api/user/stats?userId=test-user-id')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(emptyStats)
    })

    it('handles partial stats data', async () => {
      const partialStats = {
        totalInterviews: 3,
        completedInterviews: 2,
        averageScore: 70,
        bestScore: 80,
        interviewsThisWeek: 1,
        interviewsThisMonth: 2,
        improvementRate: 5,
        categoryAverages: {
          'Communication Skills': 75,
        },
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: { 'Technical': 2 },
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      ;(getUserPerformanceStats as jest.Mock).mockResolvedValue(partialStats)

      const request = new NextRequest('http://localhost:3000/api/user/stats?userId=test-user-id')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(partialStats)
    })
  })
})























