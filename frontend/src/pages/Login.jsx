import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
        if (error) throw error;
        alert('Check your email for the login link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetEmailSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img className="mx-auto h-16 w-auto" src="/logo.png" alt="FrankCreatives" />
          <h2 className="mt-6 text-3xl font-extrabold text-brand-black dark:text-white">
            FrankCreatives Community
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {showForgotPassword 
              ? 'Reset your password' 
              : (isSignUp ? 'Create your account' : 'Sign in to your account')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          {showForgotPassword ? (
            // Forgot Password Form
            resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm">
                  Check your email for the password reset link!
                </div>
                <button
                  onClick={resetToLogin}
                  className="w-full text-center text-sm text-brand-green hover:text-green-600 font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 transition-colors duration-200"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="w-full text-center text-sm text-brand-green hover:text-green-600 font-medium transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )
          ) : (
            // Login / Sign Up Form
            <>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                {!isSignUp && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(true); setError(null); }}
                      className="text-sm text-brand-green hover:text-green-600 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 transition-colors duration-200"
                  >
                    {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-center text-sm text-brand-green hover:text-green-600 font-medium transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

