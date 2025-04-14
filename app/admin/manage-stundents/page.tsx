import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function ManageStudentsPage() {
  const session = await getServerAuthSession();
  
  // Double check role at the page level (in addition to middleware)
  if (!session || session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Student Management</h1>
      <p className="text-muted-foreground mb-8">
        View and manage student information
      </p>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Search students..." 
            className="w-[300px]" 
          />
          <Button variant="outline">Search</Button>
        </div>
        
        <Button>Export Data</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Branch</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">CGPA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-sm">Anurag Singh</td>
                  <td className="px-4 py-3 text-sm">anurag@example.com</td>
                  <td className="px-4 py-3 text-sm">Computer Science</td>
                  <td className="px-4 py-3 text-sm">9.2</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Priya Sharma</td>
                  <td className="px-4 py-3 text-sm">priya@example.com</td>
                  <td className="px-4 py-3 text-sm">Electronics</td>
                  <td className="px-4 py-3 text-sm">8.7</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Amit Kumar</td>
                  <td className="px-4 py-3 text-sm">amit@example.com</td>
                  <td className="px-4 py-3 text-sm">Civil</td>
                  <td className="px-4 py-3 text-sm">6.9</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Inactive
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}