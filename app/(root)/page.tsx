import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";

export default async function HomePage() {
    const isUserAuthenticated = await isAuthenticated();

    if (!isUserAuthenticated) {
        redirect("/auth/sign-up");
    }

    return (
        <div className="p-4">
            {/* Navigation */}
            <nav className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={38} height={32} />
                    <h2 className="text-primary-100">PrepWise</h2>
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="card-cta p-8 mt-12 flex flex-col sm:flex-row items-center gap-8">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2 className="text-2xl font-bold">
                        Get Interview-Ready with AI-powered Practice & Feedback
                    </h2>
                    <p className="text-muted-foreground">
                        Practice on real interview questions & get instant feedback
                    </p>
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                <Image
                    src="/robot.png"
                    alt="robo-dude"
                    width={400}
                    height={400}
                    className="max-sm:hidden"
                />
            </section>

            {/* User Interviews */}
            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>
                <div className="interviews-section flex flex-wrap gap-4">
                    {dummyInterviews.map((interview) => (
                        <InterviewCard
                            key={interview.id}
                            interviewId={interview.id}
                            userId={interview.userId}
                            role={interview.role}
                            type={interview.type}
                            techstack={interview.techstack}
                            createdAt={interview.createdAt}
                        />
                    ))}
                </div>
            </section>

            {/* Available Interviews */}
            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>
                <div className="interviews-section flex flex-wrap gap-4">
                    {dummyInterviews.map((interview) => (
                        <InterviewCard
                            key={interview.id}
                            interviewId={interview.id}
                            userId={interview.userId}
                            role={interview.role}
                            type={interview.type}
                            techstack={interview.techstack}
                            createdAt={interview.createdAt}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

// import React from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { Button } from "@/components/ui/button";
// import { dummyInterviews } from "@/constants";
// import InterviewCard from "@/components/InterviewCard";
//
// const Page = () => {
//     return (
//         <div className="p-4">
//             {/* Navigation */}
//             <nav className="flex items-center gap-4">
//                 <Link href="/" className="flex items-center gap-2">
//                     <Image src="/logo.svg" alt="Logo" width={38} height={32} />
//                     <h2 className="text-primary-100">PrepWise</h2>
//                 </Link>
//             </nav>
//
//             {/* Hero Section */}
//             <section className="card-cta p-8 mt-12 flex flex-col sm:flex-row items-center gap-8">
//                 <div className="flex flex-col gap-6 max-w-lg">
//                     <h2 className="text-2xl font-bold">
//                         Get Interview-Ready with AI-powered Practice & Feedback
//                     </h2>
//                     <p className="text-muted-foreground">
//                         Practice on real interview questions & get instant feedback
//                     </p>
//                     <Button asChild className="btn-primary max-sm:w-full">
//                         <Link href="/interview">Start an Interview</Link>
//                     </Button>
//                 </div>
//
//                 <Image
//                     src="/robot.png"
//                     alt="robo-dude"
//                     width={400}
//                     height={400}
//                     className="max-sm:hidden"
//                 />
//             </section>
//
//             {/* User Interviews */}
//             <section className="flex flex-col gap-6 mt-8">
//                 <h2>Your Interviews</h2>
//                 <div className="interviews-section flex flex-wrap gap-4">
//                     {dummyInterviews.map((interview) => (
//                         <InterviewCard
//                             key={interview.id}
//                             interviewId={interview.id}
//                             userId={interview.userId}
//                             role={interview.role}
//                             type={interview.type}
//                             techstack={interview.techstack}
//                             createdAt={interview.createdAt}
//                         />
//                     ))}
//                 </div>
//             </section>
//
//             {/* Available Interviews (duplicated demo list for now) */}
//             <section className="flex flex-col gap-6 mt-8">
//                 <h2>Take an Interview</h2>
//                 <div className="interviews-section flex flex-wrap gap-4">
//                     {dummyInterviews.map((interview) => (
//                         <InterviewCard
//                             key={interview.id}
//                             interviewId={interview.id}
//                             userId={interview.userId}
//                             role={interview.role}
//                             type={interview.type}
//                             techstack={interview.techstack}
//                             createdAt={interview.createdAt}
//                         />
//                     ))}
//                 </div>
//             </section>
//         </div>
//     );
// };
//
// export default Page;
//