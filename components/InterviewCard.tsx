import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Suspense, memo } from "react";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import { LoadingSpinner } from "./ui/loading-spinner";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = memo(async ({
                                 interviewId,
                                 userId,
                                 role,
                                 type,
                                 techstack,
                                 createdAt,
                             }: InterviewCardProps) => {
    const feedback =
        userId && interviewId
            ? await getFeedbackByInterviewId({
                interviewId,
                userId,
            })
            : null;

    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

    const badgeColor = {
        Behavioral: "bg-blue-100 text-blue-800 border-blue-200",
        Mixed: "bg-purple-100 text-purple-800 border-purple-200",
        Technical: "bg-indigo-100 text-indigo-800 border-indigo-200",
    }[normalizedType] || "bg-gray-100 text-gray-800 border-gray-200";

    const formattedDate = dayjs(
        feedback?.createdAt || createdAt || Date.now()
    ).format("MMM D, YYYY");

    return (
        <div className="card-elevated p-6 h-full">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <Image
                                src={getRandomInterviewCover()}
                                alt="cover-image"
                                width={32}
                                height={32}
                                className="rounded-lg object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 capitalize">{role} Interview</h3>
                            <p className="text-sm text-gray-600">{formattedDate}</p>
                        </div>
                    </div>
                    
                    <div className={cn("px-3 py-1 rounded-full text-xs font-medium border", badgeColor)}>
                        {normalizedType}
                    </div>
                </div>

                {/* Score Section */}
                {feedback && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Score</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">{feedback?.totalScore || "---"}</div>
                                <div className="text-xs text-gray-600">out of 100</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {feedback?.finalAssessment ||
                            "You haven't taken this interview yet. Take it now to improve your skills and get personalized feedback."}
                    </p>

                    {/* Tech Stack */}
                    {techstack && (
                        <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Tech Stack</p>
                            <DisplayTechIcons techStack={techstack} />
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <Button className="w-full btn-primary" asChild>
                        <Link
                            href={
                                feedback
                                    ? `/interview/${interviewId}/feedback`
                                    : `/interview/${interviewId}`
                            }
                        >
                            {feedback ? (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View Feedback
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Start Interview
                                </>
                            )}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
});

InterviewCard.displayName = "InterviewCard";

export default InterviewCard;