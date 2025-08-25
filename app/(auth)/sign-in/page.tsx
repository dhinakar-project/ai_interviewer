import AuthForm from "@/components/AuthForm";
import Image from "next/image";

const Page = () => {
    return (
        <main className="min-h-[calc(100dvh)] grid grid-cols-1 lg:grid-cols-2">
            <section className="flex items-center justify-center p-6">
                <AuthForm type="sign-in" />
            </section>
            <aside className="hidden lg:flex items-center justify-center bg-secondary/60 p-12">
                <div className="max-w-md text-center">
                    <Image src="/robot.png" alt="AI Interview Coach" width={420} height={420} className="mx-auto rounded-xl shadow-md" />
                    <h2 className="h4 mt-6">Practice smarter with AI</h2>
                    <p className="text-body-sm text-muted-foreground mt-2">Get instant feedback, improve your answers, and land your next role.</p>
                </div>
            </aside>
        </main>
    );
};

export default Page;