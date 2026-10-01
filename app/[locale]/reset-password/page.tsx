"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Marrja e tokenit direkt nga linku i emailit
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nëse dikush futet në faqe pa patur një token në link
  if (!token) {
    return (
      <div className="flex justify-center mt-20">
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-2">Link i Pavlefshëm</h2>
          <p>Mungon kodi i sigurisë (token) në URL. Ju lutem klikoni linkun e saktë nga emaili juaj.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validimi nëse fjalëkalimet përputhen
    if (newPassword !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen!');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Fjalëkalimi duhet të ketë të paktën 6 karaktere.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ndodhi një gabim gjatë lidhjes me serverin.');
      } else {
        setMessage('Fjalëkalimi u ndryshua me sukses! Po ju ridrejtojmë në faqen e kyçjes...');
        // Ridrejtimi në faqen e Login pas 3 sekondash
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err) {
      setError('Gabim në rrjet. Ju lutem kontrolloni lidhjen tuaj të internetit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#0c2347]">Krijo Fjalëkalimin e Ri</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {message && <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fjalëkalimi i Ri</label>
          <input
            type="password"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#155be7] focus:border-[#155be7] outline-none transition-all text-gray-900"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Shkruani fjalëkalimin e ri"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmo Fjalëkalimin</label>
          <input
            type="password"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#155be7] focus:border-[#155be7] outline-none transition-all text-gray-900"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Përsëritni fjalëkalimin e ri"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#155be7] text-white font-bold rounded-lg hover:bg-[#0c2347] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Po ruhet...' : 'Ruaj Fjalëkalimin'}
        </button>
      </form>
    </div>
  );
}

// Exporti kryesor i faqes me Suspense Wrapper
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mt-20 text-center text-gray-500">Po ngarkohet...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}