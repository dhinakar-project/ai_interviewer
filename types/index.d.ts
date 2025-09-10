interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  bodyLanguageScore?: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  gestureMetrics?: {
    eyeContactPct?: number;
    smileEvents?: number;
    nodEvents?: number;
    handMovementIntensity?: number;
    postureStability?: number;
  };
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
  gestureSummary?: {
    eyeContactPct?: number;
    smileEvents?: number;
    nodEvents?: number;
    handMovementIntensity?: number;
    postureStability?: number;
  };
}

interface User {
  name: string;
  email: string;
  id: string;
  profileURL?: string;
  profession?: string;
  isStudent?: boolean;
  graduationYear?: string;
  university?: string;
  experience?: string;
  location?: string;
  bio?: string;
}

interface InterviewCardProps {
  interviewId: string;
  userId: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string;
}




interface AgentProps {
  userName: string;
  userId: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "custom";
  questions?: string[];
  userProfileURL?: string;

  // 🆕 Add these props for dynamic interview generation
  role?: string;
  level?: string;
  amount?: string;
  techstack?: string;

  // 🆕 UI/control flags
  hidden?: boolean;
  autoStart?: boolean;
}


interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}