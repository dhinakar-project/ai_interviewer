import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: "User not authenticated" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const { interviewId, timestamp, metrics } = await request.json();

        if (!interviewId || !metrics) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing interviewId or metrics" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        await db.collection("gestureSnapshots").add({
            interviewId,
            userId: user.id,
            timestamp: timestamp || new Date().toISOString(),
            metrics,
            createdAt: new Date().toISOString(),
        });

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error saving gesture snapshot:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}




































