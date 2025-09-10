import { useState, useEffect } from 'react';
import { vapi } from '@/lib/vapi.sdk';

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export const useTranscript = () => {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        try {
          window.dispatchEvent(
            new CustomEvent("agent-transcript", { detail: newMessage })
          );
        } catch {}
      }
    };

    vapi.on("message", onMessage);

    return () => {
      vapi.off("message", onMessage);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  return {
    messages,
    lastMessage,
  };
};



