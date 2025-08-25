"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { signOut } from "@/lib/actions/auth.action";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const SignOutPage = () => {
    const router = useRouter();

    useEffect(() => {
        const handleSignOut = async () => {
            try {
                const result = await signOut();
                if (result.success) {
                    toast.success("Signed out successfully");
                    router.push("/sign-in");
                } else {
                    toast.error("Failed to sign out. Please try again.");
                    router.push("/");
                }
            } catch (error) {
                console.error("Sign out error:", error);
                toast.error("Failed to sign out. Please try again.");
                router.push("/");
            }
        };

        handleSignOut();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="text-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600">Signing you out...</p>
            </div>
        </div>
    );
};

export default SignOutPage;
