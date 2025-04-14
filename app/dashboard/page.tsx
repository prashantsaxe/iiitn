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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Enhanced hero section with subtle background */}
      <div className="mb-16 text-center">
        <div className="inline-block mb-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-2xl font-semibold mb-2 mx-auto shadow-lg">
            {user.name?.[0] || user.email?.[0] || 'U'}
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Hello, {user.name || (user.email ? user.email.split('@')[0] : 'User')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {isAdmin 
            ? "Manage your administrative tools and system settings" 
            : "Access your student resources and placement opportunities"}
        </p>
      </div>

      {/* Quick Stats Section with enhanced shadows and color accents */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {/* Role Card with subtle color accent */}
        <Card className="rounded-2xl shadow-md bg-white/90 backdrop-blur-sm border border-gray-100/80 dark:bg-black/60 dark:border-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/40"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium tracking-tight">Your Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <p className="text-base">
              <span className="font-semibold capitalize text-primary">{user.role}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "You have access to administrative features."
                : "You have student-level access to the system."}
            </p>
          </CardContent>
        </Card>

        {/* Quick Links Card with depth */}
        <Card className="rounded-2xl shadow-md bg-white/90 backdrop-blur-sm border border-gray-100/80 dark:bg-black/60 dark:border-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-blue-500/80 to-sky-400/60"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium tracking-tight">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex flex-col space-y-3">
              {isAdmin ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full h-9 bg-white/70 dark:bg-gray-900/70 border-gray-200/80 dark:border-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
                  >
                    <Link href="/admin/manage-students">Manage Students</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full h-9 bg-white/70 dark:bg-gray-900/70 border-gray-200/80 dark:border-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
                  >
                    <Link href="/admin/settings">Admin Settings</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full h-9 bg-white/70 dark:bg-gray-900/70 border-gray-200/80 dark:border-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
                  >
                    <Link href="/student/profile">My Profile</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full h-9 bg-white/70 dark:bg-gray-900/70 border-gray-200/80 dark:border-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
                  >
                    <Link href="/student/courses">My Courses</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="rounded-2xl shadow-md bg-white/90 backdrop-blur-sm border border-gray-100/80 dark:bg-black/60 dark:border-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-purple-500/80 to-indigo-400/60"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium tracking-tight">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-Specific Content with enhanced design */}
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-8 text-center">
          <span className="inline-block pb-2 border-b-2 border-primary/40">
            {isAdmin ? "Administrative Tools" : "Student Resources"}
          </span>
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {isAdmin ? (
            <>
              {/* Admin-Specific Cards */}
              <Card className="rounded-2xl shadow-md bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-900 dark:to-black/95 border-gray-100/80 dark:border-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-40 dark:opacity-20"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-lg font-medium tracking-tight">
                    Student Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-0 relative">
                  <p className="text-sm text-muted-foreground">
                    Access tools for managing student records, placements, and
                    academic data.
                  </p>
                  <Button 
                    asChild 
                    className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary transition-all shadow-md w-full sm:w-auto"
                  >
                    <Link href="/admin/manage-students">
                      Go to Student Management
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-900 dark:to-black/95 border-gray-100/80 dark:border-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-40 dark:opacity-20"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-lg font-medium tracking-tight">
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-0 relative">
                  <p className="text-sm text-muted-foreground">
                    Configure system settings, user permissions, and database
                    options.
                  </p>
                  <Button 
                    asChild 
                    className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary transition-all shadow-md w-full sm:w-auto"
                  >
                    <Link href="/admin/settings">Go to Settings</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Student-Specific Cards */}
              <Card className="rounded-2xl shadow-md bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-900 dark:to-black/95 border-gray-100/80 dark:border-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-40 dark:opacity-20"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-lg font-medium tracking-tight">
                    My Academic Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-0 relative">
                  <p className="text-sm text-muted-foreground">
                    View and update your academic information, CGPA, and course
                    registrations.
                  </p>
                  <Button 
                    asChild 
                    className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary transition-all shadow-md w-full sm:w-auto"
                  >
                    <Link href="/student/profile">View Profile</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-900 dark:to-black/95 border-gray-100/80 dark:border-gray-800/60 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-40 dark:opacity-20"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-lg font-medium tracking-tight">
                    Placement Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-0 relative">
                  <p className="text-sm text-muted-foreground">
                    Browse current placement opportunities and track your
                    application status.
                  </p>
                  <Button 
                    asChild 
                    className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary transition-all shadow-md w-full sm:w-auto"
                  >
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