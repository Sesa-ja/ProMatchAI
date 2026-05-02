import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import MobileUserTypeSelection from './MobileUserTypeSelection';
import MobileAuthWrapper from './MobileAuthWrapper';
import MobileApplicationTracking from './MobileApplicationTracking';
import MobileEmailSettings from './MobileEmailSettings';
import { Button } from './ui/button';

type DemoScreen = 
  | 'menu'
  | 'user-type'
  | 'auth'
  | 'applications'
  | 'email-settings';

export default function MobileUIDemo() {
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>('menu');
  const [selectedUserType, setSelectedUserType] = useState<'refugee' | 'employer'>('refugee');

  const handleLogin = (email: string, password: string) => {
    console.log('Login:', email, password);
    alert(`Login successful for ${email}`);
    setCurrentScreen('menu');
  };

  const handleSignup = (name: string, email: string, password: string) => {
    console.log('Signup:', name, email, password);
    alert(`Account created for ${name}`);
    setCurrentScreen('menu');
  };

  const handleUserTypeSelection = (userType: 'refugee' | 'employer' | 'professional' | 'university_student') => {
    console.log('User type selected:', userType);
    setSelectedUserType(userType === 'refugee' || userType === 'employer' ? userType : 'refugee');
    setCurrentScreen('auth');
  };

  const menuItems = [
    { id: 'user-type' as DemoScreen, title: 'User Type Selection', description: 'Choose account type' },
    { id: 'auth' as DemoScreen, title: 'Authentication Flow', description: 'Login, Signup, Password Reset' },
    { id: 'applications' as DemoScreen, title: 'Application Tracking', description: 'View and manage applications' },
    { id: 'email-settings' as DemoScreen, title: 'Email Settings', description: 'Notification preferences' },
  ];

  if (currentScreen === 'user-type') {
    return <MobileUserTypeSelection onSelectUserType={handleUserTypeSelection} />;
  }

  if (currentScreen === 'auth') {
    return (
      <MobileAuthWrapper
        userType={selectedUserType}
        onLoginSuccess={handleLogin}
        onSignupSuccess={handleSignup}
        onBack={() => setCurrentScreen('menu')}
      />
    );
  }

  if (currentScreen === 'applications') {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4 border-b">
          <button onClick={() => setCurrentScreen('menu')} className="flex items-center text-gray-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Menu</span>
          </button>
        </div>
        <MobileApplicationTracking
          userId="demo-user-123"
          applications={[
            {
              id: '1',
              jobTitle: 'Frontend Developer',
              company: 'Tech Solutions GmbH',
              status: 'interviewing',
              appliedDate: '2024-03-15',
              lastUpdated: '2024-03-20',
            },
            {
              id: '2',
              jobTitle: 'Digital Marketing Specialist',
              company: 'Marketing Plus',
              status: 'pending',
              appliedDate: '2024-03-18',
              lastUpdated: '2024-03-18',
            },
            {
              id: '3',
              jobTitle: 'Customer Service Representative',
              company: 'Global Services Inc',
              status: 'accepted',
              appliedDate: '2024-03-10',
              lastUpdated: '2024-03-22',
            },
            {
              id: '4',
              jobTitle: 'Data Analyst',
              company: 'Analytics Corp',
              status: 'rejected',
              appliedDate: '2024-03-05',
              lastUpdated: '2024-03-12',
            },
          ]}
          isLoading={false}
          onViewApplication={(id) => alert(`View application: ${id}`)}
        />
      </div>
    );
  }

  if (currentScreen === 'email-settings') {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4 border-b">
          <button onClick={() => setCurrentScreen('menu')} className="flex items-center text-gray-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Menu</span>
          </button>
        </div>
        <MobileEmailSettings
          userId="demo-user-123"
          onSave={async (prefs) => {
            console.log('Saving preferences:', prefs);
          }}
        />
      </div>
    );
  }

  // Menu Screen
  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4"></div>
          <h1 className="text-2xl text-gray-900 mb-2">Mobile UI Demo</h1>
          <p className="text-gray-600">Clean, professional Android app design</p>
        </div>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
            >
              <h3 className="text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm text-gray-700 mb-2">Design Features:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Clean, minimal sans-serif typography</li>
            <li>✓ Consistent blue primary color (#2563EB)</li>
            <li>✓ Neutral white/gray backgrounds</li>
            <li>✓ Fully scrollable mobile-first layouts</li>
            <li>✓ Loading states and error handling</li>
            <li>✓ Professional Google sign-in integration</li>
            <li>✓ Smooth keyboard-friendly inputs</li>
            <li>✓ Standard Android UI patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
