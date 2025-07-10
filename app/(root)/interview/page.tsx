import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from "uuid"; // For feedbackId generation

const Page = async () => {
    const user = await getCurrentUser();

    const questions = [
        "Tell me about yourself.",
        "What is the difference between var, let, and const in JavaScript?",
        "How do you manage performance in a large React app?",
        "What is closure in JavaScript?",
        "Explain the virtual DOM."
    ];

    return (
        <>
            <h3>Manual (Custom) Interview</h3>

            <Agent
                userName={user?.name ?? ""}
                userId={user?.id ?? ""}
                interviewId="interview-xyz"
                feedbackId={uuidv4()}
                type="custom"
                questions={questions}
            />
        </>
    );
};

export default Page;
