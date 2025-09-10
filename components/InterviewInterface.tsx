import Image from "next/image";
import { CallStatus } from "@/lib/hooks/useVapiCall";

interface InterviewInterfaceProps {
  userName: string;
  userProfileURL?: string;
  isSpeaking: boolean;
  callStatus: CallStatus;
  onStartCall: () => void;
  onEndCall: () => void;
  isLoading: boolean;
}

export const InterviewInterface = ({
  userName,
  userProfileURL,
  isSpeaking,
  callStatus,
  onStartCall,
  onEndCall,
  isLoading,
}: InterviewInterfaceProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Call Interface */}
      <div className="card-elevated p-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* AI Interviewer Card */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center relative">
                <Image
                  src="/ai-avatar.png"
                  alt="AI Interviewer"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                )}
              </div>
              {isSpeaking && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Interviewer</h3>
              <p className="text-gray-600">
                {isSpeaking ? "Speaking..." : "Ready to interview"}
              </p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="text-center space-y-6">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto overflow-hidden">
              {userProfileURL ? (
                <Image
                  src={userProfileURL}
                  alt="User Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{userName}</h3>
              <p className="text-gray-600">Interview Participant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className={`btn-primary btn-lg relative min-w-[200px] ${
              callStatus === "CONNECTING" && "animate-pulse"
            }`}
            onClick={onStartCall}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {callStatus === "INACTIVE" || callStatus === "FINISHED"
                  ? "Start Interview"
                  : "Connecting..."}
              </>
            )}
          </button>
        ) : (
          <button
            className="btn-destructive btn-lg min-w-[200px]"
            onClick={onEndCall}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            End Interview
          </button>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
          <div className={`w-2 h-2 rounded-full ${
            callStatus === "INACTIVE" && "bg-gray-400",
            callStatus === "CONNECTING" && "bg-yellow-500 animate-pulse",
            callStatus === "ACTIVE" && "bg-green-500 animate-pulse",
            callStatus === "FINISHED" && "bg-blue-500"
          }`}></div>
          <span className="text-sm text-gray-600 font-medium">
            {callStatus === "INACTIVE" && "Ready to start"}
            {callStatus === "CONNECTING" && "Connecting..."}
            {callStatus === "ACTIVE" && "Interview in progress"}
            {callStatus === "FINISHED" && "Interview completed"}
          </span>
        </div>
      </div>
    </div>
  );
};



