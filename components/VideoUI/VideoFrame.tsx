"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
    title: string;
    name: string;
    avatarURL?: string;
    align?: "left" | "right";
    mirrored?: boolean;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
    placeholder?: React.ReactNode;
}

export default function VideoFrame(props: Props) {
    const { title, name, avatarURL, align = "left", mirrored = false, videoRef, placeholder } = props;
    return (
        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black aspect-video border border-gray-200">
            {videoRef ? (
                <video
                    ref={videoRef}
                    className={cn("w-full h-full object-cover", mirrored && "scale-x-[-1]")}
                    autoPlay
                    playsInline
                    muted
                />
            ) : null}
            {placeholder}
            
            {/* Top overlay with name and avatar */}
            <div className={cn(
                "absolute top-4 flex items-center gap-3 px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur-md bg-black/30 border border-white/20",
                align === "left" ? "left-4" : "right-4"
            )}>
                {avatarURL ? (
                    <div className="relative">
                        <Image 
                            src={avatarURL} 
                            alt={name} 
                            width={24} 
                            height={24} 
                            className="rounded-full border-2 border-white/30" 
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center border border-white/30">
                        <span className="text-xs font-semibold">{name.charAt(0).toUpperCase()}</span>
                    </div>
                )}
                <span className="font-semibold">{name}</span>
            </div>
            
            {/* Bottom overlay with title */}
            <div className={cn(
                "absolute bottom-4 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-md bg-black/30 border border-white/20 font-medium",
                align === "left" ? "left-4" : "right-4"
            )}>
                {title}
            </div>
            
            {/* Corner accent */}
            <div className={cn(
                "absolute top-0 w-16 h-16 bg-gradient-to-br from-transparent to-black/20",
                align === "left" ? "left-0" : "right-0"
            )}></div>
        </div>
    );
}


