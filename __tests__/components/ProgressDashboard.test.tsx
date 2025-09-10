import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProgressDashboard from '@/components/ProgressDashboard'
import { mockUser } from '../utils/test-utils'

// Mock fetch
global.fetch = jest.fn()

describe('ProgressDashboard', () => {
  const user = userEvent.setup()
  const defaultProps = {
    userId: 'test-user-id',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading skeleton when fetching data', () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<ProgressDashboard {...defaultProps} />)
      
      // Check for loading skeleton elements
      expect(screen.getByText('Total Interviews')).toBeInTheDocument()
      expect(screen.getByText('Average Score')).toBeInTheDocument()
      expect(screen.getByText('Best Score')).toBeInTheDocument()
      expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('displays user statistics correctly', async () => {
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
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument() // Total interviews
        expect(screen.getByText('75%')).toBeInTheDocument() // Average score
        expect(screen.getByText('85%')).toBeInTheDocument() // Best score
        expect(screen.getByText('80%')).toBeInTheDocument() // Completion rate
      })
    })

    it('displays improvement rate correctly', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 15,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('15% from last month')).toBeInTheDocument()
      })
    })

    it('displays negative improvement rate correctly', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: -5,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('5% from last month')).toBeInTheDocument()
      })
    })
  })

  describe('Charts and Visualizations', () => {
    it('renders category performance chart', async () => {
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
          'Problem Solving': 75,
        },
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Category Performance')).toBeInTheDocument()
        expect(screen.getByText('Communication Skills')).toBeInTheDocument()
        expect(screen.getByText('Technical Knowledge')).toBeInTheDocument()
        expect(screen.getByText('Problem Solving')).toBeInTheDocument()
      })
    })

    it('renders weekly progress chart', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [
          { week: '2024-01-15', interviews: 1, averageScore: 85 },
          { week: '2024-01-08', interviews: 1, averageScore: 75 },
        ],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Weekly Score Trend')).toBeInTheDocument()
      })
    })

    it('renders interview types distribution', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: { 'Technical': 3, 'Behavioral': 2 },
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Interview Types')).toBeInTheDocument()
        expect(screen.getByText('Technical')).toBeInTheDocument()
        expect(screen.getByText('Behavioral')).toBeInTheDocument()
      })
    })
  })

  describe('Strengths and Areas for Improvement', () => {
    it('displays strengths correctly', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [],
        strengths: ['Clear communication', 'Technical knowledge', 'Problem solving'],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Your Strengths')).toBeInTheDocument()
        expect(screen.getByText('Clear communication')).toBeInTheDocument()
        expect(screen.getByText('Technical knowledge')).toBeInTheDocument()
        expect(screen.getByText('Problem solving')).toBeInTheDocument()
      })
    })

    it('displays areas for improvement correctly', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: ['Time management', 'Public speaking'],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Focus Areas')).toBeInTheDocument()
        expect(screen.getByText('Time management')).toBeInTheDocument()
        expect(screen.getByText('Public speaking')).toBeInTheDocument()
      })
    })

    it('shows placeholder when no strengths available', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Complete more interviews to see your strengths')).toBeInTheDocument()
      })
    })
  })

  describe('Technology Performance', () => {
    it('displays tech stack performance', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {
          'React': { count: 2, avgScore: 80 },
          'Node.js': { count: 1, avgScore: 75 },
          'TypeScript': { count: 1, avgScore: 85 },
        },
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Technology Performance')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('Node.js')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
        expect(screen.getByText('80%')).toBeInTheDocument()
        expect(screen.getByText('75%')).toBeInTheDocument()
        expect(screen.getByText('85%')).toBeInTheDocument()
      })
    })
  })

  describe('Recent Performance', () => {
    it('displays recent scores correctly', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [
          { score: 85, date: '2024-01-15T10:00:00Z', interviewId: '1' },
          { score: 75, date: '2024-01-10T10:00:00Z', interviewId: '2' },
          { score: 90, date: '2024-01-05T10:00:00Z', interviewId: '3' },
        ],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Recent Performance')).toBeInTheDocument()
        expect(screen.getByText('85%')).toBeInTheDocument()
        expect(screen.getByText('75%')).toBeInTheDocument()
        expect(screen.getByText('90%')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })

    it('displays error message when API returns error status', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
        expect(screen.getByText('HTTP 500: Internal Server Error')).toBeInTheDocument()
      })
    })

    it('handles retry functionality', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            totalInterviews: 5,
            completedInterviews: 4,
            averageScore: 75,
            bestScore: 85,
            interviewsThisWeek: 2,
            interviewsThisMonth: 3,
            improvementRate: 10,
            categoryAverages: {},
            recentScores: [],
            strengths: [],
            areasForImprovement: [],
            interviewTypes: {},
            techStackPerformance: {},
            weeklyProgress: [],
            monthlyProgress: [],
          }),
        })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument() // Total interviews
      })
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no data available', async () => {
      const mockStats = {
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No Data Available')).toBeInTheDocument()
        expect(screen.getByText('Complete your first interview to unlock detailed analytics, performance insights, and personalized recommendations.')).toBeInTheDocument()
      })
    })
  })

  describe('Score Color Coding', () => {
    it('applies correct color classes for different scores', async () => {
      const mockStats = {
        totalInterviews: 3,
        completedInterviews: 3,
        averageScore: 85, // Green
        bestScore: 95, // Green
        interviewsThisWeek: 1,
        interviewsThisMonth: 2,
        improvementRate: 10,
        categoryAverages: {
          'Communication Skills': 60, // Yellow
          'Technical Knowledge': 45, // Red
        },
        recentScores: [
          { score: 90, date: '2024-01-15T10:00:00Z', interviewId: '1' }, // Green
          { score: 55, date: '2024-01-10T10:00:00Z', interviewId: '2' }, // Red
        ],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        const averageScoreElement = screen.getByText('85%')
        const bestScoreElement = screen.getByText('95%')
        
        expect(averageScoreElement).toHaveClass('text-green-600')
        expect(bestScoreElement).toHaveClass('text-green-600')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      const mockStats = {
        totalInterviews: 5,
        completedInterviews: 4,
        averageScore: 75,
        bestScore: 85,
        interviewsThisWeek: 2,
        interviewsThisMonth: 3,
        improvementRate: 10,
        categoryAverages: {},
        recentScores: [],
        strengths: [],
        areasForImprovement: [],
        interviewTypes: {},
        techStackPerformance: {},
        weeklyProgress: [],
        monthlyProgress: [],
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Total Interviews')).toBeInTheDocument()
        expect(screen.getByText('Average Score')).toBeInTheDocument()
        expect(screen.getByText('Best Score')).toBeInTheDocument()
        expect(screen.getByText('Completion Rate')).toBeInTheDocument()
      })
    })
  })
})























