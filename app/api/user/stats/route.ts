import { NextRequest, NextResponse } from "next/server";
import { getUserPerformanceStats } from "@/lib/actions/general.action";
import redis, { CACHE_TTL, generateCacheKey } from "@/lib/redis";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const forceRefresh = searchParams.get('refresh') === 'true';

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check cache first
        const cacheKey = generateCacheKey('user-stats', userId);
        
        if (!forceRefresh) {
            try {
                const cachedStats = await redis.get(cacheKey);
                if (cachedStats) {
                    return NextResponse.json(JSON.parse(cachedStats));
                }
            } catch (error) {
                console.warn('Redis cache error:', error);
                // Continue without cache if Redis is unavailable
            }
        }

        const stats = await getUserPerformanceStats(userId);

        // Cache the result
        try {
            await redis.setex(cacheKey, CACHE_TTL.USER_STATS, JSON.stringify(stats));
        } catch (error) {
            console.warn('Failed to cache user stats:', error);
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user statistics' },
            { status: 500 }
        );
    }
}



