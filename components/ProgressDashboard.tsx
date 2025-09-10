"use client";

import { useMemo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, DonutChart } from "@/components/ui/chart";
import { 
    TrendingUp, 
    TrendingDown, 
    Target, 
    Calendar, 
    Award, 
    BarChart3, 
    PieChart, 
    Activity,
    Zap,
    Clock,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { useUserStats } from "@/lib/hooks/use-user-stats";

interface ProgressDashboardProps {
    userId: string;
}

// Memoized loading skeleton component
const LoadingSkeleton = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

// Memoized error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onRetry}>Try Again</Button>
    </Card>
);

// Memoized empty state component
const EmptyState = () => (
    <Card className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">
            Complete your first interview to see detailed analytics and progress tracking.
        </p>
    </Card>
);

// Memoized score color utility functions
const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
};

const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
};

// Memoized chart data preparation
const useChartData = (stats: any) => {
    return useMemo(() => {
        // Safety check for stats
        if (!stats || typeof stats !== 'object') {
            return { categoryChartData: [], weeklyChartData: [], interviewTypesData: [] };
        }

        const categoryChartData = Object.entries(stats.categoryAverages || {})
            .map(([category, score]) => ({
                label: category || 'Unknown',
                value: Math.max(0, Number(score) || 0),
            }))
            .filter(item => item.value > 0); // Only include items with positive values

        const weeklyChartData = (stats.weeklyProgress || [])
            .filter((week: any) => week && week.interviews > 0 && week.averageScore > 0)
            .map((week: any) => ({
                label: week.week ? new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
                value: Math.max(0, Number(week.averageScore) || 0),
            }));

        const interviewTypesData = Object.entries(stats.interviewTypes || {})
            .map(([type, count]) => ({
                label: type || 'Unknown',
                value: Math.max(0, Number(count) || 0),
            }))
            .filter(item => item.value > 0); // Only include items with positive values

        return { categoryChartData, weeklyChartData, interviewTypesData };
    }, [stats]);
};

// Main dashboard component with React Query
export default function ProgressDashboard({ userId }: ProgressDashboardProps) {
    const { data: stats, isLoading, error, refetch } = useUserStats(userId);
    
    // Always call useChartData to maintain hook order
    const { categoryChartData, weeklyChartData, interviewTypesData } = useChartData(stats || {});

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <ErrorDisplay error={error.message || 'An error occurred while loading data'} onRetry={() => refetch()} />;
    }

    if (!stats || stats.totalInterviews === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Interviews"
                    value={stats.totalInterviews || 0}
                    subtitle={`${stats.interviewsThisWeek || 0} this week`}
                    icon={BarChart3}
                    iconBg="from-blue-100 to-indigo-100"
                    iconColor="text-blue-600"
                />

                <MetricCard
                    title="Average Score"
                    value={`${stats.averageScore || 0}%`}
                    subtitle={`${Math.abs(stats.improvementRate || 0)}% from last month`}
                    icon={Target}
                    iconBg="from-green-100 to-blue-100"
                    iconColor="text-green-600"
                    valueColor={getScoreColor(stats.averageScore || 0)}
                    trend={(stats.improvementRate || 0) > 0 ? 'up' : 'down'}
                />

                <MetricCard
                    title="Best Score"
                    value={`${stats.bestScore || 0}%`}
                    subtitle="Personal best"
                    icon={Award}
                    iconBg="from-yellow-100 to-orange-100"
                    iconColor="text-yellow-600"
                />

                <MetricCard
                    title="Completion Rate"
                    value={`${Math.round(((stats.completedInterviews || 0) / (stats.totalInterviews || 1)) * 100)}%`}
                    subtitle={`${stats.completedInterviews || 0} completed`}
                    icon={Activity}
                    iconBg="from-purple-100 to-indigo-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {categoryChartData && Array.isArray(categoryChartData) && categoryChartData.length > 0 && (
                    <BarChart
                        title="Category Performance"
                        data={categoryChartData}
                        height={300}
                    />
                )}

                {weeklyChartData && Array.isArray(weeklyChartData) && weeklyChartData.length > 0 && (
                    <LineChart
                        title="Weekly Score Trend"
                        data={weeklyChartData}
                        height={300}
                    />
                )}
            </div>

            {/* Interview Types Distribution */}
            {interviewTypesData && Array.isArray(interviewTypesData) && interviewTypesData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DonutChart
                        title="Interview Types"
                        data={interviewTypesData}
                    />

                    <RecentPerformanceCard recentScores={stats.recentScores || []} />
                </div>
            )}

            {/* Strengths and Areas for Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StrengthsCard strengths={stats.strengths || []} />
                <AreasForImprovementCard areasForImprovement={stats.areasForImprovement || []} />
            </div>

            {/* Tech Stack Performance */}
            {stats.techStackPerformance && Object.keys(stats.techStackPerformance).length > 0 && (
                <TechStackPerformanceCard techStackPerformance={stats.techStackPerformance} />
            )}

            {/* Weekly Activity Chart */}
            {stats.weeklyProgress && Array.isArray(stats.weeklyProgress) && stats.weeklyProgress.some(w => w?.interviews > 0) && (
                <WeeklyActivityCard weeklyProgress={stats.weeklyProgress} />
            )}
        </div>
    );
}

