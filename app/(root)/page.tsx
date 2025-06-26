'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import { auth } from "@/firebase/client"; // ✅ use pre-initialized auth
import { onAuthStateChanged } from "firebase/auth"; // ✅ only this from Firebase

const Page = () => {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/auth/sign-up');
            }
        });

        return () => unsubscribe();
    }, []);

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
};

export default Page;


// 'use client';
//
// import React, { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
// import { Button } from "@/components/ui/button";
// import { dummyInterviews } from "@/constants";
// import InterviewCard from "@/components/InterviewCard";
// import { getAuth, onAuthStateChanged } from "firebase/auth"; // assuming Firebase
//
// const Page = () => {
//     const router = useRouter();
//
//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (!user) {
//                 router.push('/auth/sign-up');
//             }
//         });
//
//         return () => unsubscribe(); // cleanup
//     }, []);
//
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
//             {/* Available Interviews */}
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
