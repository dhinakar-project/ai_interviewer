'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/client'; // ✅ Correct import

import { useRouter } from 'next/navigation';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login'); // or '/signup' — depends on your flow
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe(); // clean up listener
    }, [router]);

    if (loading) return <div>Loading...</div>;

    return <>{children}</>;
};

export default AuthLayout;

// import React, {ReactNode} from 'react'
// import {isAuthenticated} from "@/lib/actions/auth.action";
// import {redirect} from "next/navigation";
//
// const  AuthLayout = async ({children}:{children: ReactNode}) => {
//     const isUserAuthenticated = await isAuthenticated();
//
//     if(isUserAuthenticated)redirect('/');
//     return <div className="auth-layout">{children}</div>
//
// }
// export default AuthLayout
