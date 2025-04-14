"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

export function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const isLoggedIn = status === "authenticated";

  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="backdrop-blur-xl bg-white/80 dark:bg-black/80 sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden text-lg font-medium tracking-tight sm:inline-block">
              Campus System
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/") ? "text-primary font-semibold" : "text-foreground/70"
            )}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/about") ? "text-primary font-semibold" : "text-foreground/70"
            )}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/contact") ? "text-primary font-semibold" : "text-foreground/70"
            )}
          >
            Contact
          </Link>
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/dashboard") ? "text-primary font-semibold" : "text-foreground/70"
              )}
            >
              Dashboard
            </Link>
          )}
          {isLoggedIn && session?.user?.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/admin") ? "text-primary font-semibold" : "text-foreground/70"
              )}
            >
              Admin
            </Link>
          )}
          {isLoggedIn && session?.user?.role === "student" && (
            <Link
              href="/student"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/student") ? "text-primary font-semibold" : "text-foreground/70"
              )}
            >
              My Profile
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Apple-style Theme Toggle */}
          {mounted && ( // Render only after component is mounted
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full bg-secondary/50 backdrop-blur-sm hover:bg-secondary/70 transition-colors"
              aria-label="Toggle theme"
            >
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 overflow-hidden transition-all hover:ring-2 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mt-1 bg-white/90 dark:bg-black/90 backdrop-blur-lg border border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-lg"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200/60 dark:bg-gray-800/60" />
                <div className="p-1">
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer focus:bg-gray-100/80 dark:focus:bg-gray-900/60">
                    <Link href="/dashboard" className="px-3 py-2">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer focus:bg-gray-100/80 dark:focus:bg-gray-900/60">
                    <Link href="/settings" className="px-3 py-2">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-gray-200/60 dark:bg-gray-800/60" />
                <div className="p-1">
                  <DropdownMenuItem
                    className="rounded-md cursor-pointer px-3 py-2 focus:bg-gray-100/80 dark:focus:bg-gray-900/60 text-red-600 dark:text-red-500"
                    onSelect={() => {
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Log out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className="rounded-full px-5 bg-primary hover:bg-primary/90 transition-all shadow-sm"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}