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
<DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#1c1c1e] dark:via-[#2c2c2e] dark:to-[#3a3a3c] rounded-3xl border border-gray-200/70 dark:border-gray-700/50 shadow-2xl">
  <DialogHeader className="pb-4">
    <DialogTitle className="text-2xl font-semibold tracking-tight flex items-center gap-4 text-gray-900 dark:text-white">
      {!loading && student && (
        <Avatar className="h-12 w-12 border border-gray-200/70 dark:border-gray-700/50 overflow-hidden">
          <AvatarImage src={student.photo} />
          <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
            {getInitials(student.name || "")}
          </AvatarFallback>
        </Avatar>
      )}
      Edit Student
    </DialogTitle>
    <DialogDescription className="text-gray-600 dark:text-gray-400">
      Update student information in the system
    </DialogDescription>
  </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-700 border-t-primary dark:border-t-primary"></div>
        </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="p-6 rounded-lg bg-white dark:bg-[#1e1e1e] shadow-md">
  <h3 className="text-lg font-medium text-primary dark:text-primary/80 mb-4">
  Personal Information
</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={student.name || ""} 
                    onChange={handleInputChange}
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={student.email || ""} 
                    onChange={handleInputChange}
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={student.phoneNumber || ""} 
                    onChange={handleInputChange}
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={student.gender || ""}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
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
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

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
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Academic Information */}
            <div className="p-6 rounded-lg bg-white dark:bg-[#1e1e1e] shadow-md">
  <h3 className="text-lg font-medium text-primary dark:text-primary/80 mb-4">
            Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select 
                    value={student.branch || ""}
                    onValueChange={(value) => handleSelectChange("branch", value)}
                  >
                    <SelectTrigger   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
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
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

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
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

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
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

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
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Placement Information */}
            <div className="p-6 rounded-lg bg-white dark:bg-[#1e1e1e] shadow-md">
            <h3 className="text-lg font-medium text-primary dark:text-primary/80 mb-4">
            Placement Information</h3>
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
                          className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

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
                          className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placementType">Placement Type</Label>
                      <Select 
                        value={student.placement?.type || ""}
                        onValueChange={(value) => handleNestedInputChange("placement", "type", value)}
                      >
                        <SelectTrigger   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
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
                          className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Status */}
            <div className="p-6 rounded-lg bg-white dark:bg-[#1e1e1e] shadow-md">
  <h3 className="text-lg font-medium text-primary dark:text-primary/80 mb-4">
            Account Status</h3>
              <div className="space-y-2">
                <Select 
                  value={student.accountStatus || "active"}
                  onValueChange={(value) => handleSelectChange("accountStatus", value)}
                >
                  <SelectTrigger   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent   className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="p-6 rounded-lg bg-white dark:bg-[#1e1e1e] shadow-md">
  <h3 className="text-lg font-medium text-primary dark:text-primary/80 mb-4">
            Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    value={student.socialMedia?.linkedin || ""} 
                    onChange={(e) => handleNestedInputChange("socialMedia", "linkedin", e.target.value)}
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input 
                    id="github" 
                    value={student.socialMedia?.github || ""} 
                    onChange={(e) => handleNestedInputChange("socialMedia", "github", e.target.value)}
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input 
                    id="portfolio" 
                    value={student.socialMedia?.portfolio || ""} 
                    onChange={(e) => handleNestedInputChange("socialMedia", "portfolio", e.target.value)}
                      className="rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"

                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

<DialogFooter className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/30">
  <Button
    variant="outline"
    onClick={onClose}
    className="rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
  >
    Cancel
  </Button>
  <Button
    onClick={handleSubmit}
    disabled={loading}
    className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-md"
  >
    {loading ? "Saving..." : "Save Changes"}
  </Button>
</DialogFooter>
</DialogContent>
    </Dialog>
  );
}