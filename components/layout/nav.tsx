"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Nav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Ensure the component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">IIITN</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session ? (
              <div className="flex items-center space-x-4">
                <p className="text-sm hidden sm:inline-block">
                  {session.user?.email}
                </p>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
