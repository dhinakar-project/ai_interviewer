"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "@/components/FormField";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signUp, signIn } from "@/lib/actions/auth.action";

type FormType = "sign-up" | "sign-in";

const authFormSchema = (type: FormType) =>
    z.object({
        name:
            type === "sign-up"
                ? z.string().min(3, "Name must be at least 3 characters")
                : z.string().optional(),
        email: z.string().email("Enter a valid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const isSignIn = type === "sign-in";
    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const { name, email, password } = values;

            if (type === "sign-up") {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                const result = await signUp({
                    uid: userCredential.user.uid,
                    name: name!, // we are sure it's defined here
                    email,
                });

                if (!result?.success) {
                    toast.error(result.message || "Failed to sign up.");
                    return;
                }

                toast.success("Account created successfully. Please sign in.");
                router.push("/sign-in");
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCredential.user.getIdToken();

                if (!idToken) {
                    toast.error("Failed to get ID token.");
                    return;
                }

                const result = await signIn({ email, idToken });

                if (!result?.success) {
                    toast.error(result.message || "Sign in failed.");
                    return;
                }

                toast.success("Signed in successfully.");
                router.push("/");
            }
        } catch (error: any) {
            console.error("Auth Error:", error);

            switch (error.code) {
                case "auth/email-already-in-use":
                    toast.error("Email already in use. Try signing in instead.");
                    break;
                case "auth/invalid-email":
                    toast.error("Invalid email address.");
                    break;
                case "auth/weak-password":
                    toast.error("Password should be at least 6 characters.");
                    break;
                case "auth/user-not-found":
                    toast.error("No account found with this email.");
                    break;
                case "auth/wrong-password":
                    toast.error("Incorrect password.");
                    break;
                default:
                    toast.error(`Unexpected error: ${error.message || error}`);
            }
        }
    };

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                {/* Logo & Header */}
                <div className="flex flex-row gap-2 justify-center">
                    <img src="/logo.svg" alt="logo" height={32} width={38} />
                    <h2 className="text-primary-100">Prepwise</h2>
                </div>
                <h3>Practice job interview with AI</h3>

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6 mt-4 form"
                    >
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                label="Name"
                                placeholder="Your Name"
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your Email Address"
                            type="email"
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter Your Password"
                            type="password"
                        />

                        <Button className="btn w-full" type="submit">
                            {isSignIn ? "Sign in" : "Create an Account"}
                        </Button>
                    </form>
                </Form>

                {/* Link to other form */}
                <p className="text-center">
                    {isSignIn ? "No account yet?" : "Already have an account?"}
                    <Link
                        href={isSignIn ? "/sign-up" : "/sign-in"}
                        className="font-bold text-user-primary ml-1"
                    >
                        {isSignIn ? "Sign up" : "Sign in"}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;


// "use client";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import FormField from "@/components/FormField";
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "@/firebase/client";
// import { signUp, signIn } from "@/lib/actions/auth.action";
//
// type FormType = "sign-up" | "sign-in";
//
// const authFormSchema = (type: FormType) => {
//     return z.object({
//         name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
//         email: z.string().email("Enter a valid email"),
//         password: z.string().min(3, "Password must be at least 3 characters"),
//     });
// };
//
// const AuthForm = ({ type }: { type: FormType }) => {
//     const router = useRouter();
//     const formSchema = authFormSchema(type);
//
//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             name: "",
//             email: "",
//             password: "",
//         },
//     });
//
//     const isSignIn = type === "sign-in";
//
//     const onSubmit = async (values: z.infer<typeof formSchema>) => {
//         try {
//             if (type === "sign-up") {
//                 const { name, email, password } = values;
//                 const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
//
//                 const result = await signUp({
//                     uid: userCredentials.user.uid,
//                     name: name!,
//                     password,
//                 });
//
//                 if (!result?.success) {
//                     toast.error(result?.message || "Failed to register.");
//                     return;
//                 }
//
//                 toast.success("Account created successfully. Please sign in.");
//                 router.push("/sign-in");
//             } else {
//                 const { email, password } = values;
//                 const userCredential = await signInWithEmailAndPassword(auth, email, password);
//                 const idToken = await userCredential.user.getIdToken();
//
//                 if (!idToken) {
//                     toast.error("There was an error signing in.");
//                     return;
//                 }
//
//                 const result = await signIn({ email, idToken });
//
//                 if (!result?.success) {
//                     toast.error(result?.message || "Sign in failed");
//                     return;
//                 }
//
//                 toast.success("Signed in successfully.");
//                 router.push("/");
//             }
//         } catch (error: any) {
//             console.error(error);
//             toast.error(`There was an error: ${error?.message || error}`);
//         }
//     };
//
//     return (
//         <div className="card-border lg:min-w-[566px]">
//             <div className="flex flex-col gap-6 card py-14 px-10">
//                 {/* Header */}
//                 <div className="flex flex-row gap-2 justify-center">
//                     <img src="/logo.svg" alt="logo" height={32} width={38} />
//                     <h2 className="text-primary-100">Prepwise</h2>
//                 </div>
//                 <h3>Practice job interview with AI</h3>
//
//                 {/* Form */}
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
//                         {!isSignIn && (
//                             <FormField
//                                 control={form.control}
//                                 name="name"
//                                 label="Name"
//                                 placeholder="Your Name"
//                             />
//                         )}
//                         <FormField
//                             control={form.control}
//                             name="email"
//                             label="Email"
//                             placeholder="Your Email Address"
//                             type="email"
//                         />
//                         <FormField
//                             control={form.control}
//                             name="password"
//                             label="Password"
//                             placeholder="Enter Your Password"
//                             type="password"
//                         />
//
//                         <Button className="btn w-full" type="submit">
//                             {isSignIn ? "Sign in" : "Create an Account"}
//                         </Button>
//                     </form>
//                 </Form>
//
//                 {/* Link */}
//                 <p className="text-center">
//                     {isSignIn ? "No account yet?" : "Already have an account?"}
//                     <Link
//                         href={isSignIn ? "/sign-up" : "/sign-in"}
//                         className="font-bold text-user-primary ml-1"
//                     >
//                         {isSignIn ? "Sign up" : "Sign in"}
//                     </Link>
//                 </p>
//             </div>
//         </div>
//     );
// };
//
// export default AuthForm;
