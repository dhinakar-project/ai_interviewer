import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingDots({ className, size = "md" }: LoadingDotsProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2", 
    lg: "w-3 h-3"
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      <div
        className={cn(
          "bg-white rounded-full animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn(
          "bg-white rounded-full animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn(
          "bg-white rounded-full animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}











