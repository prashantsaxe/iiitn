// app/(public)/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 text-center bg-gradient-to-br from-slate-100 to-slate-200">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to EduAccess</h1>
      <p className="text-gray-600 text-lg mb-10 max-w-md">
        Choose your role to continue to the sign-in page.
      </p>
      <div className="flex gap-6">
        <Link href="/signin">
          <Button className="text-lg px-6 py-4 rounded-2xl shadow-lg" variant="default">
            Admin Sign In
          </Button>
        </Link>
        <Link href="/signin">
          <Button className="text-lg px-6 py-4 rounded-2xl shadow-lg" variant="outline">
            Student Sign In
          </Button>
        </Link>
      </div>
    </main>
  );
}
