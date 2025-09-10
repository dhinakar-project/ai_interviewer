import { useState, useEffect } from 'react';
import { vapi } from '@/lib/vapi.sdk';

export const useSpeechState = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);

  return { isSpeaking };
};



