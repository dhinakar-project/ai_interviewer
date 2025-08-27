import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET() {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: "User not authenticated" }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        return new Response(
            JSON.stringify({ success: true, user }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error getting current user:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
