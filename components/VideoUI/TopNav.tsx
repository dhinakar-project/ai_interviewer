"use client";

import Image from "next/image";

export default function TopNav() {
    return (
        <div className="sticky top-0 z-10 w-full backdrop-blur bg-white/60 border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image src="/logo.svg" width={24} height={24} alt="logo" />
                    <span className="font-semibold">PrepWise Interview</span>
                </div>
                <nav className="text-sm text-gray-600 flex items-center gap-4">
                    <a href="#" className="hover:text-gray-900">Settings</a>
                    <a href="#" className="hover:text-gray-900">Help</a>
                </nav>
            </div>
        </div>
    );
}




































