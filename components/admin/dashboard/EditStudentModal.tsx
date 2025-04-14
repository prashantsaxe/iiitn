"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "../shared/ColorUtils";
import { studentInterface } from "@/lib/db/models/student";

interface EditStudentModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
}

export function EditStudentModal({ studentId, isOpen, onClose, onStudentUpdated }: EditStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Partial<studentInterface> | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentData();
    }
  }, [isOpen, studentId]);

  async function fetchStudentData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/students/${studentId}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStudent(result.data);
      } else {
        toast.error(result.message || "Failed to fetch student data");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setStudent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === "placement.placed") {
      setStudent(prev => prev ? { 
        ...prev, 
        placement: { 
          ...prev.placement as any, 
          placed: checked 
        } 
      } : null);
    } else {
      setStudent(prev => prev ? { ...prev, [name]: checked } : null);
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    if (parent === "placement") {
      setStudent(prev => prev ? { 
        ...prev, 
        placement: { 
          ...prev.placement as any, 
          [field]: value 
        } 
      } : null);
    } else if (parent === "education") {
      setStudent(prev => prev ? { 
        ...prev, 
        education: { 
          ...prev.education as any, 
          [field]: value 
        } 
      } : null);
    } else if (parent === "socialMedia") {
      setStudent(prev => prev ? { 
        ...prev, 
        socialMedia: { 
          ...prev.socialMedia as any, 
          [field]: value 
        } 
      } : null);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(student)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Student updated successfully");
        onStudentUpdated();
        onClose();
      } else {
        toast.error(result.message || "Failed to update student");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!student && !loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-3">
            {!loading && student && (
              <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-800">
                <AvatarImage src={student.photo} />
                <AvatarFallback>{getInitials(student.name || "")}</AvatarFallback>
              </Avatar>
            )}
            Edit Student
          </DialogTitle>
          <DialogDescription>
            Update student information in the system
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={student.name || ""} 
                    onChange={handleInputChange}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={student.email || ""} 
                    onChange={handleInputChange}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={student.phoneNumber || ""} 
                    onChange={handleInputChange}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={student.gender || ""}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hometown">Hometown</Label>
                  <Input 
                    id="hometown" 
                    name="hometown" 
                    value={student.hometown || ""} 
                    onChange={handleInputChange}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    name="dob" 
                    type="date"
                    value={student.dob ? new Date(student.dob).toISOString().split('T')[0] : ""} 
                    onChange={handleInputChange}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Academic Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select 
                    value={student.branch || ""}
                    onValueChange={(value) => handleSelectChange("branch", value)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="CSE">Computer Science</SelectItem>
                      <SelectItem value="ECE">Electronics</SelectItem>
                      <SelectItem value="Mech">Mechanical</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="EE">Electrical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input 
                    id="cgpa" 
                    name="cgpa" 
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={student.cgpa || ""} 
                    onChange={handleInputChange}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activeBacklogs">Active Backlogs</Label>
                  <Input 
                    id="activeBacklogs" 
                    name="activeBacklogs" 
                    type="number"
                    min="0"
                    value={student.activeBacklogs || 0} 
                    onChange={handleInputChange}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenthMarks">10th Marks (%)</Label>
                  <Input 
                    id="tenthMarks" 
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={student.education?.tenthMarks || ""} 
                    onChange={(e) => handleNestedInputChange("education", "tenthMarks", parseFloat(e.target.value))}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twelfthMarks">12th Marks (%)</Label>
                  <Input 
                    id="twelfthMarks" 
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={student.education?.twelfthMarks || ""} 
                    onChange={(e) => handleNestedInputChange("education", "twelfthMarks", parseFloat(e.target.value))}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Placement Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Placement Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Switch 
                    id="placed"
                    checked={student.placement?.placed || false}
                    onCheckedChange={(checked) => handleSwitchChange("placement.placed", checked)}
                  />
                  <Label htmlFor="placed" className="ml-2">Placed</Label>
                </div>

                {student.placement?.placed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        value={student.placement?.company || ""} 
                        onChange={(e) => handleNestedInputChange("placement", "company", e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="package">Package (₹)</Label>
                      <Input 
                        id="package" 
                        type="number"
                        min="0"
                        value={student.placement?.package || ""} 
                        onChange={(e) => handleNestedInputChange("placement", "package", parseFloat(e.target.value))}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placementType">Placement Type</Label>
                      <Select 
                        value={student.placement?.type || ""}
                        onValueChange={(value) => handleNestedInputChange("placement", "type", value)}
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          <SelectItem value="intern">Internship</SelectItem>
                          <SelectItem value="fte">Full-Time</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerDate">Offer Date</Label>
                      <Input 
                        id="offerDate" 
                        type="date"
                        value={student.placement?.offerDate ? new Date(student.placement.offerDate).toISOString().split('T')[0] : ""} 
                        onChange={(e) => handleNestedInputChange("placement", "offerDate", e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Account Status</h3>
              <div className="space-y-2">
                <Select 
                  value={student.accountStatus || "active"}
                  onValueChange={(value) => handleSelectChange("accountStatus", value)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    value={student.socialMedia?.linkedin || ""} 
                    onChange={(e) => handleNestedInputChange("socialMedia", "linkedin", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input 
                    id="github" 
                    value={student.socialMedia?.github || ""} 
                    onChange={(e) => handleNestedInputChange("socialMedia", "github", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input 
                    id="portfolio" 
                    value={student.socialMedia?.portfolio || ""} 
                    onChange={(e) => handleNestedInputChange("socialMedia", "portfolio", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-full border border-gray-200 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="rounded-full bg-primary text-white"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}