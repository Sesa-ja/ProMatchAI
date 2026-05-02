import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface RefugeeLoginProps {
  onLogin: (email: string, password: string) => void;
  onSignup: () => void;
  onBack: () => void;
}

export default function RefugeeLogin({ onLogin, onSignup, onBack }: RefugeeLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResetSent(true);
  };

  const handleGoogleLogin = () => {
    alert('Google login: Please configure OAuth at https://supabase.com/docs/guides/auth/social-login/auth-google');
  };

  const handleSocialLogin = (provider: string) => {
    alert(`${provider} login UI is ready. Connect ${provider} OAuth in Supabase to make it functional.`);
  };

  // Forgot Password Screen
  if (showForgotPassword) {
    if (resetSent) {
      return (
        <div className="min-h-screen bg-white flex flex-col">
          <div className="p-4">
            <button onClick={() => { setShowForgotPassword(false); setResetSent(false); }} className="flex items-center text-gray-600">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to login</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl text-gray-900 mb-3 text-center">Email sent successfully</h1>
            <p className="text-gray-600 text-center mb-8">
              We've sent a password reset link to <span className="font-medium">{resetEmail}</span>
            </p>
            <p className="text-sm text-gray-500 text-center mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
              className="w-full max-w-sm h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to login
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="p-4">
          <button onClick={() => setShowForgotPassword(false)} className="flex items-center text-gray-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl text-gray-900 mb-3">Forgot password?</h1>
            <p className="text-gray-600">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="flex-1 flex flex-col">
            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send reset link
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_52%,#eef6ff_100%)] flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)] text-white">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span>Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#3b82f6_0%,#7c3aed_100%)] shadow-[0_18px_40px_rgba(59,130,246,0.22)]">
            <Sparkles className="h-9 w-9 text-white" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-400" />
          </div>
          <h1 className="mt-4 text-[2rem] font-semibold tracking-tight text-slate-700">Welcome back</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="mb-6 space-y-4">
            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 shadow-none focus-visible:ring-blue-200"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 pr-10 shadow-none focus-visible:ring-blue-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-violet-600"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={loading}
            className="mb-4 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#ef5b2f_0%,#db2777_100%)] text-white shadow-[0_16px_30px_rgba(219,39,119,0.24)] hover:opacity-95"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mb-4 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-slate-700">Continue with Google</span>
          </button>

          <div className="mb-8">
            <p className="mb-4 text-center text-sm text-slate-500">Sign in with social networks</p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-[#1877F2] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Continue with Facebook"
              >
                <span className="text-xl font-semibold">f</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Continue with Apple"
              >
                <span className="text-lg font-semibold">A</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('X')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-white text-sky-500 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Continue with X"
              >
                <span className="text-base font-semibold">X</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={onSignup}
              className="font-medium text-violet-600"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
