export const INTERVIEW_QUESTIONS = {
  behavioral: [
    "Tell me about yourself.",
    "What are your greatest strengths and weaknesses?",
    "Describe a challenging situation you faced at work and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why do you want to work for this company?",
    "Tell me about a time you failed and what you learned from it.",
    "How do you handle stress and pressure?",
    "Describe a time when you had to work with a difficult colleague.",
    "What motivates you?",
    "Tell me about a time you went above and beyond what was expected."
  ],
  technical: [
    "What is the difference between var, let, and const in JavaScript?",
    "How do you manage performance in a large React app?",
    "What is closure in JavaScript?",
    "Explain the virtual DOM.",
    "What are the differences between SQL and NoSQL databases?",
    "Explain the concept of RESTful APIs.",
    "What is the difference between synchronous and asynchronous programming?",
    "How do you handle state management in React?",
    "Explain the concept of microservices.",
    "What is the difference between HTTP and HTTPS?"
  ],
  mixed: [
    "Tell me about yourself.",
    "What is the difference between var, let, and const in JavaScript?",
    "Describe a challenging project you worked on.",
    "How do you manage performance in a large React app?",
    "What is closure in JavaScript?",
    "Tell me about a time you had to learn a new technology quickly.",
    "Explain the virtual DOM.",
    "How do you handle disagreements with team members?",
    "What are your greatest strengths and weaknesses?",
    "How do you stay updated with the latest technologies?"
  ]
};

export const INTERVIEW_TYPES = {
  BEHAVIORAL: "Behavioral",
  TECHNICAL: "Technical", 
  MIXED: "Mixed"
} as const;

export const INTERVIEW_LEVELS = {
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead"
} as const;

export const TECH_STACKS = [
  "React",
  "Node.js", 
  "Python",
  "Java",
  "TypeScript",
  "AWS",
  "Docker",
  "Kubernetes",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "GraphQL"
] as const;

export const INTERVIEW_DURATIONS = {
  SHORT: "15-30 minutes",
  MEDIUM: "30-45 minutes", 
  LONG: "45-60 minutes"
} as const;

export const getQuestionsByType = (type: string): string[] => {
  const normalizedType = type.toLowerCase();
  
  if (normalizedType.includes('behavioral')) {
    return INTERVIEW_QUESTIONS.behavioral;
  } else if (normalizedType.includes('technical')) {
    return INTERVIEW_QUESTIONS.technical;
  } else {
    return INTERVIEW_QUESTIONS.mixed;
  }
};
