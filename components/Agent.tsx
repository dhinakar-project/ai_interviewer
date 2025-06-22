"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";


enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface AgentProps {
    userName: string;
}

const Agent = ({ userName }: AgentProps) => {
    const [callState, setCallState] = useState<CallStatus>(CallStatus.INACTIVE);
    const isSpeaking = true;

    const messages = [
        "What's your name?",
        "My name is Dhinakar, nice to meet you!"
    ];

    const lastMessage = messages[messages.length - 1];

    const handleCallClick = () => {
        if (callState === CallStatus.INACTIVE || callState === CallStatus.FINISHED) {
            setCallState(CallStatus.CONNECTING);
            setTimeout(() => setCallState(CallStatus.ACTIVE), 1000);
        } else if (callState === CallStatus.ACTIVE) {
            setCallState(CallStatus.FINISHED);
        }
    };

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="AI Interviewer"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="User Avatar"
                            width={540}
                            height={540}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={lastMessage} className={cn      
                            
                        ('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center mt-4">
                <button
                    onClick={handleCallClick}
                    className={`px-4 py-2 rounded text-white ${
                        callState === CallStatus.ACTIVE ? "bg-red-600" : "bg-green-600"
                    }`}
                >
                    {callState === CallStatus.INACTIVE || callState === CallStatus.FINISHED
                        ? "Start Call"
                        : callState === CallStatus.CONNECTING
                            ? "Connecting..."
                            : "End Call"}
                </button>
            </div>
        </>
    );
};

export default Agent;

// import React from 'react'
// import Image from "next/image";
// enum callStatus {
//     INACTIVE='INACTIVE',
//     CONNECTING='CONNECTING',
//     ACTIVE='ACTIVE',
//     FINSISHED='FINISHED',
// }
// interface AgentProps {
//     userName:string;
// }
// const Agent = ({userName}:AgentProps) => {
//
//     const isSpeaking =true;
//     return (
//         <>
//
//         <div className="call-view">
//             <div className="card-interviewer">
//                 <div className="avatar">
//                     <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
//                     {isSpeaking&& <span className="animate-speak"/>}
//
//                 </div>
//                 <h3>AI Interviewer</h3>
//
//             </div>
//             <div className="card-border">
//                 <div className="card-content">
//                     <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
//                     <h3>{userName}</h3>
//                 </div>
//
//             </div>
//         </div>
//             <div className="w-full flex justify-center">
//                 {callStatus != 'ACTIVE'?
//                     (
//                         <button>
//                             <span>
//                                 {callStatus === 'INACTIVE'|| callStatus === 'FINISHED' ? 'Call':'...'}
//                             </span>
//                         </button>
//                     ):(
//                         <button className="btn-disconnect">
//                             End
//                         </button>
//                     )}
//
//             </div>
//         </>
//     )
// }
// export default Agent
