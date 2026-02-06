

"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import VideoFrame from "@/components/VideoUI/VideoFrame";
import ControlBar from "@/components/VideoUI/ControlBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Video, MessageSquare, Activity } from "lucide-react";

type GestureMetrics = {
    eyeContactPct?: number;
    smileEvents?: number;
    nodEvents?: number;
    handMovementIntensity?: number;
    postureStability?: number;
};

interface VideoInterviewProps {
    interviewId: string;
    userId: string;
}

// Debounced gesture metrics sender
const useGestureMetricsSender = (interviewId: string) => {
    const batchRef = useRef<GestureMetrics[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const sendBatch = useCallback(async () => {
        if (batchRef.current.length === 0) return;

        const batch = [...batchRef.current];
        batchRef.current = [];

        try {
            await fetch("/api/user/gestures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    interviewId,
                    timestamp: new Date().toISOString(),
                    metrics: batch,
                }),
            });
        } catch (error) {
            console.warn('Failed to send gesture metrics batch:', error);
        }
    }, [interviewId]);

    const addToBatch = useCallback((metrics: GestureMetrics) => {
        batchRef.current.push(metrics);

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Send batch after 5 seconds or when batch reaches 10 items
        if (batchRef.current.length >= 10) {
            sendBatch();
        } else {
            timeoutRef.current = setTimeout(sendBatch, 5000);
        }
    }, [sendBatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Send any remaining metrics
            sendBatch();
        };
    }, [sendBatch]);

    return addToBatch;
};

