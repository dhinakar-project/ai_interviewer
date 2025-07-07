// "use server";
//
// import { auth, db } from "@/firebase/admin";
// import { cookies } from "next/headers";
//
// // Session duration (1 week)
// const SESSION_DURATION = 60 * 60 * 24 * 7;
//
// interface SignUpParams {
//     uid: string;
//     name: string;
//     email: string;
// }
//
// interface SignInParams {
//     email: string;
//     idToken: string;
// }
//
// export async function setSessionCookie(idToken: string) {
//     const cookieStore = cookies(); // ✅ NO await
//
//     const sessionCookie = await auth.createSessionCookie(idToken, {
//         expiresIn: SESSION_DURATION * 1000,
//     });
//
//     cookieStore.set("session", sessionCookie, {
//         maxAge: SESSION_DURATION,
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         path: "/",
//         sameSite: "lax",
//     });
// }
//
//
// export async function signUp(params: SignUpParams) {
//     const { uid, name, email } = params;
//
//     try {
//         const userRecord = await db.collection("users").doc(uid).get();
//         if (userRecord.exists) {
//             return {
//                 success: false,
//                 message: "User already exists. Please sign in.",
//             };
//         }
//
//         await db.collection("users").doc(uid).set({
//             name,
//             email,
//         });
//
//         return {
//             success: true,
//             message: "Account created successfully. Please sign in.",
//         };
//     } catch (error: any) {
//         console.error("Error creating user:", error);
//
//         if (error.code === "auth/email-already-exists") {
//             return {
//                 success: false,
//                 message: "This email is already in use",
//             };
//         }
//
//         return {
//             success: false,
//             message: "Failed to create account. Please try again.",
//         };
//     }
// }
//
// export async function signIn(params: SignInParams) {
//     const { email, idToken } = params;
//
//     try {
//         const userRecord = await auth.getUserByEmail(email);
//         if (!userRecord) {
//             return {
//                 success: false,
//                 message: "User does not exist. Create an account.",
//             };
//         }
//
//         await setSessionCookie(idToken);
//
//         return {
//             success: true,
//             message: "Signed in successfully.",
//         };
//     } catch (error: any) {
//         console.error("Error during signIn:", error);
//
//         return {
//             success: false,
//             message: "Failed to log into account. Please try again.",
//         };
//     }
// }
// export async function signOut() {
//     const cookieStore = cookies(); // ✅ NO await
//     cookieStore.delete("session");
// }
//
// export async function getCurrentUser(): Promise<User | null> {
//     const cookieStore = cookies(); // ✅ NO await
//
//     const sessionCookie = cookieStore.get("session")?.value;
//     if (!sessionCookie) return null;
//
//     try {
//         const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
//
//         const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
//         if (!userRecord.exists) return null;
//
//         return {
//             ...userRecord.data(),
//             id: userRecord.id,
//         } as User;
//     } catch (error) {
//         console.error("Error in getCurrentUser:", error);
//         return null;
//     }
// }
//
// export async function isAuthenticated() {
//     const user = await getCurrentUser();
//     return !!user;
// }
//
// export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
//     const interviews = await db
//         .collection("interviews")
//         .where("user_id", "==", userId)
//         .orderBy("createdAt", "desc")
//         .get();
//
//     return interviews.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//     })) as Interview[];
// }


"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION * 1000, // milliseconds
    });

    // Set cookie in the browser
    cookieStore.set("session", sessionCookie, {
        maxAge: SESSION_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });
}

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        // check if user exists in db
        const userRecord = await db.collection("users").doc(uid).get();
        if (userRecord.exists)
            return {
                success: false,
                message: "User already exists. Please sign in.",
            };

        // save user to db
        await db.collection("users").doc(uid).set({
            name,
            email,
            // profileURL,
            // resumeURL,
        });

        return {
            success: true,
            message: "Account created successfully. Please sign in.",
        };
    } catch (error: any) {
        console.error("Error creating user:", error);

        // Handle Firebase specific errors
        if (error.code === "auth/email-already-exists") {
            return {
                success: false,
                message: "This email is already in use",
            };
        }

        return {
            success: false,
            message: "Failed to create account. Please try again.",
        };
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord)
            return {
                success: false,
                message: "User does not exist. Create an account.",
            };

        await setSessionCookie(idToken);
    } catch (error: any) {
        console.log("");

        return {
            success: false,
            message: "Failed to log into account. Please try again.",
        };
    }
}

