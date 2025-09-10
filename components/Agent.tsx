"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { useVapiCall, CallStatus } from "@/lib/hooks/useVapiCall";
import { useTranscript } from "@/lib/hooks/useTranscript";
import { useSpeechState } from "@/lib/hooks/useSpeechState";
import { InterviewInterface } from "@/components/InterviewInterface";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { Button } from "@/components/ui/button";

const Agent = ({
                   userName,
                   userId,
                   interviewId,
                   feedbackId,
                   type,
                   questions,
                   role,
                   level,
                   amount,
                   techstack,
                   userProfileURL,
                   hidden,
               }: AgentProps) => {
    const router = useRouter();
    
    const { callStatus, isLoading, error, handleCall, handleDisconnect } = useVapiCall({
        type,
        questions,
        userName,
        userId,
        role,
        level,
        amount,
        techstack,
    });
    
    const { messages, lastMessage } = useTranscript();
    const { isSpeaking } = useSpeechState();

    // Handle feedback generation when call ends
    useEffect(() => {
        if (callStatus === CallStatus.FINISHED && messages.length > 0) {
            handleGenerateFeedback(messages);
        }
    }, [callStatus, messages]);

    // Hidden control hooks for video mode
    useEffect(() => {
        if (!hidden) return;
        const onJoin = () => {
            handleCall();
        };
        const onEnd = () => {
            handleDisconnect();
        };
        window.addEventListener("agent-join", onJoin as EventListener);
        window.addEventListener("agent-end", onEnd as EventListener);
        return () => {
            window.removeEventListener("agent-join", onJoin as EventListener);
            window.removeEventListener("agent-end", onEnd as EventListener);
        };
    }, [hidden, handleCall, handleDisconnect]);

    const handleGenerateFeedback = async (messages: any[]) => {
        try {
            console.log("Generating feedback for interview:", interviewId);
            console.log("Messages count:", messages.length);

            const { success, feedbackId: id, error: serverError } = await createFeedback({
                interviewId: interviewId!,
                userId: userId!,
                transcript: messages,
                feedbackId,
            });

            console.log("Feedback generation result:", { success, feedbackId: id });

            if (success && id) {
                toast.success("Interview completed! Generating feedback...");
                setTimeout(() => {
                    router.push(`/interview/${interviewId}/feedback`);
                }, 1800);
            } else {
                console.error("Feedback generation failed - success:", success, "id:", id, "error:", serverError);
                toast.error("Feedback generation failed. Please try again.");
                throw new Error("Failed to save feedback");
            }
        } catch (error) {
            console.error("Error generating feedback:", error);
            toast.error("Failed to save interview feedback");
        }
    };

    if (hidden) {
        return (
            <div className="hidden">
                <button onClick={handleCall} aria-hidden></button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <InterviewInterface
                userName={userName}
                userProfileURL={userProfileURL}
                isSpeaking={isSpeaking}
                callStatus={callStatus}
                onStartCall={handleCall}
                onEndCall={handleDisconnect}
                isLoading={isLoading}
            />

            <TranscriptDisplay
                lastMessage={lastMessage}
                hasMessages={messages.length > 0}
            />

            {/* Error Display */}
            {error && (
                <div className="card-elevated p-6 border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-red-700 text-sm font-medium mb-2">Connection Error</p>
                            <p className="text-red-600 text-sm mb-3">{error}</p>
                            <Button
                                onClick={() => {/* setError(null) */}}
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-100"
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual feedback generation button for debugging */}
            {callStatus === CallStatus.FINISHED && messages.length > 0 && error && (
                <div className="text-center">
                    <Button
                        onClick={() => handleGenerateFeedback(messages)}
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generating Feedback...
                            </>
                        ) : (
                            "Retry Feedback Generation"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Agent;