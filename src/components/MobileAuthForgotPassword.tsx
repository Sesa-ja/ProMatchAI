import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MobileAuthForgotPasswordProps {
  onResetPassword: (email: string) => Promise<void>;
  onBack: () => void;
}

export default function MobileAuthForgotPassword({ 
  onResetPassword, 
  onBack 
}: MobileAuthForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onResetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="p-4">
          <button onClick={onBack} className="flex items-center text-gray-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to login</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl text-gray-900 mb-3 text-center">Email sent successfully</h1>
          <p className="text-gray-600 text-center mb-8">
            We've sent a password reset link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500 text-center mb-8">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Button
            onClick={onBack}
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
      {/* Header */}
      <div className="p-4">
        <button onClick={onBack} className="flex items-center text-gray-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl text-gray-900 mb-3">Forgot password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </div>
    </div>
  );
}
