import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import redis, { CACHE_TTL, generateCacheKey } from "@/lib/redis";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type') || 'user';
        const forceRefresh = searchParams.get('refresh') === 'true';

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check cache first
        const cacheKey = generateCacheKey('interviews', userId, type, page.toString(), limit.toString());
        
        if (!forceRefresh) {
            try {
                const cachedData = await redis.get(cacheKey);
                if (cachedData) {
                    return NextResponse.json(JSON.parse(cachedData));
                }
            } catch (error) {
                console.warn('Redis cache error:', error);
            }
        }

        const offset = (page - 1) * limit;

        let query = db.collection("interviews");
        
        if (type === 'user') {
            query = query.where("userId", "==", userId);
        } else {
            query = query.where("finalized", "==", true)
                        .where("userId", "!=", userId);
        }

        // Get total count for pagination
        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        // Get paginated results (temporarily without orderBy to avoid index requirement)
        const interviewsSnapshot = await query
            .limit(limit)
            .offset(offset)
            .get();

        const interviews = interviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const result = {
            interviews,
            total,
            hasMore: offset + limit < total,
            page,
            limit,
        };

        // Cache the result
        try {
            await redis.setex(cacheKey, CACHE_TTL.INTERVIEW_LIST, JSON.stringify(result));
        } catch (error) {
            console.warn('Failed to cache interviews:', error);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch interviews' },
            { status: 500 }
        );
    }
}
