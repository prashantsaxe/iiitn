'use client';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError("👀 Email, please! We can’t read your mind... yet.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
        headers: { 'Content-Type': 'application/json' }
      });
    
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
    
      setSuccess("✨ Magic link sent! Check your inbox.");
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5 animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-center">Sign in with Magic ✨</h2>

        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <select
          value={role}
          onChange={e => setRole(e.target.value as any)}
          className="w-full p-3 border rounded-xl bg-white text-gray-700"
        >
          <option value="student">🎓 Student</option>
          <option value="admin">🧑‍💼 Admin</option>
        </select>

        <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl font-medium transition ${
            loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
        >
        {loading ? 'Sending...' : 'Send Magic Link ✉️'}
        </button>


        {error && (
        <p className="text-red-500 text-sm text-center mt-2 animate-shake">
            {error}
        </p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center mt-2">{success}</p>
        )}
      </form>
    </div>
  );
}
