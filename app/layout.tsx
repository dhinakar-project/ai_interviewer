import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

const monaSans = Mona_Sans({
    variable: "--font-mona-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AI Interviewer - Practice Interviews with AI Feedback",
    description: "Master your interview skills with AI-powered practice sessions and personalized feedback. Practice behavioral, technical, and mixed interviews.",
    keywords: ["AI interview", "interview practice", "interview feedback", "job interview", "career preparation"],
    authors: [{ name: "AI Interviewer Team" }],
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
        <body className={`${monaSans.className} antialiased pattern`}>
        {children}

        <Toaster />
        </body>
        </html>
    );
}