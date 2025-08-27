"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";

import ProfileModal from "./ProfileModal";

interface User {
  id: string;
  name: string;
  email: string;
  profileURL?: string;
  profession?: string;
  isStudent?: boolean;
  graduationYear?: string;
  university?: string;
  experience?: string;
  location?: string;
  bio?: string;
}

export default function ProfileButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me');
        const result = await response.json();
        
        if (result.success) {
          setUser(result.user);
        } else {
          console.error("Failed to fetch user:", result.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Profile Settings"
      >
        {user.profileURL ? (
          <Image
            src={user.profileURL}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {user.name}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
}