// Enhanced Video Interview with better UI and performance optimizations
export default function VideoInterview({ interviewId, userId }: VideoInterviewProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null as unknown as HTMLVideoElement);
    const remoteVideoRef = useRef<HTMLVideoElement>(null as unknown as HTMLVideoElement);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [collecting, setCollecting] = useState(false);
    const [joined, setJoined] = useState(false);
    const [muted, setMuted] = useState(false);
    const [videoOn, setVideoOn] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const metricsRef = useRef<GestureMetrics>({});
    const [transcripts, setTranscripts] = useState<Array<{ role: string; content: string }>>([]);
    const mediaStartedRef = useRef(false);

    // Optimized gesture metrics sender with batching
    const sendGestureMetrics = useGestureMetricsSender(interviewId);

    // Safely attach a MediaStream to a video element
    const attachStreamToVideo = useCallback(async (videoEl: HTMLVideoElement, mediaStream: MediaStream) => {
        try {
            console.log("Attaching stream to video element", { 
                videoTracks: mediaStream.getVideoTracks().length,
                audioTracks: mediaStream.getAudioTracks().length,
                videoTrackLabel: mediaStream.getVideoTracks()[0]?.label
            });
            
            // Pause before changing the source to avoid play() interruption
            try { videoEl.pause(); } catch {}
            
            // Clear any existing srcObject to prevent race with new load
            // @ts-expect-error: srcObject is supported in modern browsers
            videoEl.srcObject = null;
            
            // Small delay to ensure cleanup
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Attach the new stream
            // @ts-expect-error: srcObject is supported in modern browsers
            videoEl.srcObject = mediaStream;

            console.log("Stream attached, waiting for metadata...");

            // Wait for metadata with timeout
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.warn("Metadata timeout, proceeding anyway");
                    resolve();
                }, 3000);

                const onLoaded = () => {
                    console.log("Video metadata loaded, ready to play");
                    clearTimeout(timeout);
                    videoEl.removeEventListener("loadedmetadata", onLoaded);
                    resolve();
                };
                
                if (videoEl.readyState >= 1) {
                    console.log("Video already has metadata");
                    clearTimeout(timeout);
                    resolve();
                } else {
                    videoEl.addEventListener("loadedmetadata", onLoaded, { once: true });
                }
            });

            // Attempt to play; ignore user-gesture errors silently as autoplay is enabled+muted
            try { 
                console.log("Attempting to play video...");
                await videoEl.play(); 
                console.log("Video play() succeeded");
            } catch (e) { 
                console.warn("Video play() failed:", e);
            }
        } catch (e) {
            console.error("Failed to attach stream to video:", e);
        }
    }, []);

    // Memoized startMedia function
    const startMedia = useCallback(async () => {
        if (mediaStartedRef.current) {
            console.log("Media already started, skipping");
            return;
        }
        
        try {
            mediaStartedRef.current = true;
            setIsConnecting(true);

            if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("MediaDevices API not available in this browser.");
            }

            if (typeof window !== "undefined" && !window.isSecureContext) {
                throw new Error("Insecure context. Use HTTPS or http://localhost to access camera/microphone.");
            }

            const constraints: MediaStreamConstraints = {
                audio: { echoCancellation: true, noiseSuppression: true } as MediaTrackConstraints,
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } as MediaTrackConstraints,
            };

            let media: MediaStream;
            try {
                media = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (initialErr: any) {
                // Retry with relaxed constraints on overconstrained/not found
                if (
                    initialErr?.name === "OverconstrainedError" ||
                    initialErr?.name === "NotFoundError" ||
                    initialErr?.name === "DevicesNotFoundError"
                ) {
                    media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                } else {
                    throw initialErr;
                }
            }
            setStream(media);
            if (localVideoRef.current) {
                await attachStreamToVideo(localVideoRef.current as HTMLVideoElement, media);
            }
            setIsConnecting(false);
        } catch (err: any) {
            console.error(err);
            mediaStartedRef.current = false;
            setIsConnecting(false);

            const name = err?.name || "";
            const message = err?.message || "";
            let errorMessage = "Failed to access camera/microphone";

            if (name === "NotAllowedError" || name === "SecurityError") {
                errorMessage = "Permission denied. Allow camera and microphone in your browser settings.";
            } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
                errorMessage = "No camera/microphone found. Plug in a device or select a valid input.";
            } else if (name === "NotReadableError" || name === "TrackStartError") {
                errorMessage = "Camera or microphone is in use by another application. Close other apps (Zoom/Teams) and retry.";
            } else if (name === "OverconstrainedError") {
                errorMessage = "Requested media constraints not satisfied by any available device.";
            } else if (message.toLowerCase().includes("insecure context")) {
                errorMessage = "This page is not secure. Use HTTPS or http://localhost to enable camera/mic.";
            } else if (message) {
                errorMessage = `Failed to access camera/microphone: ${message}`;
            }

            toast.error(errorMessage);
        }
    }, []);

    // Ensure we clear loading state when the element is actually ready to play
    useEffect(() => {
        const el = localVideoRef.current as HTMLVideoElement | null;
        if (!el) return;
        
        const onCanPlay = () => {
            console.log("Video can play, clearing loading state");
            setIsConnecting(false);
        };
        const onPlaying = () => {
            console.log("Video is playing, clearing loading state");
            setIsConnecting(false);
        };
        const onLoaded = () => {
            console.log("Video metadata loaded, clearing loading state");
            setIsConnecting(false);
        };
        const onError = (e: any) => {
            console.error("Video element error:", e);
            setIsConnecting(false);
            toast.error("Video failed to load. Please check your camera.");
        };
        
        el.addEventListener("loadedmetadata", onLoaded);
        el.addEventListener("canplay", onCanPlay);
        el.addEventListener("playing", onPlaying);
        el.addEventListener("error", onError);
        
        // Fallback timeout to clear loading state after 10 seconds
        const timeout = setTimeout(() => {
            console.warn("Video loading timeout, clearing loading state");
            setIsConnecting(false);
        }, 10000);
        
        return () => {
            clearTimeout(timeout);
            el.removeEventListener("loadedmetadata", onLoaded);
            el.removeEventListener("canplay", onCanPlay);
            el.removeEventListener("playing", onPlaying);
            el.removeEventListener("error", onError);
        };
    }, [localVideoRef]);

    // Memoized metrics calculation
    const calculateMetrics = useCallback(() => {
        // TODO: plug real detections here
        // For now, synthesize some metrics drift for demo
        const currentMetrics = metricsRef.current;
        
        return {
            eyeContactPct: Math.min(100, Math.max(0, (currentMetrics.eyeContactPct ?? 60) + (Math.random() - 0.5) * 4)),
            smileEvents: (currentMetrics.smileEvents ?? 0) + (Math.random() > 0.9 ? 1 : 0),
            nodEvents: (currentMetrics.nodEvents ?? 0) + (Math.random() > 0.92 ? 1 : 0),
            handMovementIntensity: Math.min(100, Math.max(0, (currentMetrics.handMovementIntensity ?? 40) + (Math.random() - 0.5) * 10)),
            postureStability: Math.min(100, Math.max(0, (currentMetrics.postureStability ?? 75) + (Math.random() - 0.5) * 3)),
        };
    }, []);

    // Optimized metrics collection with batching
    useEffect(() => {
        if (!collecting) return;
        
        let mounted = true;
        const interval = setInterval(async () => {
            if (!mounted) return;
            
            const newMetrics = calculateMetrics();
            metricsRef.current = newMetrics;
            
            // Add to batch instead of immediate send
            sendGestureMetrics(newMetrics);
        }, 2000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [collecting, calculateMetrics, sendGestureMetrics]);

    // Memoized media cleanup
    const cleanupMedia = useCallback(() => {
        try {
            stream?.getTracks().forEach((t) => t.stop());
        } finally {
            const el = localVideoRef.current as HTMLVideoElement | null;
            if (el) {
                try { el.pause(); } catch {}
                // @ts-expect-error: srcObject is supported in modern browsers
                el.srcObject = null;
            }
        }
    }, [stream]);

    useEffect(() => {
        startMedia();
        return cleanupMedia;
    }, [startMedia, cleanupMedia]);

    // Optimized transcript listener
    useEffect(() => {
        const onTranscript = (e: Event) => {
            const ev = e as CustomEvent<{ role: string; content: string }>;
            if (!ev.detail) return;
            setTranscripts((prev) => [...prev, ev.detail]);
        };
        
        window.addEventListener("agent-transcript", onTranscript as EventListener);
        return () => {
            window.removeEventListener("agent-transcript", onTranscript as EventListener);
        };
    }, []);

    // Memoized status display
    const statusDisplay = useMemo(() => (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${joined ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        {joined ? 'Connected' : 'Connecting...'}
                    </span>
                </div>
                <Badge variant={joined ? "default" : "secondary"}>
                    {joined ? 'Live' : 'Ready'}
                </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                    <Mic className="h-4 w-4" />
                    <span>{muted ? 'Muted' : 'Audio On'}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Video className="h-4 w-4" />
                    <span>{videoOn ? 'Video On' : 'Video Off'}</span>
                </div>
            </div>
        </div>
    ), [joined, muted, videoOn]);

    // Memoized video grid
    const videoGrid = useMemo(() => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Interviewer Video */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-purple-600 text-white">
                        AI Interviewer
                    </Badge>
                </div>
                <VideoFrame
                    title="AI Interviewer"
                    name="AI Interviewer"
                    align="left"
                    avatarURL="/ai-avatar.png"
                    placeholder={
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <img src="/ai-avatar.png" alt="AI" className="w-32 h-32 rounded-full shadow-lg" />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-gray-800 mb-1">AI Interviewer</h3>
                                    <p className="text-sm text-gray-600">Ready to begin your interview</p>
                                </div>
                            </div>
                        </div>
                    }
                />
            </Card>

            {/* User Video */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-blue-600 text-white">
                        You
                    </Badge>
                </div>
                {isConnecting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-sm font-medium">Connecting camera...</span>
                            </div>
                        </div>
                    </div>
                )}
                <VideoFrame
                    title="You"
                    name="You"
                    align="right"
                    mirrored
                    videoRef={localVideoRef}
                />
            </Card>
        </div>
    ), [isConnecting]);

    // Memoized control bar handlers
    const controlHandlers = useMemo(() => ({
        onJoin: async () => {
            if (!stream) {
                await startMedia();
            }
            setJoined(true);
            setCollecting(true);
            window.dispatchEvent(new Event("agent-join"));
        },
        onToggleMute: () => {
            setMuted((m) => !m);
            const audioTracks = stream?.getAudioTracks() || [];
            audioTracks.forEach((t) => (t.enabled = !t.enabled));
        },
        onToggleVideo: () => {
            setVideoOn((v) => !v);
            const videoTracks = stream?.getVideoTracks() || [];
            videoTracks.forEach((t) => (t.enabled = !t.enabled));
        },
        onEnd: () => {
            setJoined(false);
            setCollecting(false);
            window.dispatchEvent(new Event("agent-end"));
            cleanupMedia();
        },
    }), [stream, cleanupMedia]);

    // Memoized transcripts panel
    const transcriptsPanel = useMemo(() => {
        if (transcripts.length === 0) return null;

        return (
            <Card className="bg-white border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Live Transcript</h4>
                        <Badge variant="outline" className="ml-auto">
                            {transcripts.length} messages
                        </Badge>
                    </div>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto space-y-3">
                    {transcripts.map((t, idx) => (
                        <div key={idx} className="flex space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                t.role === "assistant" ? "bg-purple-500" : "bg-blue-500"
                            }`}></div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`text-sm font-medium ${
                                        t.role === "assistant" ? "text-purple-700" : "text-blue-700"
                                    }`}>
                                        {t.role === "assistant" ? "AI Interviewer" : "You"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{t.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }, [transcripts]);

    return (
        <div className="w-full space-y-6">
            {/* Status Bar */}
            {statusDisplay}

            {/* Video Grid */}
            {videoGrid}

            {/* Control Bar */}
            <Card className="p-4 bg-white border border-gray-200">
                <ControlBar
                    joined={joined}
                    muted={muted}
                    videoOn={videoOn}
                    {...controlHandlers}
                />
            </Card>

            {/* Live Transcripts Panel */}
            {transcriptsPanel}

            {/* Sync joined with agent status events */}
            <div className="hidden" aria-hidden>
                <AgentStatusBinder setJoined={setJoined} />
            </div>
        </div>
    );
}

// Memoized agent status binder
function AgentStatusBinder({ setJoined }: { setJoined: (v: boolean) => void }) {
    useEffect(() => {
        const onActive = () => setJoined(true);
        const onEnded = () => setJoined(false);
        
        window.addEventListener("agent-status-active", onActive);
        window.addEventListener("agent-status-ended", onEnded);
        
        return () => {
            window.removeEventListener("agent-status-active", onActive);
            window.removeEventListener("agent-status-ended", onEnded);
        };
    }, [setJoined]);
    
    return null;
}


