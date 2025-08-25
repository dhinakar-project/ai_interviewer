"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const passwordMin = 8;
const baseSchema = z.object({
    name: z.string().optional(),
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Enter a valid email address" }),
    password: z
        .string()
        .min(passwordMin, { message: `Password must be at least ${passwordMin} characters` }),
    remember: z.boolean().default(false),
});

type AuthFormValues = z.infer<typeof baseSchema>;

const authFormSchema = (type: FormType) => {
    if (type === "sign-up") {
        return baseSchema.superRefine((data, ctx) => {
            if (!data.name || data.name.trim().length < 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["name"],
                    message: "Name must be at least 3 characters",
                });
            }
        });
    }
    return baseSchema;
};

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const schema = authFormSchema(type);
    type FormValues = z.input<typeof schema>;
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            remember: false,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            if (type === "sign-up") {
                const { name, email, password } = data;

                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                const result = await signUp({
                    uid: userCredential.user.uid,
                    name: name!,
                    email,
                    password,
                });

                if (!result.success) {
                    toast.error(result.message);
                    setIsLoading(false);
                    return;
                }

                toast.success("Account created successfully. Please sign in.");
                router.push("/sign-in");
            } else {
                const { email, password, remember } = data;

                await setPersistence(
                    auth,
                    remember ? browserLocalPersistence : browserSessionPersistence
                );

                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                const idToken = await userCredential.user.getIdToken();
                if (!idToken) {
                    toast.error("Sign in Failed. Please try again.");
                    setIsLoading(false);
                    return;
                }

                await signIn({
                    email,
                    idToken,
                });

                toast.success("Signed in successfully.");
                router.push("/");
            }
        } catch (error) {
            console.log(error);
            toast.error(`There was an error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isSignIn = type === "sign-in";
    const isSubmitDisabled = useMemo(() => {
        return !form.formState.isValid || isLoading;
    }, [form.formState.isValid, isLoading]);

    return (
        <div className="max-w-sm w-full mx-auto">
            <div className="card p-8 rounded-xl shadow-md">
                <div className="flex items-center gap-2 justify-center">
                    <Image src="/logo.svg" alt="AI_Interviewer" height={32} width={38} />
                    <h2 className="h4 text-primary">AI_Interviewer</h2>
                </div>

                <div className="mt-6 text-center">
                    <h1 className="h3">Welcome back</h1>
                    <p className="text-body-sm text-muted-foreground mt-1">Sign in to continue your interview practice</p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="mt-6 space-y-4"
                        aria-live="polite"
                    >
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                label="Full name"
                                placeholder="Your name"
                                type="text"
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            label="Email address"
                            placeholder="you@example.com"
                            type="email"
                        />

                        {/* Password with toggle and forgot link */}
                        {/* Using custom field to add reveal toggle */}
                        <div>
                            <label className="label block mb-2" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    aria-invalid={!!form.formState.errors.password}
                                    aria-describedby="password-error"
                                    className="input pr-10"
                                    placeholder="Enter your password"
                                    {...form.register("password")}
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-2 my-auto px-2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.98 8.223a.75.75 0 011.037-.243c2.457 1.493 4.72 2.24 6.983 2.24 2.262 0 4.526-.747 6.983-2.24a.75.75 0 11.794 1.28c-2.592 1.577-5.2 2.46-7.777 2.46-2.577 0-5.185-.883-7.777-2.46a.75.75 0 01-.243-1.037z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3.22 3.22a.75.75 0 011.06 0l16.5 16.5a.75.75 0 11-1.06 1.06l-2.212-2.211C15.996 19.592 14.53 20 12.999 20 7.477 20 3 14 3 14s1.227-1.684 3.132-3.27L3.22 4.28a.75.75 0 010-1.06zM12.999 6c5.523 0 10 6 10 6s-.577.79-1.58 1.779l-2.236-2.236A3.75 3.75 0 0012.75 6h.25z" clipRule="evenodd"/></svg>
                                    )}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p id="password-error" className="text-body-sm text-destructive mt-1" role="alert">
                                    {form.formState.errors.password.message as string}
                                </p>
                            )}
                            {isSignIn && (
                                <div className="mt-2 text-right">
                                    <Link href="/forgot-password" className="text-body-sm text-primary hover:underline">Forgot password?</Link>
                                </div>
                            )}
                        </div>

                        {/* Remember me */}
                        {isSignIn && (
                            <label className="flex items-center gap-2 select-none">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded focus-visible:ring-ring"
                                    {...form.register("remember")}
                                />
                                <span className="text-body-sm text-muted-foreground">Remember me</span>
                            </label>
                        )}

                        <Button className="w-full bg-blue-600 hover:bg-blue-600/90 text-white" type="submit" disabled={isSubmitDisabled}>
                            {isLoading ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    <span>Signing in…</span>
                                </>
                            ) : (
                                <span>{isSignIn ? "Sign in" : "Create account"}</span>
                            )}
                        </Button>

                        {isSignIn && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={async () => {
                                    try {
                                        setIsLoading(true);
                                        const provider = new GoogleAuthProvider();
                                        const result = await signInWithPopup(auth, provider);
                                        const idToken = await result.user.getIdToken();
                                        await signIn({ email: result.user.email || "", idToken });
                                        router.push("/");
                                    } catch (e) {
                                        toast.error("Google sign-in failed. Please try again.");
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.6 18.9 14 24 14c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.1 4 9.3 8.2 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.8 26.7 36 24 36c-5.2 0-9.6-3.4-11.3-8.1l-6.5 5C9.2 40 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 2.6-3 4.6-5.5 6l.1.1 6.2 5.2C37.4 41.1 44 36 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
                                <span>Sign in with Google</span>
                            </Button>
                        )}
                    </form>
                </Form>

                <p className="text-center text-body-sm text-muted-foreground mt-6">
                    {isSignIn ? "Don't have an account?" : "Already have an account?"}
                    <Link
                        href={!isSignIn ? "/sign-in" : "/sign-up"}
                        className="font-medium text-primary ml-1 hover:underline"
                    >
                        {!isSignIn ? "Sign in" : "Sign up"}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;