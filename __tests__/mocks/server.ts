import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock API handlers
export const handlers = [
  // User stats API
  rest.get('/api/user/stats', (req, res, ctx) => {
    const userId = req.url.searchParams.get('userId')
    
    if (!userId) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'User ID is required' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
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
          'Problem Solving': 75,
          'Cultural Fit': 85,
          'Confidence and Clarity': 80,
        },
        recentScores: [
          { score: 85, date: '2024-01-15T10:00:00Z', interviewId: '1' },
          { score: 75, date: '2024-01-10T10:00:00Z', interviewId: '2' },
        ],
        strengths: ['Clear communication', 'Technical knowledge'],
        areasForImprovement: ['Problem solving', 'Time management'],
        interviewTypes: { 'Technical': 3, 'Behavioral': 2 },
        techStackPerformance: {
          'React': { count: 2, avgScore: 80 },
          'Node.js': { count: 1, avgScore: 75 },
        },
        weeklyProgress: [
          { week: '2024-01-15', interviews: 1, averageScore: 85 },
          { week: '2024-01-08', interviews: 1, averageScore: 75 },
        ],
        monthlyProgress: [
          { month: '2024-01', interviews: 2, averageScore: 80 },
        ],
      })
    )
  }),

  // Gestures API
  rest.post('/api/user/gestures', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    )
  }),

  // VAPI generate API
  rest.post('/api/vapi/generate', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        interviewId: 'test-interview-id',
      })
    )
  }),

  // User update API
  rest.put('/api/user/update', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    )
  }),

  // User me API
  rest.get('/api/user/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      })
    )
  }),
]

export const server = setupServer(...handlers)























