'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: 'admin' | 'student';
  [key: string]: any; // Extend this based on your JWT payload
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (res.ok && data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/');
        }
      } catch (error) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-purple-100 to-blue-100">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold text-purple-700">Welcome {user?.email}!</h1>
        <p className="text-gray-700">You're logged in as a <strong>{user?.role}</strong>.</p>

        {/* Add more personalized dashboard content here */}
      </div>
    </main>
  );
}
