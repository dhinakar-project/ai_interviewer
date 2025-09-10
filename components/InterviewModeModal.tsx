"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Video, X, Headphones, Camera } from "lucide-react";

interface InterviewModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMode: (mode: 'audio' | 'video') => void;
    interviewTitle?: string;
}

export default function InterviewModeModal({
    isOpen,
    onClose,
    onSelectMode,
    interviewTitle = "Interview"
}: InterviewModeModalProps) {
    const [selectedMode, setSelectedMode] = useState<'audio' | 'video' | null>(null);

    if (!isOpen) return null;

    const handleModeSelect = (mode: 'audio' | 'video') => {
        setSelectedMode(mode);
        onSelectMode(mode);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Choose Interview Mode
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Select how you'd like to conduct your {interviewTitle}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Mode Selection */}
                <div className="p-6 space-y-4">
                    {/* Audio Mode */}
                    <Card
                        className={`p-4 cursor-pointer transition-all duration-200 border-2 hover:border-blue-200 hover:shadow-md ${
                            selectedMode === 'audio' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleModeSelect('audio')}
                    >
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-full ${
                                selectedMode === 'audio' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                <Mic className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Audio Interview
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Voice-only conversation with AI interviewer
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Headphones className="h-3 w-3" />
                                        <span>Voice AI</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Stable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Video Mode */}
                    <Card
                        className={`p-4 cursor-pointer transition-all duration-200 border-2 hover:border-purple-200 hover:shadow-md ${
                            selectedMode === 'video' 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => handleModeSelect('video')}
                    >
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-full ${
                                selectedMode === 'video' 
                                    ? 'bg-purple-500 text-white' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                <Video className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Video Interview
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Face-to-face video call with AI interviewer
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Camera className="h-3 w-3" />
                                        <span>Video AI</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span>Beta</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <div className="flex space-x-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => selectedMode && handleModeSelect(selectedMode)}
                            disabled={!selectedMode}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            Start Interview
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}






























