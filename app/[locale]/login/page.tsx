"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Kërkojmë nga NextAuth të na verifikojë
    const res = await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    });

    if (res?.error) {
      setError("Emaili ose fjalëkalimi është i gabuar!");
    } else {
      router.push("/"); // Kthehemi te Dashboard-i nëse është i saktë
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Miresevini</h1>
          <p className="text-gray-500 mt-2 text-sm">Hyni në panelin e administrimit</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emaili</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full border p-2.5 rounded-md text-sm outline-none focus:border-gray-900" 
              placeholder="admin@flow-events.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fjalëkalimi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full border p-2.5 rounded-md text-sm outline-none focus:border-gray-900" 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-md mt-2 hover:bg-gray-800 transition-colors">
            Hyr në Sistem
          </button>
        </form>
      </div>
    </div>
  );
}