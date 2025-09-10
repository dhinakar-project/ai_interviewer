"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Agent from "@/components/Agent";
import InterviewModeModal from "@/components/InterviewModeModal";
import { Button } from "@/components/ui/button";
import { Play, Mic, Video } from "lucide-react";

const VideoInterview = dynamic(() => import("@/components/VideoInterview"), { ssr: false });

interface Props {
    interviewId: string;
    userId: string;
    userName: string;
    userProfileURL?: string;
    questions: string[];
    feedbackId?: string;
    interviewTitle?: string;
}

export default function InterviewMode(props: Props) {
    const { interviewId, userId, userName, userProfileURL, questions, feedbackId, interviewTitle } = props;
    const [showModal, setShowModal] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'audio' | 'video' | null>(null);
    const [isStarted, setIsStarted] = useState(false);

    const handleStartInterview = () => {
        setShowModal(true);
    };

    const handleModeSelect = (mode: 'audio' | 'video') => {
        setSelectedMode(mode);
        setIsStarted(true);
        setShowModal(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Show start button if interview hasn't started
    if (!isStarted) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                            <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Ready to Start?
                        </h2>
                        <p className="text-gray-600">
                            Choose your preferred interview mode and begin your practice session.
                        </p>
                    </div>
                    
                    <Button
                        onClick={handleStartInterview}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                    >
                        <Play className="h-5 w-5 mr-2" />
                        Start Interview
                    </Button>
                </div>

                <InterviewModeModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onSelectMode={handleModeSelect}
                    interviewTitle={interviewTitle}
                />
            </div>
        );
    }

    // Show the selected interview mode
    if (selectedMode === 'video') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500 rounded-full">
                            <Video className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Video Interview Mode</h3>
                            <p className="text-sm text-gray-600">Face-to-face conversation with AI</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsStarted(false);
                            setSelectedMode(null);
                        }}
                    >
                        Change Mode
                    </Button>
                </div>
                
                <VideoInterview interviewId={interviewId} userId={userId} />
                <Agent
                    userName={userName}
                    userId={userId}
                    interviewId={interviewId}
                    type="custom"
                    questions={questions}
                    feedbackId={feedbackId}
                    userProfileURL={userProfileURL}
                    hidden
                />
            </div>
        );
    }

    // Audio mode (default)
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-full">
                        <Mic className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Audio Interview Mode</h3>
                        <p className="text-sm text-gray-600">Voice-only conversation with AI</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setIsStarted(false);
                        setSelectedMode(null);
                    }}
                >
                    Change Mode
                </Button>
            </div>
            
            <Agent
                userName={userName}
                userId={userId}
                interviewId={interviewId}
                type="custom"
                questions={questions}
                feedbackId={feedbackId}
                userProfileURL={userProfileURL}
            />
        </div>
    );
}


