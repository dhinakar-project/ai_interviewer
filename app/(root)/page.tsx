import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ProgressDashboard from "@/components/ProgressDashboard";
import SignOutButton from "@/components/SignOutButton";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
    getInterviewsByUserId,
    getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
    const user = await getCurrentUser();

    if (!user || !user.id) {
        redirect("/sign-in");
    }

    const [userInterviews, allInterview] = await Promise.all([
        getInterviewsByUserId(user.id),
        getLatestInterviews({ userId: user.id }),
    ]);

    const hasPastInterviews = userInterviews?.length! > 0;
    const hasUpcomingInterviews = allInterview?.length! > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">AI Interviewer</h1>
                            <p className="text-sm text-gray-600">Professional Interview Practice</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Welcome back,</p>
                            <p className="text-sm text-gray-600">{user?.name}</p>
                        </div>
                        <SignOutButton />
                    </div>
                </header>

                {/* Hero Section */}
                <section className="mb-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="h1 text-gray-900">
                                    Master Your Interview Skills with
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> AI-Powered Practice</span>
                                </h1>
                                <p className="text-body-lg text-gray-600 leading-relaxed">
                                    Practice with our advanced AI interviewer and get instant, personalized feedback to boost your confidence and performance in real interviews.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button asChild className="btn-primary btn-lg">
                                    <Link href="/interview">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Start Practice Interview
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="btn-lg">
                                    <Link href="/interview/create">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Custom Interview
                                    </Link>
                                </Button>
                            </div>

                            <div className="flex items-center gap-8 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Real-time Voice AI
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    Instant Feedback
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                    Progress Tracking
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-3xl"></div>
                            <div className="relative">
                                <Image
                                    src="/robot.png"
                                    alt="AI Interviewer"
                                    width={500}
                                    height={500}
                                    className="w-full h-auto animate-float"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Progress Dashboard */}
                {hasPastInterviews && (
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="h2 text-gray-900">Your Progress</h2>
                                <p className="text-body text-gray-600 mt-2">Track your interview performance and improvements</p>
                            </div>
                        </div>
                        <ProgressDashboard userId={user.id} />
                    </section>
                )}

                {/* Interview History */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="h2 text-gray-900">Interview History</h2>
                            <p className="text-body text-gray-600 mt-2">Review your past interviews and track your growth</p>
                        </div>
                        {hasPastInterviews && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/interviews">View All</Link>
                            </Button>
                        )}
                    </div>

                    <div className="grid-auto-fit">
                        {hasPastInterviews ? (
                            <Suspense fallback={
                                <div className="flex justify-center items-center h-32">
                                    <LoadingSpinner size="lg" />
                                </div>
                            }>
                                {userInterviews?.map((interview, index) => (
                                    <div
                                        key={interview.id}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                        className="animate-slideInUp"
                                    >
                                        <InterviewCard
                                            userId={user?.id}
                                            interviewId={interview.id}
                                            role={interview.role}
                                            type={interview.type}
                                            techstack={interview.techstack}
                                            createdAt={interview.createdAt}
                                        />
                                    </div>
                                ))}
                            </Suspense>
                        ) : (
                            <div className="col-span-full">
                                <div className="card-elevated p-12 text-center">
                                    <div className="mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="h3 text-gray-900 mb-2">No interviews yet</h3>
                                        <p className="text-body text-gray-600 mb-6">
                                            Start your first interview to see your progress history here
                                        </p>
                                        <Button asChild className="btn-primary btn-lg">
                                            <Link href="/interview">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Start Your First Interview
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Available Interviews */}
                {hasUpcomingInterviews && (
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="h2 text-gray-900">Available Interviews</h2>
                                <p className="text-body text-gray-600 mt-2">Take these interviews to improve your skills</p>
                            </div>
                        </div>

                        <div className="grid-auto-fit">
                            {allInterview?.map((interview) => (
                                <InterviewCard
                                    key={interview.id}
                                    userId={user?.id}
                                    interviewId={interview.id}
                                    role={interview.role}
                                    type={interview.type}
                                    techstack={interview.techstack}
                                    createdAt={interview.createdAt}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Home;