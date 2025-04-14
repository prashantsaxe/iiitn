import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  
  if (!session) {
    redirect("/login");
  }
  
  const { user } = session;
  const isAdmin = user.role === "admin";
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.name || user.email}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You are logged in as a <span className="font-bold">{user.role}</span></p>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "You have access to administrative features."
                : "You have student-level access to the system."}
            </p>
          </CardContent>
        </Card>
        
        {/* Quick Links Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              {isAdmin ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/manage-students">Manage Students</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/settings">Admin Settings</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/student/profile">My Profile</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/student/courses">My Courses</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Role-specific content */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">
          {isAdmin ? "Administration Tools" : "Student Resources"}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {isAdmin ? (
            // Admin-specific content
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Student Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Access tools for managing student records, placements, and academic data.</p>
                  <Button asChild>
                    <Link href="/admin/manage-students">Go to Student Management</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Configure system settings, user permissions, and database options.</p>
                  <Button asChild>
                    <Link href="/admin/settings">Go to Settings</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            // Student-specific content
            <>
              <Card>
                <CardHeader>
                  <CardTitle>My Academic Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>View and update your academic information, CGPA, and course registrations.</p>
                  <Button asChild>
                    <Link href="/student/profile">View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Placement Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Browse current placement opportunities and track your application status.</p>
                  <Button asChild>
                    <Link href="/student/placements">View Opportunities</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}