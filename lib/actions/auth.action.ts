'use server';

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7; // in seconds

interface SignUpParams {
    uid: string;
    name: string;
    email: string;
}

interface SignInParams {
    email: string;
    idToken: string;
}

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();

        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists. Please login',
            };
        }

        await db.collection('users').doc(uid).set({
            name,
            email,
        });

        return {
            success: true,
            message: 'User created successfully',
        };
    } catch (error: any) {
        console.error('Error creating a user:', error);

        if (error.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: 'Email already exists.',
            };
        }

        return {
            success: false,
            message: 'Something went wrong.',
        };
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        await auth.getUserByEmail(email); // throws if not found
        await setSessionCookie(idToken);

        return {
            success: true,
            message: 'User logged in successfully.',
        };
    } catch (e) {
        console.error('Sign in error:', e);

        return {
            success: false,
            message: 'Failed to log into an account.',
        };
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies(); // ✅ fixed

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000, // ms
    });

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    return { success: true };
}
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore  = await cookies();
    const sessionCookie =cookieStore.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedClaims=await auth.verifySessionCookie(sessionCookie,true);
        const userRecored = await db.
        collection('users')
            .doc(decodedClaims.uid)
            .get();

        if(!userRecored.exists) return null;
        return{
            ... userRecored.data(),
            id:userRecored.id,
        }as User;

    }catch (e) {
        console.log(e);

        return null;
    }

}

export async function isAuthenticated(){
    const user=await getCurrentUser();

    return !!user;
}
/*'use server';

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7; // in seconds

interface SignUpParams {
    uid: string;
    name: string;
    email: string;
}

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();

        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists. Please login',
            };
        }

        await db.collection('users').doc(uid).set({
            name,
            email,
        })

        return {
            success: true,
            message: 'User created successfully',
        };
    } catch (error: any) {
        console.error('Error creating a user:', error);

        if (error.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: 'Email already exists.',
            };
        }

        return {
            success: false,
            message: 'Something went wrong.',
        };
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try{
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){
            return{
                success: false,
                message: 'User does not exist.Create an account first.',
            }
        }
        await setSessionCookie(idToken);
    }
    catch(e){
        console.log(e);

        return{
            success: false,
            message: 'Failed to log into an account.',
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = cookies(); // No await

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000, // in ms
    });

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    return { success: true };
}
*/