import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Nav } from "@/components/layout/nav";
import SessionProvider from "@/components/session-provider";
import AuthProvider from "@/components/Authprovider";
import Image from "next/image"; 
import Link from "next/link"; 
import logo from "@/public/logo.png";
import { AvatarMenu } from "@/components/avatar-menu"; // Import the client component

// SF Pro Display is Apple's font, fallback to Inter if not available
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIITN Placement",
  description: "IIITN Placement Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <AuthProvider>
              {/* Header Section - Apple Style */}
              <header className="sticky top-0 z-50 apple-nav">
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                  {/* Logo with text - Apple style with minimalism */}
                  <Link href="/" className="flex items-center space-x-2">
                    <Image 
                      src={logo}
                      alt="IIITN Logo"
                      width={22}
                      height={22}
                      className="w-auto"
                    />
                    {/* <div className="text-base font-medium tracking-tight text-gray-900 dark:text-white">
                      IIITN Placement
                    </div> */}
                  </Link>

                  <div className="flex items-center space-x-8">
                    {/* Navigation - Apple style with minimal text */}
                    <nav className="hidden md:flex space-x-8">
                      <a
                        href="/"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition apple-text dark:text-gray-300 dark:hover:text-white"
                      >
                        Home
                      </a>
                      <a
                        href="/about"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition apple-text dark:text-gray-300 dark:hover:text-white"
                      >
                        About
                      </a>
                      <a
                        href="/placements"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition apple-text dark:text-gray-300 dark:hover:text-white"
                      >
                        Placements
                      </a>
                      <a
                        href="/contact"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition apple-text dark:text-gray-300 dark:hover:text-white"
                      >
                        Contact
                      </a>
                    </nav>

                    {/* Avatar with Dropdown - Use the client component */}
                    <AvatarMenu />

                    {/* Mobile Menu Icon - Apple simplified style */}
                    <div className="md:hidden">
                      <button
                        className="text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                        aria-label="Open Menu"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex flex-col min-h-screen">
                <div className="flex-1">{children}</div>
              </main>

              {/* Footer Section - Apple Style */}
              <footer className="bg-gray-50 py-8 dark:bg-black/30">
                <div className="container mx-auto px-6 text-center">
                  <p className="text-xs text-gray-500 apple-text dark:text-gray-400">
                    © {new Date().getFullYear()} IIITN Placement. All rights reserved.
                  </p>
                </div>
              </footer>

              <Toaster position="bottom-center" toastOptions={{ 
                duration: 3000,
                style: { 
                  background: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(10px)', 
                  color: '#1d1d1f',
                  border: '1px solid rgba(0,0,0,0.05)',
                  fontWeight: 400,
                }
              }} />
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}