import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Lock, Shield, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  onSignup: () => void;
  onBack?: () => void;
}

export default function AdminLogin({ onLogin, onSignup, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication (in production, this should be backend-validated)
    if (username === 'admin' && password === 'admin123') {
      onLogin(username, password);
    } else {
      setError('Invalid credentials. Default: admin/admin123');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      {onBack && (
        <div className="p-4">
          <button onClick={onBack} className="flex items-center text-gray-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Sign in to manage the platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter username"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white mb-4">
            Sign in as Admin
          </Button>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-gray-600">Need an admin account? </span>
            <button
              type="button"
              onClick={onSignup}
              className="text-blue-600"
            >
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}