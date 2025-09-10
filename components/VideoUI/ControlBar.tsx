"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Play } from "lucide-react";

interface Props {
    joined: boolean;
    muted: boolean;
    videoOn: boolean;
    onJoin: () => void;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onEnd: () => void;
}

export default function ControlBar(props: Props) {
    const { joined, muted, videoOn, onJoin, onToggleMute, onToggleVideo, onEnd } = props;
    
    return (
        <div className="flex items-center justify-center gap-4">
            {!joined ? (
                <Button 
                    onClick={onJoin}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full shadow-lg"
                >
                    <Play className="h-5 w-5 mr-2" />
                    Start Interview
                </Button>
            ) : (
                <>
                    {/* Mute/Unmute Button */}
                    <Button
                        variant={muted ? "destructive" : "secondary"}
                        size="lg"
                        onClick={onToggleMute}
                        className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {muted ? (
                            <MicOff className="h-6 w-6" />
                        ) : (
                            <Mic className="h-6 w-6" />
                        )}
                    </Button>

                    {/* Video Toggle Button */}
                    <Button
                        variant={videoOn ? "secondary" : "destructive"}
                        size="lg"
                        onClick={onToggleVideo}
                        className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {videoOn ? (
                            <Video className="h-6 w-6" />
                        ) : (
                            <VideoOff className="h-6 w-6" />
                        )}
                    </Button>

                    {/* End Call Button */}
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={onEnd}
                        className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-red-600 hover:bg-red-700"
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </>
            )}
        </div>
    );
}






