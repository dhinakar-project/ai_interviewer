import { cn } from "@/lib/utils";

interface TranscriptDisplayProps {
  lastMessage: string;
  hasMessages: boolean;
}

export const TranscriptDisplay = ({ lastMessage, hasMessages }: TranscriptDisplayProps) => {
  if (!hasMessages) return null;

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-900">Live Transcript</h4>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
        <p
          key={lastMessage}
          className={cn(
            "text-gray-700 text-center leading-relaxed transition-all duration-500",
            "animate-fadeIn"
          )}
        >
          {lastMessage || "Your conversation will appear here..."}
        </p>
      </div>
    </div>
  );
};



