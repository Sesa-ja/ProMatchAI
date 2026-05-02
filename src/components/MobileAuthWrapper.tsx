import { useState } from 'react';
import MobileAuthLogin from './MobileAuthLogin';
import MobileAuthSignup from './MobileAuthSignup';
import MobileAuthForgotPassword from './MobileAuthForgotPassword';

interface MobileAuthWrapperProps {
  userType: 'refugee' | 'employer';
  onLoginSuccess: (email: string, password: string) => void;
  onSignupSuccess: (name: string, email: string, password: string) => void;
  onBack?: () => void;
}

type AuthScreen = 'login' | 'signup' | 'forgot-password';

export default function MobileAuthWrapper({ 
  userType, 
  onLoginSuccess, 
  onSignupSuccess,
  onBack 
}: MobileAuthWrapperProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');

  const handleGoogleLogin = () => {
    // Simulate Google OAuth
    alert('Google login integration would go here');
  };

  const handleResetPassword = async (email: string) => {
    // Simulate sending reset email
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Password reset email sent to:', email);
        resolve();
      }, 1000);
    });
  };

  if (currentScreen === 'signup') {
    return (
      <MobileAuthSignup
        userType={userType}
        onSignup={onSignupSuccess}
        onNavigateToLogin={() => setCurrentScreen('login')}
        onGoogleLogin={handleGoogleLogin}
        onBack={onBack}
      />
    );
  }

  if (currentScreen === 'forgot-password') {
    return (
      <MobileAuthForgotPassword
        onResetPassword={handleResetPassword}
        onBack={() => setCurrentScreen('login')}
      />
    );
  }

  return (
    <MobileAuthLogin
      userType={userType}
      onLogin={onLoginSuccess}
      onNavigateToSignup={() => setCurrentScreen('signup')}
      onNavigateToForgotPassword={() => setCurrentScreen('forgot-password')}
      onGoogleLogin={handleGoogleLogin}
      onBack={onBack}
    />
  );
}
