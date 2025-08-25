"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface InterviewStats {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  interviewsThisWeek: number;
  improvementRate: number;
  strengths: string[];
  areasForImprovement: string[];
}

interface ProgressDashboardProps {
  userId: string;
}

export default function ProgressDashboard({ userId }: ProgressDashboardProps) {
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you'd fetch this from your API
        // For now, we'll simulate the data
        const mockStats: InterviewStats = {
          totalInterviews: 12,
          averageScore: 78,
          bestScore: 92,
          interviewsThisWeek: 3,
          improvementRate: 15,
          strengths: ["Technical Knowledge", "Communication", "Problem Solving"],
          areasForImprovement: ["System Design", "Behavioral Questions", "Time Management"]
        };

        setStats(mockStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Interviews</CardTitle>
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
              <svg
                className="h-4 w-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalInterviews}</div>
            <p className="text-sm text-gray-600">
              +{stats.interviewsThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
              <svg
                className="h-4 w-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.averageScore}%</div>
            <p className="text-sm text-gray-600">
              +{stats.improvementRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Best Score</CardTitle>
            <div className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
              <svg
                className="h-4 w-4 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.bestScore}%</div>
            <p className="text-sm text-gray-600">
              Your highest score
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
              <svg
                className="h-4 w-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.interviewsThisWeek}</div>
            <p className="text-sm text-gray-600">
              Interviews completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-gray-900">Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Overall Progress</span>
                <span className="text-gray-900 font-semibold">{stats.averageScore}%</span>
              </div>
              <div className="relative">
                <Progress value={stats.averageScore} className="h-3 bg-gray-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Goal (90%)</span>
                <span className="text-gray-900 font-semibold">{Math.round((stats.averageScore / 90) * 100)}%</span>
              </div>
              <div className="relative">
                <Progress value={(stats.averageScore / 90) * 100} className="h-3 bg-gray-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full opacity-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-gray-900">Your Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.strengths.map((strength, index) => (
                <Badge 
                  key={index} 
                  className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200 px-4 py-2"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Areas for Improvement */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-gray-900">Areas for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.areasForImprovement.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">{area}</span>
                <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200">
                  Focus Area
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

