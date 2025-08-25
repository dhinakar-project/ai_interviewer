"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { signOut } from "@/lib/actions/auth.action";

const SignOutButton = () => {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        try {
            setIsSigningOut(true);
            const result = await signOut();
            
            if (result.success) {
                toast.success("Signed out successfully");
                router.push("/sign-in");
            } else {
                toast.error("Failed to sign out. Please try again.");
            }
        } catch (error) {
            console.error("Sign out error:", error);
            toast.error("Failed to sign out. Please try again.");
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            disabled={isSigningOut}
        >
            {isSigningOut ? (
                <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing out...
                </>
            ) : (
                "Sign Out"
            )}
        </Button>
    );
};

export default SignOutButton;





