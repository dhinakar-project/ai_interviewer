"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
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
  };
  onUpdate: (updatedUser: any) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    profileURL: user.profileURL || "",
    profession: user.profession || "",
    isStudent: user.isStudent || false,
    graduationYear: user.graduationYear || "",
    university: user.university || "",
    experience: user.experience || "",
    location: user.location || "",
    bio: user.bio || ""
  });
  const [previewImage, setPreviewImage] = useState<string | null>(user.profileURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to a temporary location or convert to base64
      // For now, we'll store as base64 (in production, you'd upload to cloud storage)
      const reader2 = new FileReader();
      reader2.onload = (e) => {
        setFormData(prev => ({ ...prev, profileURL: e.target?.result as string }));
      };
      reader2.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          profileURL: formData.profileURL,
          profession: formData.profession,
          isStudent: formData.isStudent,
          graduationYear: formData.graduationYear,
          university: formData.university,
          experience: formData.experience,
          location: formData.location,
          bio: formData.bio
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }

      toast.success("Profile updated successfully!");
      onUpdate(result.user);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="text-blue-100 mt-1">Customize your profile information</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Photo
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile preview"
                    width={100}
                    height={100}
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-25 h-25 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white text-2xl font-bold">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change Photo
                </Button>
                <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50 border-gray-200"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              Professional Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  placeholder="e.g., Software Engineer, Student, Product Manager"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <select
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select experience level</option>
                  <option value="Student">Student</option>
                  <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                  <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
                  <option value="Senior Level (6-10 years)">Senior Level (6-10 years)</option>
                  <option value="Lead/Principal (10+ years)">Lead/Principal (10+ years)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isStudent"
                  checked={formData.isStudent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isStudent: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isStudent" className="text-sm font-medium text-gray-700">
                  I am currently a student
                </Label>
              </div>

              {formData.isStudent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">University/College</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                      placeholder="Enter your university name"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                      placeholder="e.g., 2024, 2025"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Additional Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York, NY or Remote"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself, your interests, and career goals..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating Profile...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Profile
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
