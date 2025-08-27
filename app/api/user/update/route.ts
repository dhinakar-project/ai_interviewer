import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";

export async function PUT(request: Request) {
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

        const { 
            name, 
            email, 
            profileURL, 
            profession, 
            isStudent, 
            graduationYear, 
            university, 
            experience, 
            location, 
            bio 
        } = await request.json();

        // Validate input
        if (!name || !name.trim()) {
            return new Response(
                JSON.stringify({ success: false, message: "Name is required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Update user in database
        const updatedUserData = {
            name: name.trim(),
            email: user.email, // Keep original email
            profileURL: profileURL || null,
            profession: profession || null,
            isStudent: isStudent || false,
            graduationYear: graduationYear || null,
            university: university || null,
            experience: experience || null,
            location: location || null,
            bio: bio || null,
            updatedAt: new Date().toISOString(),
        };

        await db.collection("users").doc(user.id).update(updatedUserData);

        const updatedUser = {
            id: user.id,
            name: updatedUserData.name,
            email: updatedUserData.email,
            profileURL: updatedUserData.profileURL,
            profession: updatedUserData.profession,
            isStudent: updatedUserData.isStudent,
            graduationYear: updatedUserData.graduationYear,
            university: updatedUserData.university,
            experience: updatedUserData.experience,
            location: updatedUserData.location,
            bio: updatedUserData.bio,
        };

        return new Response(
            JSON.stringify({ success: true, user: updatedUser }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error updating user profile:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
