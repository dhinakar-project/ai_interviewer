import { useState, useEffect, useCallback } from 'react';
import { vapi } from '@/lib/vapi.sdk';
import { toast } from 'sonner';

export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING", 
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface UseVapiCallProps {
  type: "generate" | "custom";
  questions?: string[];
  userName?: string;
  userId?: string;
  role?: string;
  level?: string;
  amount?: string;
  techstack?: string;
}

export const useVapiCall = ({
  type,
  questions,
  userName,
  userId,
  role,
  level,
  amount,
  techstack,
}: UseVapiCallProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCall = useCallback(async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setError(null);
      setIsLoading(true);

      if (type === "generate") {
        await vapi.start(
          undefined,
          undefined,
          undefined,
          process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
          {
            variableValues: {
              username: userName,
              userid: userId,
              role: role ?? "",
              level: level ?? "",
              amount: amount ?? "",
              techstack: techstack ?? "",
              type: "technical"
            },
          }
        );
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        try { 
          vapi.stop(); 
        } catch (stopError) {
          // Ignore stop errors
        }
        
        await vapi.start(vapi, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
      
    } catch (error) {
      console.error("Error starting call:", error);
      setError("Failed to start interview. Please check your connection and try again.");
      toast.error("Failed to start interview");
      setCallStatus(CallStatus.INACTIVE);
    } finally {
      setIsLoading(false);
    }
  }, [type, questions, userName, userId, role, level, amount, techstack]);

  const handleDisconnect = useCallback(() => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  }, []);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      window.dispatchEvent(new Event("agent-status-active"));
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      window.dispatchEvent(new Event("agent-status-ended"));
    };

    const onError = (error: Error) => {
      console.error("VAPI Error Details:", error);
      
      let errorMessage = "Connection error. Please try again.";
      
      if (error.message) {
        if (error.message.toLowerCase().includes("token") || error.message.toLowerCase().includes("auth")) {
          errorMessage = "Authentication error. Please check your VAPI configuration.";
        } else if (error.message.toLowerCase().includes("network") || error.message.toLowerCase().includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.toLowerCase().includes("permission")) {
          errorMessage = "Microphone/camera permission denied. Please allow access and try again.";
        } else if (error.message.toLowerCase().includes("transport") && error.message.toLowerCase().includes("disconnected")) {
          errorMessage = "Connection lost. Attempting to reconnect...";
        } else {
          errorMessage = `Connection error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setCallStatus(CallStatus.INACTIVE);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("error", onError);
    };
  }, []);

  return {
    callStatus,
    isLoading,
    error,
    handleCall,
    handleDisconnect,
  };
};



