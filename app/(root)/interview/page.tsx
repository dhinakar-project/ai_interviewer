import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getQuestionsByType } from "@/constants/interviews";
import { v4 as uuidv4 } from "uuid";

const Page = async () => {
    const user = await getCurrentUser();

    // Use predefined questions for better consistency
    const questions = getQuestionsByType("mixed");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-12">
                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <div className="space-y-4">
                            <h1 className="h1 text-gray-900">
                                Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Interview</span>
                            </h1>
                            <p className="text-body-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Practice with our advanced AI interviewer. This session includes a mix of behavioral and technical questions to help you prepare for real interviews.
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Voice AI Interviewer
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                Instant Feedback
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                Mixed Questions
                            </div>
                        </div>
                    </div>

                    {/* Interview Interface */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl blur-3xl"></div>
                        <div className="relative">
                            <Agent
                                userName={user?.name ?? ""}
                                userId={user?.id ?? ""}
                                interviewId="interview-xyz"
                                feedbackId={uuidv4()}
                                type="custom"
                                questions={questions}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