// Sign out user by clearing the session cookie
export async function signOut() {
    const cookieStore = await cookies();

    cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        // get user info from db
        const userRecord = await db
            .collection("users")
            .doc(decodedClaims.uid)
            .get();
        if (!userRecord.exists) return null;

        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    } catch (error) {
        console.log(error);

        // Invalid or expired session
        return null;
    }
}

// Check if user is authenticated
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}
export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db
        .collection('interviews')
        .where('user_id', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}



// // 'use server';
// //
// // import { db, auth } from "@/firebase/admin";
// // import { cookies } from "next/headers";
// //
// // const ONE_WEEK = 60 * 60 * 24 * 7; // in seconds
// //
// // interface SignUpParams {
// //     uid: string;
// //     name: string;
// //     email: string;
// // }
// //
// // interface SignInParams {
// //     email: string;
// //     idToken: string;
// // }
// //
// // export async function signUp(params: SignUpParams) {
// //     const { uid, name, email } = params;
// //
// //     try {
// //         const userRecord = await db.collection('users').doc(uid).get();
// //
// //         if (userRecord.exists) {
// //             return {
// //                 success: false,
// //                 message: 'User already exists. Please login',
// //             };
// //         }
// //
// //         await db.collection('users').doc(uid).set({
// //             name,
// //             email,
// //         });
// //
// //         return {
// //             success: true,
// //             message: 'User created successfully',
// //         };
// //     } catch (error: any) {
// //         console.error('Error creating a user:', error);
// //
// //         if (error.code === 'auth/email-already-exists') {
// //             return {
// //                 success: false,
// //                 message: 'Email already exists.',
// //             };
// //         }
// //
// //         return {
// //             success: false,
// //             message: 'Something went wrong.',
// //         };
// //     }
// // }
// //
// // export async function signIn(params: SignInParams) {
// //     const { email, idToken } = params;
// //
// //     try {
// //         await auth.getUserByEmail(email); // throws if not found
// //         await setSessionCookie(idToken);
// //
// //         return {
// //             success: true,
// //             message: 'User logged in successfully.',
// //         };
// //     } catch (e) {
// //         console.error('Sign in error:', e);
// //
// //         return {
// //             success: false,
// //             message: 'Failed to log into an account.',
// //         };
// //     }
// // }
// //
// // export async function setSessionCookie(idToken: string) {
// //     const cookieStore = await cookies(); // ✅ fixed
// //
// //     const sessionCookie = await auth.createSessionCookie(idToken, {
// //         expiresIn: ONE_WEEK * 1000, // ms
// //     });
// //
// //     cookieStore.set('session', sessionCookie, {
// //         maxAge: ONE_WEEK,
// //         httpOnly: true,
// //         secure: process.env.NODE_ENV === 'production',
// //         path: '/',
// //         sameSite: 'lax',
// //     });
// //
// //     return { success: true };
// // }
// // export async function getCurrentUser(): Promise<User | null> {
// //     const cookieStore  = await cookies();
// //     const sessionCookie =cookieStore.get('session')?.value;
// //     if (!sessionCookie) return null;
// //
// //     try {
// //         const decodedClaims=await auth.verifySessionCookie(sessionCookie,true);
// //         const userRecored = await db.
// //         collection('users')
// //             .doc(decodedClaims.uid)
// //             .get();
// //
// //         if(!userRecored.exists) return null;
// //         return{
// //             ... userRecored.data(),
// //             id:userRecored.id,
// //         }as User;
// //
// //     }catch (e) {
// //         console.log(e);
// //
// //         return null;
// //     }
// //
// // }
// //
// // export async function isAuthenticated(){
// //     const user=await getCurrentUser();
// //
// //     return !!user;
// // // }
