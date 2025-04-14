import { 
    Table, TableBody, TableCell, TableHead, 
    TableHeader, TableRow 
  } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
  import { getInitials, getCGPAColor } from "../shared/ColorUtils";
  
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
  }
  
  export function StudentTable({ students, totalCount, loading, error }: StudentTableProps) {
    if (loading) {
      return (
        <Card className="border border-blue-200 shadow-md">
          <CardContent className="flex justify-center items-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-2 text-indigo-600">Loading students...</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (error) {
      return (
        <Card className="border border-red-200 shadow-md">
          <CardContent className="py-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      );
    }
    
    if (students.length === 0) {
      return (
        <Card className="border border-amber-200 shadow-md">
          <CardContent className="py-10">
            <div className="text-center text-amber-600">No students match your filters</div>
          </CardContent>
        </Card>
      );
    }
    
    return (
        <Card className="border border-gray-200 shadow-sm bg-white">
  <CardHeader className="py-4 border-b border-gray-200 bg-white">
    <div className="flex justify-between items-center">
      <CardTitle className="text-gray-900 text-lg font-semibold">Student Records</CardTitle>
      <CardDescription className="text-gray-500">
        Showing {students.length} of {totalCount} students
      </CardDescription>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="text-gray-500">Student</TableHead>
          <TableHead className="text-gray-500">Branch</TableHead>
          <TableHead className="text-gray-500">CGPA</TableHead>
          <TableHead className="text-gray-500">Backlogs</TableHead>
          <TableHead className="text-gray-500">Placement</TableHead>
          <TableHead className="text-gray-500">Status</TableHead>
          <TableHead className="text-right text-gray-500">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student._id} className="hover:bg-gray-50">
            <TableCell className="font-medium text-gray-900">
              <div className="flex items-center gap-3">
                <Avatar className="border border-gray-200">
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
                  ? "text-red-600 bg-red-50 rounded-full px-2 py-0.5 text-sm"
                  : "text-green-600 bg-green-50 rounded-full px-2 py-0.5 text-sm"
              }>
                {student.activeBacklogs}
              </span>
            </TableCell>
            <TableCell>
            {student.placement.placed ? (
  <div className="space-y-1">
    <span className="text-sm text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
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
  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Not Placed</span>
)}  
            </TableCell>
            <TableCell>
              <span className={
                student.accountStatus === 'active'
                  ? "text-green-700 bg-green-50 border border-green-100 rounded-md px-2 py-0.5 text-sm"
                  : "text-red-700 bg-red-50 border border-red-100 rounded-md px-2 py-0.5 text-sm"
              }>
                {student.accountStatus}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" asChild>
                  <a href={`/admin/students/${student._id}`}>View</a>
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" asChild>
                  <a href={`/admin/students/${student._id}/edit`}>Edit</a>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>

      
    );
  }