'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Login Page - STORY-005: Rol-gebaseerd inloggen
 * 
 * Implements:
 * - Login flow with role-based access
 * - Inline error display (no error boxes per UX guidelines)
 * - Redirect to role-specific dashboard after login
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect happens automatically via auth context
      router.push('/dashboard');
    } catch (err) {
      // Inline error display as per UX guidelines
      setError(err instanceof Error ? err.message : 'Inloggen mislukt. Probeer opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            VVE Tooling
          </h1>
          <h2 className="mt-2 text-center text-xl text-gray-600">
            Inloggen op uw account
          </h2>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Inline error message (no modal/error box) */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mailadres
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="uw@email.nl"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Onthoud mij
              </label>
            </div>

            <div className="text-sm">
              <a href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Wachtwoord vergeten?
              </a>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-2 text-center text-sm text-gray-600">
          Nog geen account?{' '}
          <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            Registreer hier
          </a>
        </p>
      </div>
    </div>
  );
}
