"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

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
               }: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => {
            console.log("speech start");
            setIsSpeaking(true);
        };

        const onSpeechEnd = () => {
            console.log("speech end");
            setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.error("VAPI Error:", error);
            setError(error.message);
            toast.error("Connection error. Please try again.");
            setCallStatus(CallStatus.INACTIVE);
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    const handleGenerateFeedback = useCallback(async (messages: SavedMessage[]) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log("Generating feedback for interview:", interviewId);
            console.log("Messages count:", messages.length);

            const { success, feedbackId: id } = await createFeedback({
                interviewId: interviewId!,
                userId: userId!,
                transcript: messages,
                feedbackId,
            });

            console.log("Feedback generation result:", { success, feedbackId: id });

            if (success && id) {
                toast.success("Interview completed! Generating feedback...");
                // Add a small delay to ensure feedback is saved before redirecting
                setTimeout(() => {
                    router.push(`/interview/${interviewId}/feedback`);
                }, 1000);
            } else {
                console.error("Feedback generation failed - success:", success, "id:", id);
                toast.error("Feedback generation failed. Please try again.");
                throw new Error("Failed to save feedback");
            }
        } catch (error) {
            console.error("Error generating feedback:", error);
            setError("Failed to generate feedback. Please try again.");
            toast.error("Failed to save interview feedback");
        } finally {
            setIsLoading(false);
        }
    }, [interviewId, userId, feedbackId, router]);

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        if (callStatus === CallStatus.FINISHED) {
            console.log("Call finished, messages count:", messages.length);
            if (type === "generate") {
                router.push("/");
            } else {
                // Only generate feedback if we have messages
                if (messages.length > 0) {
                    handleGenerateFeedback(messages);
                } else {
                    console.log("No messages to generate feedback from");
                    toast.error("No conversation data to analyze. Please try the interview again.");
                }
            }
        }
    }, [messages, callStatus, handleGenerateFeedback, type, router]);

    const handleCall = async () => {
        try {
            setCallStatus(CallStatus.CONNECTING);
            setError(null);
            setIsLoading(true);

            if (type === "generate") {
                await vapi.start(
                    undefined,
                    undefined,
                    undefined,
                    process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
                    {
                        variableValues: {
                            username: userName,
                            userid: userId,
                            role: role ?? "",
                            level: level ?? "",
                            amount: amount ?? "",
                            techstack: techstack ?? "",
                            type: "technical"
                        },
                    }
                );
            } else {
                let formattedQuestions = "";
                if (questions) {
                    formattedQuestions = questions
                        .map((question) => `- ${question}`)
                        .join("\n");
                }

                await vapi.start(interviewer, {
                    variableValues: {
                        questions: formattedQuestions,
                    },
                });
            }
        } catch (error) {
            console.error("Error starting call:", error);
            setError("Failed to start interview. Please check your connection and try again.");
            toast.error("Failed to start interview");
            setCallStatus(CallStatus.INACTIVE);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Call Interface */}
            <div className="card-elevated p-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* AI Interviewer Card */}
                    <div className="text-center space-y-6">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center relative">
                                <Image
                                    src="/ai-avatar.png"
                                    alt="AI Interviewer"
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover"
                                />
                                {isSpeaking && (
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                                )}
                            </div>
                            {isSpeaking && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Interviewer</h3>
                            <p className="text-gray-600">
                                {isSpeaking ? "Speaking..." : "Ready to interview"}
                            </p>
                        </div>
                    </div>

                    {/* User Profile Card */}
                    <div className="text-center space-y-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                            <Image
                                src="/user-avatar-cyan.svg"
                                alt="User Profile"
                                width={120}
                                height={120}
                                className="rounded-full object-cover w-full h-full"
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{userName}</h3>
                            <p className="text-gray-600">Interview Participant</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transcript Section */}
            {messages.length > 0 && (
                <div className="card-elevated p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Live Transcript</h4>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
                        <p
                            key={lastMessage}
                            className={cn(
                                "text-gray-700 text-center leading-relaxed transition-all duration-500",
                                "animate-fadeIn"
                            )}
                        >
                            {lastMessage || "Your conversation will appear here..."}
                        </p>
                    </div>
                </div>
            )}

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
                                onClick={() => setError(null)}
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

            {/* Control Buttons */}
            <div className="flex justify-center">
                {callStatus !== "ACTIVE" ? (
                    <Button
                        className={cn(
                            "btn-primary btn-lg relative min-w-[200px]",
                            callStatus === "CONNECTING" && "animate-pulse"
                        )}
                        onClick={handleCall}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {callStatus === "INACTIVE" || callStatus === "FINISHED"
                                    ? "Start Interview"
                                    : "Connecting..."}
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        className="btn-destructive btn-lg min-w-[200px]"
                        onClick={handleDisconnect}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        End Interview
                    </Button>
                )}
            </div>

            {/* Status Indicator */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        callStatus === "INACTIVE" && "bg-gray-400",
                        callStatus === "CONNECTING" && "bg-yellow-500 animate-pulse",
                        callStatus === "ACTIVE" && "bg-green-500 animate-pulse",
                        callStatus === "FINISHED" && "bg-blue-500"
                    )}></div>
                    <span className="text-sm text-gray-600 font-medium">
                        {callStatus === "INACTIVE" && "Ready to start"}
                        {callStatus === "CONNECTING" && "Connecting..."}
                        {callStatus === "ACTIVE" && "Interview in progress"}
                        {callStatus === "FINISHED" && "Interview completed"}
                    </span>
                </div>
                
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
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Generating Feedback...
                                </>
                            ) : (
                                "Retry Feedback Generation"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Agent;