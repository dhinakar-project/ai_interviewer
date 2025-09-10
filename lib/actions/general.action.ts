"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import redis, { CACHE_TTL } from "@/lib/redis";

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId, gestureSummary } = params;

    try {
        console.log("Creating feedback for interview:", interviewId);
        console.log("Transcript length:", transcript.length);

        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        console.log("Formatted transcript:", formattedTranscript.substring(0, 200) + "...");

        // Retry generation to reduce transient model/schema failures
        const maxRetries = 3;
        const backoffMs = (attempt: number) => attempt * 500;
        let object: any = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const { object: generated } = await generateObject({
                    model: google("gemini-2.0-flash-001", {
                        structuredOutputs: true,
                    }),
                    schema: feedbackSchema,
                    prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem Solving**: Ability to analyze problems and propose solutions.
        - **Cultural Fit**: Alignment with company values and job role.
        - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.
        `,
                    system:
                        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
                });
                object = generated;
                break;
            } catch (err) {
                console.warn(`Feedback generation attempt ${attempt} failed`, err);
                if (attempt < maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, backoffMs(attempt)));
                    continue;
                }
                throw err;
            }
        }

        console.log("Generated feedback object:", object);
        if (!object) {
            return { success: false, error: "Model returned no object" } as any;
        }

        // Compute a simple body language score if gestureSummary present
        const bodyLanguageScore = gestureSummary
            ? Math.round(
                  [
                      gestureSummary.eyeContactPct ?? 60,
                      100 - Math.abs((gestureSummary.postureStability ?? 75) - 75),
                      50 + Math.min(50, (gestureSummary.handMovementIntensity ?? 40)),
                  ].reduce((a, b) => a + b, 0) / 3
              )
            : undefined;

        const feedback: any = {
            interviewId: interviewId,
            userId: userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            createdAt: new Date().toISOString(),
        };

        if (typeof bodyLanguageScore === "number") {
            feedback.bodyLanguageScore = bodyLanguageScore;
        }
        if (gestureSummary && Object.keys(gestureSummary).length > 0) {
            feedback.gestureMetrics = gestureSummary;
        }

        let feedbackRef;

        if (feedbackId) {
            feedbackRef = db.collection("feedback").doc(feedbackId);
        } else {
            feedbackRef = db.collection("feedback").doc();
        }

        await feedbackRef.set(feedback);

        return { success: true, feedbackId: feedbackRef.id } as any;
    } catch (error) {
        console.error("Error saving feedback:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message } as any;
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db.collection("interviews").doc(id).get();

    return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const querySnapshot = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        .where("userId", "==", userId)
        .limit(1)
        .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection("interviews")
        .orderBy("createdAt", "desc")
        .where("finalized", "==", true)
        .where("userId", "!=", userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}

export async function getInterviewsByUserId(
    userId: string
): Promise<Interview[] | null> {
    const interviews = await db
        .collection("interviews")
        .where("userId", "==", userId)
        .get();

    const result = interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];

    // Sort by createdAt in memory (descending order)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getUserPerformanceStats(userId: string) {
    try {
        // Use Redis cache if available
        const cacheKey = `user-stats:${userId}`;
        try {
            const cachedStats = await redis.get(cacheKey);
            if (cachedStats) {
                return JSON.parse(cachedStats);
            }
        } catch (error) {
            console.warn('Redis cache error:', error);
        }

        // Optimized database queries with pagination and aggregation
        const batchSize = 50; // Process in batches to avoid memory issues
        
        // Get interviews with pagination (temporarily without orderBy to avoid index requirement)
        const interviewsSnapshot = await db
            .collection("interviews")
            .where("userId", "==", userId)
            .limit(batchSize)
            .get();

        const interviews = interviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Interview[];

        // Sort interviews by createdAt in memory (temporary solution)
        interviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Get feedback with pagination (temporarily without orderBy to avoid index requirement)
        const feedbackSnapshot = await db
            .collection("feedback")
            .where("userId", "==", userId)
            .limit(batchSize)
            .get();

        const feedbacks = feedbackSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Feedback[];

        // Sort feedbacks by createdAt in memory (temporary solution)
        feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (interviews.length === 0) {
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
            };

            // Cache empty result
            try {
                await redis.setex(cacheKey, CACHE_TTL.USER_STATS, JSON.stringify(emptyStats));
            } catch (error) {
                console.warn('Failed to cache empty stats:', error);
            }

            return emptyStats;
        }

        // Calculate basic stats efficiently
        const totalInterviews = interviews.length;
        const completedInterviews = feedbacks.length;
        const averageScore = completedInterviews > 0 
            ? Math.round(feedbacks.reduce((sum, f) => sum + f.totalScore, 0) / completedInterviews)
            : 0;
        const bestScore = completedInterviews > 0 
            ? Math.max(...feedbacks.map(f => f.totalScore))
            : 0;

        // Calculate time-based stats with date filtering
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const interviewsThisWeek = interviews.filter(i => 
            new Date(i.createdAt) >= oneWeekAgo
        ).length;

        const interviewsThisMonth = interviews.filter(i => 
            new Date(i.createdAt) >= oneMonthAgo
        ).length;

        // Calculate improvement rate efficiently
        let improvementRate = 0;
        if (feedbacks.length >= 10) {
            const recent5 = feedbacks.slice(0, 5);
            const previous5 = feedbacks.slice(5, 10);
            const recentAvg = recent5.reduce((sum, f) => sum + f.totalScore, 0) / 5;
            const previousAvg = previous5.reduce((sum, f) => sum + f.totalScore, 0) / 5;
            improvementRate = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
        }

        // Optimize category averages calculation
        const categoryAverages: Record<string, number> = {};
        if (completedInterviews > 0) {
            const categorySums: Record<string, number> = {};
            const categoryCounts: Record<string, number> = {};

            feedbacks.forEach(feedback => {
                feedback.categoryScores?.forEach(category => {
                    if (!categorySums[category.name]) {
                        categorySums[category.name] = 0;
                        categoryCounts[category.name] = 0;
                    }
                    categorySums[category.name] += category.score;
                    categoryCounts[category.name] += 1;
                });
            });

            Object.keys(categorySums).forEach(category => {
                categoryAverages[category] = Math.round(categorySums[category] / categoryCounts[category]);
            });
        }

        // Get recent scores (limit to 10 for performance)
        const recentScores = feedbacks.slice(0, 10).map(f => ({
            score: f.totalScore,
            date: f.createdAt,
            interviewId: f.interviewId,
        }));

        // Optimize strengths and areas for improvement aggregation
        const allStrengths: string[] = [];
        const allAreasForImprovement: string[] = [];

        feedbacks.forEach(feedback => {
            allStrengths.push(...(feedback.strengths || []));
            allAreasForImprovement.push(...(feedback.areasForImprovement || []));
        });

        // Count frequency efficiently
        const strengthCounts: Record<string, number> = {};
        const areaCounts: Record<string, number> = {};

        allStrengths.forEach(strength => {
            strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
        });

        allAreasForImprovement.forEach(area => {
            areaCounts[area] = (areaCounts[area] || 0) + 1;
        });

        const strengths = Object.entries(strengthCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([strength]) => strength);

        const areasForImprovement = Object.entries(areaCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([area]) => area);

        // Optimize interview types analysis
        const interviewTypes: Record<string, number> = {};
        interviews.forEach(interview => {
            interviewTypes[interview.type] = (interviewTypes[interview.type] || 0) + 1;
        });

        // Optimize tech stack performance calculation
        const techStackPerformance: Record<string, { count: number; avgScore: number }> = {};
        interviews.forEach(interview => {
            interview.techstack?.forEach(tech => {
                if (!techStackPerformance[tech]) {
                    techStackPerformance[tech] = { count: 0, avgScore: 0 };
                }
                techStackPerformance[tech].count += 1;
            });
        });

        // Calculate average scores for tech stacks efficiently
        Object.keys(techStackPerformance).forEach(tech => {
            const techInterviews = interviews.filter(i => i.techstack?.includes(tech));
            const techFeedbacks = feedbacks.filter(f => 
                techInterviews.some(i => i.id === f.interviewId)
            );
            if (techFeedbacks.length > 0) {
                techStackPerformance[tech].avgScore = Math.round(
                    techFeedbacks.reduce((sum, f) => sum + f.totalScore, 0) / techFeedbacks.length
                );
            }
        });

        // Optimize weekly progress calculation (last 8 weeks)
        const weeklyProgress = [];
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            const weekInterviews = interviews.filter(i => {
                const interviewDate = new Date(i.createdAt);
                return interviewDate >= weekStart && interviewDate < weekEnd;
            });
            
            const weekFeedbacks = feedbacks.filter(f => {
                const feedbackDate = new Date(f.createdAt);
                return feedbackDate >= weekStart && feedbackDate < weekEnd;
            });

            const weekAvgScore = weekFeedbacks.length > 0
                ? Math.round(weekFeedbacks.reduce((sum, f) => sum + f.totalScore, 0) / weekFeedbacks.length)
                : 0;

            weeklyProgress.push({
                week: weekStart.toISOString().split('T')[0],
                interviews: weekInterviews.length,
                averageScore: weekAvgScore,
            });
        }

        // Optimize monthly progress calculation (last 6 months)
        const monthlyProgress = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            
            const monthInterviews = interviews.filter(i => {
                const interviewDate = new Date(i.createdAt);
                return interviewDate >= monthStart && interviewDate <= monthEnd;
            });
            
            const monthFeedbacks = feedbacks.filter(f => {
                const feedbackDate = new Date(f.createdAt);
                return feedbackDate >= monthStart && feedbackDate <= monthEnd;
            });

            const monthAvgScore = monthFeedbacks.length > 0
                ? Math.round(monthFeedbacks.reduce((sum, f) => sum + f.totalScore, 0) / monthFeedbacks.length)
                : 0;

            monthlyProgress.push({
                month: monthStart.toISOString().slice(0, 7),
                interviews: monthInterviews.length,
                averageScore: monthAvgScore,
            });
        }

        const result = {
            totalInterviews,
            completedInterviews,
            averageScore,
            bestScore,
            interviewsThisWeek,
            interviewsThisMonth,
            improvementRate,
            categoryAverages,
            recentScores,
            strengths,
            areasForImprovement,
            interviewTypes,
            techStackPerformance,
            weeklyProgress,
            monthlyProgress,
        };

        // Cache the result
        try {
            await redis.setex(cacheKey, CACHE_TTL.USER_STATS, JSON.stringify(result));
        } catch (error) {
            console.warn('Failed to cache user stats:', error);
        }

        return result;
    } catch (error) {
        console.error("Error fetching user performance stats:", error);
        throw error;
    }
}