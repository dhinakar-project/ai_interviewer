import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
    const { type, role, level, techstack, amount, userid, customQuestions } = await request.json();

    try {
        let questions;
        
        if (customQuestions && customQuestions.length > 0) {
            // Use custom questions if provided
            questions = customQuestions;
        } else {
            // Generate questions using AI
            const { text: generatedQuestions } = await generateText({
                model: google("gemini-2.0-flash-001"),
                prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]

Thank you! <3
`,
            });
            questions = JSON.parse(generatedQuestions);
        }

        const interview = {
            role: role,
            type: type,
            level: level,
            techstack: typeof techstack === "string"
                ? techstack.split(",").map((s: string) => s.trim())
                : [],

            questions: questions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        const interviewRef = await db.collection("interviews").add(interview);

        return new Response(
            JSON.stringify({ success: true, interviewId: interviewRef.id }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("🔥 API Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

export async function GET() {
    return new Response(
        JSON.stringify({ success: true, data: "Thank you!" }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );
}
