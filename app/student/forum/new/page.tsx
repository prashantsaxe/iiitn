
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useStudentStore from '@/lib/store/userStore'; // Import the Zustand store hook

const NewTopicPage = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null); // New state for image
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { student } = useStudentStore(); // Get student data from Zustand store

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if student data is available from Zustand
    if (!student || !student.id || !student.name) {
      setError("User details not found. Please log in again.");
      setLoading(false);
      return; // Stop submission if user details are missing
    }

    try {
      // Use student details from Zustand store
      const createdBy = {
        userId: student.id, // Use student ID from store
        name: student.name, // Use student name from store
        // Optionally include email if needed and available
        // email: student.email,
      };

      // Prepare form data for image upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('company', company);
      formData.append('content', content);
      formData.append('createdBy', JSON.stringify(createdBy)); // Stringify the object
      if (image) {
        formData.append('image', image); // Append the image file
      }

      // When sending FormData, axios usually sets the correct Content-Type automatically.
      // Do not manually set 'Content-Type': 'application/json' when sending FormData.
      await axios.post('/api/forum', formData);
      // Removed explicit headers and method as axios handles FormData correctly

      router.push('/student/forum'); // Redirect to the forum page after successful creation
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/student/forum"> {/* Updated link back to forum */}
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter topic title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your topic content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Image (optional)</Label>
                <Input
                  type="file"
                  id="image"
                  accept="image/*" // Accept only image files
                  onChange={handleImageChange}
                />
                {image && (
                  <div className="mt-2">
                    <p>Selected Image: {image.name}</p>
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading || !student}> {/* Disable button if loading or no student data */}
                {loading ? 'Creating...' : 'Create Topic'}
              </Button>
              {error && <p className="text-red-500 mt-2">{error}</p>} {/* Added margin top */}
              {!student && <p className="text-yellow-600 mt-2">Loading user details or not logged in...</p>} {/* Indicate if student data isn't ready */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTopicPage;