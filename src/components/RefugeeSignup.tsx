import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowLeft, Sparkles, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Language } from '../App';

interface RefugeeSignupProps {
  onSignup: (email: string, password: string, name: string, language: Language) => void;
  onBackToLogin: () => void;
  language: Language;
}

const languages: Array<{ code: Language; name: string; nativeLabel: string; shortCode: string }> = [
  { code: 'en', name: 'English', nativeLabel: 'English', shortCode: 'EN' },
  { code: 'de', name: 'German', nativeLabel: 'Deutsch', shortCode: 'DE' },
  { code: 'fr', name: 'French', nativeLabel: 'Francais', shortCode: 'FR' },
  { code: 'ar', name: 'Arabic', nativeLabel: 'Arabic', shortCode: 'AR' },
  { code: 'es', name: 'Spanish', nativeLabel: 'Espanol', shortCode: 'ES' },
  { code: 'uk', name: 'Ukrainian', nativeLabel: 'Ukrainian', shortCode: 'UA' },
  { code: 'it', name: 'Italian', nativeLabel: 'Italiano', shortCode: 'IT' },
  { code: 'tr', name: 'Turkish', nativeLabel: 'Turkce', shortCode: 'TR' },
  { code: 'fa', name: 'Farsi', nativeLabel: 'Farsi', shortCode: 'FA' },
  { code: 'ru', name: 'Russian', nativeLabel: 'Russkiy', shortCode: 'RU' },
];

export default function RefugeeSignup({ onSignup, onBackToLogin, language }: RefugeeSignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');

  const filteredLanguages = languages.filter((lang) => {
    const query = languageSearch.trim().toLowerCase();
    if (!query) return true;

    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeLabel.toLowerCase().includes(query) ||
      lang.shortCode.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      await onSignup(email, password, name, selectedLanguage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const googleUser = {
      name: 'Demo User (Google)',
      email: `google.user.${Date.now()}@gmail.com`,
    };

    setLoading(true);
    try {
      onSignup(googleUser.email, 'google-oauth-login', googleUser.name, selectedLanguage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    alert(`${provider} signup UI is ready. Connect ${provider} OAuth in Supabase to make it functional.`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_52%,#eef6ff_100%)] flex flex-col">
      <div className="p-4">
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)] text-white">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span>Back</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 pb-20">
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#3b82f6_0%,#7c3aed_100%)] shadow-[0_18px_40px_rgba(59,130,246,0.22)]">
              <Sparkles className="h-9 w-9 text-white" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-400" />
            </div>
            <h1 className="mt-4 text-[2rem] font-semibold tracking-tight text-slate-700">Create your account</h1>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
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

          <div className="mb-6">
            <p className="mb-4 text-center text-sm text-slate-500">Or sign up with social networks</p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignup('Facebook')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-[#1877F2] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Continue with Facebook"
              >
                <span className="text-xl font-semibold">f</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('Apple')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Continue with Apple"
              >
                <span className="text-lg font-semibold">A</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('X')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-white text-sky-500 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Continue with X"
              >
                <span className="text-base font-semibold">X</span>
              </button>
            </div>
          </div>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 shadow-none focus-visible:ring-blue-200"
                  required
                />
              </div>
            </div>

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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 pr-10 shadow-none focus-visible:ring-blue-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 pr-10 shadow-none focus-visible:ring-blue-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Language</label>
              <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white px-3 text-left shadow-none focus:ring-blue-200">
                  <SelectValue placeholder="Select preferred language" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 bg-white shadow-xl">
                  <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="text"
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        placeholder="Search language"
                        className="h-10 rounded-xl border-slate-200 bg-slate-50/80 pl-9 shadow-none focus-visible:ring-blue-200"
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {filteredLanguages.length > 0 ? filteredLanguages.map((lang) => (
                    <SelectItem
                      key={lang.code}
                      value={lang.code}
                      className="rounded-xl px-3 py-3 focus:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)] text-xs font-semibold text-white">
                          {lang.shortCode}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{lang.name}</span>
                          <span className="text-xs text-slate-500">{lang.nativeLabel}</span>
                        </div>
                      </div>
                    </SelectItem>
                  )) : (
                    <div className="px-3 py-4 text-center text-sm text-slate-500">
                      No matching languages found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-blue-600"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-violet-600">Terms of Service</a> and <a href="#" className="text-violet-600">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-6 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#ef5b2f_0%,#db2777_100%)] text-white shadow-[0_16px_30px_rgba(219,39,119,0.24)] hover:opacity-95"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="pt-4 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={onBackToLogin}
                className="font-medium text-violet-600"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
