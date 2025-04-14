import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getCGPAColor } from "../shared/ColorUtils";
import { EditStudentModal } from "./EditStudentModal";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  placement: {
    placed: boolean;
    company?: string;
    package?: number;
    type?: 'intern' | 'fte' | 'both';
  };
  accountStatus: 'active' | 'inactive';
  photo?: string;
}

interface StudentTableProps {
  students: StudentData[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  onStudentUpdated?: () => void;
}

export function StudentTable({ students, totalCount, loading, error, onStudentUpdated }: StudentTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleEditClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setEditModalOpen(true);
  };

  const handleStudentUpdated = () => {
    if (onStudentUpdated) {
      onStudentUpdated();
    }
  };

  if (loading) {
    return (
      <Card className="border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="flex justify-center items-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-primary/80">Loading students...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="border border-red-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="py-6">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }
  
  if (students.length === 0) {
    return (
      <Card className="border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="py-10">
          <div className="text-center text-gray-500">No students match your filters</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardHeader className="py-4 border-b border-gray-200/70">
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900 text-lg font-medium">Student Records</CardTitle>
            <CardDescription>
              Showing {students.length} of {totalCount} students
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="text-gray-500 font-medium">Student</TableHead>
                <TableHead className="text-gray-500 font-medium">Branch</TableHead>
                <TableHead className="text-gray-500 font-medium">CGPA</TableHead>
                <TableHead className="text-gray-500 font-medium">Backlogs</TableHead>
                <TableHead className="text-gray-500 font-medium">Placement</TableHead>
                <TableHead className="text-gray-500 font-medium">Status</TableHead>
                <TableHead className="text-right text-gray-500 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id} className="hover:bg-gray-50/80">
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <Avatar className="border border-gray-200/70">
                        <AvatarImage src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=fff&color=000`} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">{student.branch}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{student.cgpa.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className={
                      student.activeBacklogs > 0 
                        ? "text-red-600 bg-red-50/80 rounded-full px-2 py-0.5 text-sm"
                        : "text-green-600 bg-green-50/80 rounded-full px-2 py-0.5 text-sm"
                    }>
                      {student.activeBacklogs}
                    </span>
                  </TableCell>
                  <TableCell>
                    {student.placement.placed ? (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-800 bg-gray-100/80 px-2 py-0.5 rounded-full">
                          {student.placement.type === 'intern' ? 'Intern' : 
                          student.placement.type === 'fte' ? 'FTE' : 
                          student.placement.type === 'both' ? 'Both' : 'Placed'}
                        </span>
                        <div className="text-xs text-gray-500">
                          {student.placement.company} – 
                          {student.placement.type === 'intern' ? 
                            `₹${(student.placement.package! / 1000).toFixed(1)}K/month` : 
                            `₹${(student.placement.package! / 100000).toFixed(1)}L/annum`
                          }
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">
                        Not Placed
                      </span>
                    )}  
                  </TableCell>
                  <TableCell>
                    <span className={
                      student.accountStatus === 'active'
                        ? "text-green-700 bg-green-50/80 border border-green-100/70 rounded-full px-2 py-0.5 text-sm"
                        : "text-red-700 bg-red-50/80 border border-red-100/70 rounded-full px-2 py-0.5 text-sm"
                    }>
                      {student.accountStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/90 hover:bg-primary/10 rounded-full"
                        asChild
                      >
                        <a href={`/admin/students/${student._id}`}>View</a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/90 hover:bg-primary/10 rounded-full"
                        onClick={() => handleEditClick(student._id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditStudentModal 
        studentId={selectedStudentId}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onStudentUpdated={handleStudentUpdated}
      />
    </>
  );
}