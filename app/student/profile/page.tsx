"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useStudentStore from "@/lib/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Pencil, Save, X, Camera, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";

const ProfilePage = () => {
  const router = useRouter();
  const { student, setStudent } = useStudentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // State for editable fields
  const [editableFields, setEditableFields] = useState({
    hometown: student?.hometown || "",
    dob: student?.dob ? new Date(student.dob) : new Date(),
    photo: student?.photo || "",
    "socialMedia.linkedin": student?.socialMedia?.linkedin || "",
    "socialMedia.github": student?.socialMedia?.github || "",
    "socialMedia.twitter": student?.socialMedia?.twitter || "",
    "socialMedia.portfolio": student?.socialMedia?.portfolio || "",
    "education.tenthMarks": student?.education?.tenthMarks || 0,
    "education.twelfthMarks": student?.education?.twelfthMarks || 0,
  });

  if (!student) {
    router.push("/login");
    return null;
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, revert to original values
      setEditableFields({
        hometown: student.hometown || "",
        dob: student.dob ? new Date(student.dob) : new Date(),
        photo: student.photo || "",
        "socialMedia.linkedin": student.socialMedia?.linkedin || "",
        "socialMedia.github": student.socialMedia?.github || "",
        "socialMedia.twitter": student.socialMedia?.twitter || "",
        "socialMedia.portfolio": student.socialMedia?.portfolio || "",
        "education.tenthMarks": student.education?.tenthMarks || 0,
        "education.twelfthMarks": student.education?.twelfthMarks || 0,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field: string, value: string | number | Date) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image less than 5MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setImageUploading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Implement your file upload logic here
      // This is a placeholder; you'll need an actual API endpoint for file uploads
      const response = await axios.post("/api/upload", formData);
      
      // Update photo URL
      const photoUrl = response.data.url;
      handleChange("photo", photoUrl);
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Format the data for the API
      const updateData = {
        hometown: editableFields.hometown,
        dob: editableFields.dob,
        photo: editableFields.photo,
        socialMedia: {
          linkedin: editableFields["socialMedia.linkedin"],
          github: editableFields["socialMedia.github"],
          twitter: editableFields["socialMedia.twitter"],
          portfolio: editableFields["socialMedia.portfolio"],
        },
        education: {
          tenthMarks: Number(editableFields["education.tenthMarks"]),
          twelfthMarks: Number(editableFields["education.twelfthMarks"]),
        },
      };

      // Call your API to update the user profile
      await axios.put(`/api/student/profile`, updateData);

      // Update the student store
      setStudent({
        ...student,
        hometown: updateData.hometown,
        dob: updateData.dob.toISOString(),
        photo: updateData.photo,
        socialMedia: updateData.socialMedia,
        education: updateData.education,
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Format functions for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(new Date(dateString), "PPP");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 dark:bg-black">
      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black h-48 relative">
        <div className="container mx-auto px-4">
          <div className="absolute -bottom-16 flex flex-col md:flex-row md:items-end">
            {/* Profile Photo */}
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-white shadow-md dark:border-gray-900">
                {student.photo ? (
                  <AvatarImage 
                    src={student.photo} 
                    alt={student.name || "Student"} 
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl font-medium">
                    {getInitials(student.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {isEditing && (
                <label 
                  htmlFor="photo-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-6 w-6 text-white" />
                  <input 
                    id="photo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={imageUploading}
                  />
                </label>
              )}
            </div>
            
            {/* Name and Basic Info */}
            <div className="mt-4 md:mt-0 md:ml-6 mb-2">
              <h1 className="text-3xl font-semibold tracking-tight apple-heading">
                {student.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 apple-text">
                {student.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Action Buttons */}
          <div className="w-full flex justify-end mb-4">
            <Button 
              onClick={handleEditToggle} 
              variant={isEditing ? "destructive" : "default"}
              className="apple-button"
            >
              {isEditing ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>

            {isEditing && (
              <Button 
                onClick={handleSave} 
                className="ml-4 apple-button bg-blue-500 hover:bg-blue-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            )}
          </div>

          {/* Left Column - Personal Details */}
          <div className="w-full lg:w-1/3">
            <Card className="apple-card mb-8">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4 apple-heading">Personal Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Name</Label>
                    <p className="mt-1">{student.name || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Gender</Label>
                    <p className="mt-1 capitalize">{student.gender || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Date of Birth</Label>
                    {isEditing ? (
                      <div className="mt-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editableFields.dob ? format(editableFields.dob, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={editableFields.dob}
                              onSelect={(date) => date && handleChange("dob", date)}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1950-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      <p className="mt-1">{formatDate(student.dob)}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Hometown</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.hometown}
                        onChange={(e) => handleChange("hometown", e.target.value)}
                        className="mt-1"
                        placeholder="Enter your hometown"
                      />
                    ) : (
                      <p className="mt-1">{student.hometown || "Not specified"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Phone Number</Label>
                    <p className="mt-1">{student.phoneNumber || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="apple-card">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4 apple-heading">Education</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Branch</Label>
                    <p className="mt-1">{student.branch || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">10th Standard Marks</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableFields["education.tenthMarks"]}
                        onChange={(e) => handleChange("education.tenthMarks", parseFloat(e.target.value))}
                        className="mt-1"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    ) : (
                      <p className="mt-1">{student.education?.tenthMarks || "Not specified"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">12th Standard Marks</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableFields["education.twelfthMarks"]}
                        onChange={(e) => handleChange("education.twelfthMarks", parseFloat(e.target.value))}
                        className="mt-1"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    ) : (
                      <p className="mt-1">{student.education?.twelfthMarks || "Not specified"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">CGPA</Label>
                    <p className="mt-1">{student.cgpa || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Active Backlogs</Label>
                    <p className="mt-1">{student.activeBacklogs !== undefined ? student.activeBacklogs : "Not specified"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Social & Placement */}
          <div className="w-full lg:w-2/3">
            <Card className="apple-card mb-8">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4 apple-heading">Social Media</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkedin" className="text-sm text-gray-500 dark:text-gray-400 apple-text">LinkedIn</Label>
                    {isEditing ? (
                      <Input
                        id="linkedin"
                        value={editableFields["socialMedia.linkedin"]}
                        onChange={(e) => handleChange("socialMedia.linkedin", e.target.value)}
                        className="mt-1"
                        placeholder="https://linkedin.com/in/username"
                      />
                    ) : (
                      <p className="mt-1">
                        {student.socialMedia?.linkedin ? (
                          <a 
                            href={student.socialMedia.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {student.socialMedia.linkedin}
                          </a>
                        ) : (
                          "Not specified"
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="github" className="text-sm text-gray-500 dark:text-gray-400 apple-text">GitHub</Label>
                    {isEditing ? (
                      <Input
                        id="github"
                        value={editableFields["socialMedia.github"]}
                        onChange={(e) => handleChange("socialMedia.github", e.target.value)}
                        className="mt-1"
                        placeholder="https://github.com/username"
                      />
                    ) : (
                      <p className="mt-1">
                        {student.socialMedia?.github ? (
                          <a 
                            href={student.socialMedia.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {student.socialMedia.github}
                          </a>
                        ) : (
                          "Not specified"
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="twitter" className="text-sm text-gray-500 dark:text-gray-400 apple-text">Twitter</Label>
                    {isEditing ? (
                      <Input
                        id="twitter"
                        value={editableFields["socialMedia.twitter"]}
                        onChange={(e) => handleChange("socialMedia.twitter", e.target.value)}
                        className="mt-1"
                        placeholder="https://twitter.com/username"
                      />
                    ) : (
                      <p className="mt-1">
                        {student.socialMedia?.twitter ? (
                          <a 
                            href={student.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {student.socialMedia.twitter}
                          </a>
                        ) : (
                          "Not specified"
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="portfolio" className="text-sm text-gray-500 dark:text-gray-400 apple-text">Portfolio Website</Label>
                    {isEditing ? (
                      <Input
                        id="portfolio"
                        value={editableFields["socialMedia.portfolio"]}
                        onChange={(e) => handleChange("socialMedia.portfolio", e.target.value)}
                        className="mt-1"
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <p className="mt-1">
                        {student.socialMedia?.portfolio ? (
                          <a 
                            href={student.socialMedia.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {student.socialMedia.portfolio}
                          </a>
                        ) : (
                          "Not specified"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="apple-card">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-4 apple-heading">Placement Status</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Placement Status</Label>
                    <p className="mt-1">
                      {student.placement?.placed ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">Placed</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Not Placed Yet</span>
                      )}
                    </p>
                  </div>
                  
                  {student.placement?.placed && (
                    <>
                      <div>
                        <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Company</Label>
                        <p className="mt-1">{student.placement?.company || "Not specified"}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Package</Label>
                        <p className="mt-1">
                          {student.placement?.package ? 
                            `₹ ${(student.placement.package / 100000).toFixed(1)} LPA` : 
                            "Not specified"}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Type</Label>
                        <p className="mt-1 capitalize">{student.placement?.type || "Not specified"}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500 dark:text-gray-400 apple-text">Offer Date</Label>
                        <p className="mt-1">
                          {student.placement?.offerDate ? 
                            formatDate(student.placement.offerDate as unknown as string) : 
                            "Not specified"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;