// Memoized metric card component
const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    iconBg, 
    iconColor, 
    valueColor = "text-gray-900",
    trend 
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    valueColor?: string;
    trend?: 'up' | 'down';
}) => (
    <Card className="card-elevated hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <div className={`p-2 bg-gradient-to-r ${iconBg} rounded-lg`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
        </CardHeader>
        <CardContent>
            <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
                {trend && (
                    trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                    ) : (
                        <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                    )
                )}
                {subtitle}
            </div>
        </CardContent>
    </Card>
);

// Memoized recent performance card
const RecentPerformanceCard = ({ recentScores }: { recentScores: any[] }) => (
    <Card className="card-elevated">
        <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Performance
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {(recentScores || []).slice(0, 5).map((score, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                                (score?.score || 0) >= 80 ? 'bg-green-500' : 
                                (score?.score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-600">
                                Interview #{(recentScores || []).length - index}
                            </span>
                        </div>
                        <div className={`font-semibold ${getScoreColor(score?.score || 0)}`}>
                            {score?.score || 0}%
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

// Memoized strengths card
const StrengthsCard = ({ strengths }: { strengths: string[] }) => (
    <Card className="card-elevated">
        <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-green-600" />
                Your Strengths
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-3">
                {(strengths || []).length > 0 ? (
                    (strengths || []).map((strength, index) => (
                        <Badge 
                            key={index} 
                            className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200 px-4 py-2"
                        >
                            {strength}
                        </Badge>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm">Complete more interviews to see your strengths</p>
                )}
            </div>
        </CardContent>
    </Card>
);

// Memoized areas for improvement card
const AreasForImprovementCard = ({ areasForImprovement }: { areasForImprovement: string[] }) => (
    <Card className="card-elevated">
        <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                Focus Areas
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {(areasForImprovement || []).length > 0 ? (
                    (areasForImprovement || []).map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <span className="font-medium text-gray-900">{area}</span>
                            <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200">
                                Focus
                            </Badge>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm">Great job! No major areas for improvement identified</p>
                )}
            </div>
        </CardContent>
    </Card>
);

// Memoized tech stack performance card
const TechStackPerformanceCard = ({ techStackPerformance }: { techStackPerformance: any }) => (
    <Card className="card-elevated">
        <CardHeader>
            <CardTitle className="text-gray-900">Technology Performance</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(techStackPerformance || {}).map(([tech, data]: [string, any]) => (
                    <div key={tech} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{tech}</span>
                            <Badge variant="outline">{data?.count || 0} interviews</Badge>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(data?.avgScore || 0)}`}>
                            {data?.avgScore || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Average score</div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

// Memoized weekly activity card
const WeeklyActivityCard = ({ weeklyProgress }: { weeklyProgress: any[] }) => (
    <Card className="card-elevated">
        <CardHeader>
            <CardTitle className="text-gray-900">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-8 gap-2">
                {(weeklyProgress || []).map((week, index) => (
                    <div key={index} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">
                            {week?.week ? new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </div>
                        <div className={`h-16 rounded-lg flex flex-col items-center justify-center text-xs font-medium ${
                            (week?.interviews || 0) > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                            <span>{week?.interviews || 0}</span>
                            <span>interviews</span>
                        </div>
                        {(week?.averageScore || 0) > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                                {week.averageScore}%
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

