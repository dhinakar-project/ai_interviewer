"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

import { 
  INTERVIEW_TYPES, 
  INTERVIEW_LEVELS, 
  TECH_STACKS, 
  INTERVIEW_DURATIONS,
  getQuestionsByType 
} from "@/constants/interviews";

interface CreateInterviewForm {
  role: string;
  type: string;
  level: string;
  duration: string;
  techstack: string[];
  customQuestions: string[];
}

export default function CreateInterviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState<CreateInterviewForm>({
    role: "",
    type: INTERVIEW_TYPES.MIXED,
    level: INTERVIEW_LEVELS.MID,
    duration: INTERVIEW_DURATIONS.MEDIUM,
    techstack: [],
    customQuestions: []
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user/me');
        const result = await response.json();
        
        if (result.success) {
          setCurrentUser(result.user);
        } else {
          toast.error("Failed to get user information");
          router.push('/sign-in');
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to get user information");
        router.push('/sign-in');
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handleTechStackToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techstack: prev.techstack.includes(tech)
        ? prev.techstack.filter(t => t !== tech)
        : [...prev.techstack, tech]
    }));
  };

  const handleCustomQuestionAdd = () => {
    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, ""]
    }));
  };

  const handleCustomQuestionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => 
        i === index ? value : q
      )
    }));
  };

  const handleCustomQuestionRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role.trim()) {
      toast.error("Please enter a job role");
      return;
    }

    if (!currentUser?.id) {
      toast.error("User information not loaded. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      // Combine predefined questions with custom questions
      const predefinedQuestions = getQuestionsByType(formData.type);
      const allQuestions = [...predefinedQuestions, ...formData.customQuestions.filter(q => q.trim())];
      
      // Call the API to generate questions and save interview to database
      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          role: formData.role,
          level: formData.level,
          techstack: formData.techstack.join(','),
          amount: allQuestions.length.toString(),
          userid: currentUser?.id || '',
          customQuestions: allQuestions
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create interview');
      }

      // Get the interview ID from the response or generate one
      const interviewId = result.interviewId || uuidv4();

      toast.success("Interview created successfully!");
      router.push(`/interview/${interviewId}`);
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Failed to create interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Custom Interview</h1>
        <p className="text-muted-foreground">
          Configure your interview settings and questions for a personalized practice session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Job Role *</Label>
          <Input
            id="role"
            placeholder="e.g., Frontend Developer, Software Engineer, Product Manager"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            required
          />
        </div>

        {/* Interview Type */}
        <div className="space-y-2">
          <Label>Interview Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(INTERVIEW_TYPES).map((type) => (
              <Button
                key={type}
                type="button"
                variant={formData.type === type ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, type }))}
                className="justify-start"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(INTERVIEW_LEVELS).map((level) => (
              <Button
                key={level}
                type="button"
                variant={formData.level === level ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, level }))}
                size="sm"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>Interview Duration</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(INTERVIEW_DURATIONS).map((duration) => (
              <Button
                key={duration}
                type="button"
                variant={formData.duration === duration ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, duration }))}
                size="sm"
              >
                {duration}
              </Button>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-2">
          <Label>Technologies (Optional)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TECH_STACKS.map((tech) => (
              <Button
                key={tech}
                type="button"
                variant={formData.techstack.includes(tech) ? "default" : "outline"}
                onClick={() => handleTechStackToggle(tech)}
                size="sm"
                className="justify-start"
              >
                {tech}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Questions */}
        <div className="space-y-2">
          <Label>Custom Questions (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Add your own questions to the interview. Predefined questions will be included based on the interview type.
          </p>
          
          <div className="space-y-3">
            {formData.customQuestions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Enter your custom question..."
                  value={question}
                  onChange={(e) => handleCustomQuestionChange(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCustomQuestionRemove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCustomQuestionAdd}
              size="sm"
            >
              Add Custom Question
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || !formData.role.trim() || !currentUser?.id}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Interview...
              </>
            ) : (
              "Create & Start Interview"
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
