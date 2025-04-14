import { 
    Users, 
    UserCheck, 
    UserX, 
    GraduationCap 
  } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  
  interface DashboardStats {
    totalStudents: number;
    placedStudents: number;
    unplacedStudents: number;
    averageCGPA: number;
  }
  
  export function StatsCards({ stats }: { stats: DashboardStats }) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.totalStudents}</div>
            <p className="text-xs text-blue-600/70">
              Active enrollment
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placed Students</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.placedStudents}</div>
            <p className="text-xs text-green-600/70">
              {stats.totalStudents > 0 ? Math.round((stats.placedStudents / stats.totalStudents) * 100) : 0}% placement rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-orange-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unplaced Students</CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.unplacedStudents}</div>
            <p className="text-xs text-orange-600/70">
              Seeking opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-purple-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CGPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats.averageCGPA.toFixed(2)}</div>
            <p className="text-xs text-purple-600/70">
              Across all students
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }