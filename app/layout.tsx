import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Nav } from "@/components/layout/nav";
import SessionProvider from "@/components/session-provider";
import AuthProvider from "@/components/Authprovider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIITN placement", 
  description: "IIITN placement website ", 
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
              {/* <div className="fixed inset-0 z-10 bg-background" /> */}
              <div className="relative flex min-h-screen flex-col">
              <Nav />
              <div className="flex-1">{children}</div>
            </div>
            <Toaster />
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}