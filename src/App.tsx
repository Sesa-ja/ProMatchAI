import { useState } from 'react';
import './styles/globals.css';
import Onboarding from './components/Onboarding';
import SkillProfiling from './components/SkillProfiling';
import Dashboard from './components/Dashboard';
import JobsTab from './components/JobsTab';
import LearnTab from './components/LearnTab';
import ProfileTab from './components/ProfileTab';
import RefugeeLogin from './components/RefugeeLogin';
import RefugeeSignup from './components/RefugeeSignup';
import AdminLogin from './components/AdminLogin';
import AdminSignup from './components/AdminSignup';
import AdminPanel from './components/AdminPanel';
import AICareerAssistant from './components/AICareerAssistant';
import AISkillMatchingFlow from './components/AISkillMatchingFlow';
import LanguageSwitcher from './components/LanguageSwitcher';
import NotificationBell from './components/NotificationBell';
import NotificationsView from './components/NotificationsView';
import Logo from './components/Logo';
import MobileUIDemo from './components/MobileUIDemo';
import { Home, Briefcase, BookOpen, User } from 'lucide-react';
import type { ProfileAchievement } from './utils/profileAchievements';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { ToastContainer, useToast } from './components/ui/toast';
import { getTranslation } from './utils/translations';
import { Handshake } from 'lucide-react';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-215f50be`;

// Helper function to remove duplicate applications
const cleanupDuplicateApplications = (applications: Application[]): Application[] => {
  if (!applications || applications.length === 0) return [];
  
  const seen = new Set<string>();
  const uniqueApplications: Application[] = [];
  
  for (const app of applications) {
    if (!seen.has(app.id)) {
      seen.add(app.id);
      uniqueApplications.push(app);
    }
  }
  
  return uniqueApplications;
};

export type UserType = 'refugee' | 'employer' | 'professional' | 'university_student' | null;
export type Language = 'en' | 'ar' | 'fr' | 'de' | 'uk' | 'es' | 'it' | 'tr' | 'fa' | 'ru';

export interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export type ApplicationStatus = 'submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  introduction?: string;
}

export interface CourseProgress {
  progress: number;
  downloaded: boolean;
  lastAccessedAt?: string;
}

export interface EarnedCertificate {
  id: string;
  courseId?: string;
  courseTitle: string;
  certificateName: string;
  issuer: string;
  completedAt: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  languages?: string[];
  profilePicture?: string;
  organizationName?: string; // For employers
  organizationDescription?: string; // For employers
  organizationLogo?: string; // For employers
  jobsOffered?: string[]; // For employers
  skills: string[];
  learning?: string[];
  education: Education[];
  experience: Experience[];
  completedCourses: number;
  badges: string[];
  earnedCertificates?: EarnedCertificate[];
  interests?: string[];
  preferredSectors?: string[];
  preferredOpportunityTypes?: string[];
  bio?: string;
  summary?: string;
  workModePreference?: string;
  language: Language;
  userType: UserType;
  applications?: Application[];
  achievements?: ProfileAchievement[];
  courseProgress?: Record<string, CourseProgress>;
  refugeeSubType?: 'refugee_student' | 'professional_job_seeker' | 'university_student'; // New field for refugee subcategories
}

type ScreenType = 'onboarding' | 'refugee-login' | 'refugee-signup' | 'profiling' | 'main' | 'admin-login' | 'admin-signup' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('onboarding');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'learn' | 'profile'>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const { toasts, removeToast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    skills: [],
    languages: ['English'],
    learning: [],
    education: [],
    experience: [],
    completedCourses: 0,
    badges: [],
    earnedCertificates: [],
    interests: [],
    preferredSectors: [],
    preferredOpportunityTypes: [],
    bio: '',
    summary: '',
    workModePreference: 'flexible',
    language: 'en',
    userType: null,
  });

  const t = getTranslation(userProfile.language);

  const getLanguageLabel = (language: Language) => {
    switch (language) {
      case 'ar':
        return 'Arabic';
      case 'fr':
        return 'French';
      case 'de':
        return 'German';
      case 'uk':
        return 'Ukrainian';
      case 'es':
        return 'Spanish';
      case 'it':
        return 'Italian';
      case 'tr':
        return 'Turkish';
      case 'fa':
        return 'Farsi';
      case 'ru':
        return 'Russian';
      default:
        return 'English';
    }
  };

  // Check for demo mode in URL
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('demo') === 'mobile';

  if (isDemoMode) {
    return <MobileUIDemo />;
  }

  const handleLanguageChange = (language: Language) => {
    const updatedProfile = { ...userProfile, language };
    setUserProfile(updatedProfile);
    
    // Update in localStorage if user exists
    if (userProfile.id) {
      try {
        const storedUsers = localStorage.getItem('promatchai_users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const userIndex = users.findIndex((u: any) => u.id === userProfile.id);
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], language };
            localStorage.setItem('promatchai_users', JSON.stringify(users));
          }
        }
      } catch (error) {
        console.error('Error updating language in localStorage:', error);
      }
    }
  };

  const handleLanguageSelect = (language: Language, userType: UserType) => {
    if (userType === 'employer') {
      // Employers go to admin login
      setCurrentScreen('admin-login');
    } else {
      // Refugees go to login/signup
      setUserProfile({
        ...userProfile,
        language,
        userType,
        languages: [getLanguageLabel(language)],
      });
      setCurrentScreen('refugee-login');
    }
  };

  const handleRefugeeSignup = async (email: string, password: string, name: string, language: Language) => {
    // Use localStorage as primary storage for demo/offline capability
    try {
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        language,
        userType: 'refugee' as UserType,
        skills: [],
        languages: [getLanguageLabel(language)],
        learning: [],
        education: [],
        experience: [],
        completedCourses: 0,
        badges: [],
        earnedCertificates: [],
        interests: [],
        preferredSectors: [],
        preferredOpportunityTypes: [],
        bio: '',
        summary: '',
        workModePreference: 'flexible',
      };
      
      // Check if email already exists
      const storedUsers = localStorage.getItem('promatchai_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        alert('An account with this email already exists. Please log in.');
        return;
      }
      
      // Store in localStorage
      users.push(newUser);
      localStorage.setItem('promatchai_users', JSON.stringify(users));
      
      setUserProfile(newUser);
      setCurrentScreen('profiling');
      
      // Try to sync with backend in the background (non-blocking)
      fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          name,
          language,
          userType: 'refugee',
          skills: [],
          languages: [language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : language === 'de' ? 'German' : language === 'uk' ? 'Ukrainian' : language === 'es' ? 'Spanish' : 'English'],
          learning: [],
          completedCourses: 0,
          badges: [],
          earnedCertificates: [],
          interests: [],
          preferredSectors: [],
          preferredOpportunityTypes: [],
          bio: '',
          summary: '',
          workModePreference: 'flexible',
        }),
      }).catch(() => {
        // Silently fail - we're already using localStorage
        console.log('Backend unavailable, using local storage only');
      });
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Signup failed. Please try again.');
    }
  };

  const handleRefugeeLogin = async (email: string, password: string) => {
    // Use localStorage as primary storage for demo/offline capability
    try {
      const storedUsers = localStorage.getItem('promatchai_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const user = users.find((u: any) => u.email === email && u.userType === 'refugee');
        
        if (user) {
          // Clean up any duplicate applications
          if (user.applications && user.applications.length > 0) {
            user.applications = cleanupDuplicateApplications(user.applications);
            
            // Update localStorage with cleaned data
            const userIndex = users.findIndex((u: any) => u.email === email && u.userType === 'refugee');
            if (userIndex !== -1) {
              users[userIndex] = user;
              localStorage.setItem('promatchai_users', JSON.stringify(users));
            }
          }
          
          setUserProfile(user);
          setCurrentScreen('main');
          return;
        }
      }
      
      // If not found in localStorage, try backend
      try {
        const response = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });

        if (!response.ok) throw new Error('Backend unavailable');

        const result = await response.json();
        
        if (result.success) {
          const user = result.data.find((u: any) => u.email === email && u.userType === 'refugee');
          
          if (user) {
            // Cache in localStorage
            const storedUsers = localStorage.getItem('promatchai_users');
            const users = storedUsers ? JSON.parse(storedUsers) : [];
            users.push(user);
            localStorage.setItem('promatchai_users', JSON.stringify(users));
            
            setUserProfile(user);
            setCurrentScreen('main');
            return;
          }
        }
      } catch (backendError) {
        console.log('Backend unavailable, using local storage only');
      }
      
      alert('Invalid credentials. Please check your email and password or sign up.');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleAdminSignup = async (email: string, password: string, name: string, organizationName: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          name,
          organizationName,
          userType: 'employer',
          languages: ['English'],
          language: 'en',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentScreen('admin');
      } else {
        alert('Admin signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error signing up admin:', error);
      alert('Admin signup failed. Please try again.');
    }
  };

  const handleSkillsComplete = async (skills: string[], name: string) => {
    const updatedProfile = { ...userProfile, skills, name };
    setUserProfile(updatedProfile);
    
    // Update in localStorage
    if (userProfile.id) {
      try {
        const storedUsers = localStorage.getItem('promatchai_users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const userIndex = users.findIndex((u: any) => u.id === userProfile.id);
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], skills, name };
            localStorage.setItem('promatchai_users', JSON.stringify(users));
          }
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
      
      // Try to sync with backend in the background (non-blocking)
      fetch(`${API_URL}/users/${userProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ skills, name }),
      }).catch(() => {
        console.log('Backend unavailable, using local storage only');
      });
    }
    
    setCurrentScreen('main');
  };

  const handleCourseComplete = async (certificate: EarnedCertificate) => {
    const nextBadges = [...userProfile.badges, certificate.certificateName];
    const nextEarnedCertificates = [...(userProfile.earnedCertificates || []), certificate];
    const updatedProfile = {
      ...userProfile,
      completedCourses: userProfile.completedCourses + 1,
      badges: nextBadges,
      earnedCertificates: nextEarnedCertificates,
    };

    setUserProfile(updatedProfile);

    if (userProfile.id) {
      try {
        const storedUsers = localStorage.getItem('promatchai_users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const updatedUsers = users.map((user: UserProfile) =>
            String(user.id) === String(userProfile.id) ? updatedProfile : user,
          );
          localStorage.setItem('promatchai_users', JSON.stringify(updatedUsers));
        }
      } catch (error) {
        console.error('Error updating earned certificates in localStorage:', error);
      }

      try {
        await fetch(`${API_URL}/users/${userProfile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            completedCourses: updatedProfile.completedCourses,
            badges: updatedProfile.badges,
            earnedCertificates: updatedProfile.earnedCertificates,
          }),
        });
      } catch (error) {
        console.error('Error syncing earned certificates to backend:', error);
      }
    }
  };

  const handleAdminLogin = () => {
    setCurrentScreen('admin');
  };

  const handleAdminLogout = () => {
    setCurrentScreen('onboarding');
  };

  const handleRefugeeLogout = () => {
    setShowNotifications(false);
    setUserProfile({
      name: '',
      skills: [],
      languages: ['English'],
      learning: [],
      education: [],
      experience: [],
      completedCourses: 0,
      badges: [],
      earnedCertificates: [],
      interests: [],
      preferredSectors: [],
      preferredOpportunityTypes: [],
      bio: '',
      summary: '',
      workModePreference: 'flexible',
      language: 'en',
      userType: null,
    });
    setCurrentScreen('onboarding');
  };

  // Screen routing
  if (currentScreen === 'refugee-login') {
    return (
      <RefugeeLogin
        onLogin={handleRefugeeLogin}
        onSignup={() => setCurrentScreen('refugee-signup')}
        onBack={() => setCurrentScreen('onboarding')}
      />
    );
  }

  if (currentScreen === 'refugee-signup') {
    return (
      <RefugeeSignup
        onSignup={handleRefugeeSignup}
        onBackToLogin={() => setCurrentScreen('refugee-login')}
        language={userProfile.language}
      />
    );
  }

  if (currentScreen === 'admin-login') {
    return (
      <AdminLogin
        onLogin={handleAdminLogin}
        onSignup={() => setCurrentScreen('admin-signup')}
        onBack={() => setCurrentScreen('onboarding')}
      />
    );
  }

  if (currentScreen === 'admin-signup') {
    return (
      <AdminSignup
        onSignup={handleAdminSignup}
        onBackToLogin={() => setCurrentScreen('admin-login')}
      />
    );
  }

  if (currentScreen === 'admin') {
    return <AdminPanel onLogout={handleAdminLogout} />;
  }

  if (currentScreen === 'onboarding') {
    return <Onboarding onLanguageSelect={handleLanguageSelect} />;
  }

  if (currentScreen === 'profiling') {
    return (
      <SkillProfiling
        language={userProfile.language}
        onComplete={handleSkillsComplete}
        onBack={() => setCurrentScreen('refugee-signup')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header with Language Switcher - Clean Design */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5 rounded-[22px]">
            <Handshake className="w-6 h-6 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-[1.05rem] font-medium leading-tight text-slate-700">ProMatchAI</span>
              <span className="text-[11px] text-slate-500">Powered by AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userProfile.userType === 'refugee' && currentScreen === 'main' && (
              <div className="rounded-full border border-slate-200 bg-white shadow-sm">
                <NotificationBell
                  onClick={() => setShowNotifications(true)}
                  userProfile={userProfile}
                />
              </div>
            )}
            <LanguageSwitcher 
              currentLanguage={userProfile.language} 
              onLanguageChange={handleLanguageChange}
            />
            {userProfile.userType === 'refugee' && (
              userProfile.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt={userProfile.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-200 ring-offset-2"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)] text-xs text-white ring-2 ring-blue-200 ring-offset-2 shadow-sm">
                  {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {showNotifications ? (
          <NotificationsView
            userProfile={userProfile}
            onBack={() => setShowNotifications(false)}
          />
        ) : (
          <>
            {activeTab === 'home' && <Dashboard userProfile={userProfile} onUpdateProfile={setUserProfile} />}
            {activeTab === 'jobs' && <JobsTab userProfile={userProfile} />}
            {activeTab === 'learn' && <LearnTab userProfile={userProfile} onCourseComplete={handleCourseComplete} onUpdateProfile={setUserProfile} />}
            {activeTab === 'profile' && <ProfileTab userProfile={userProfile} onLogout={handleRefugeeLogout} onUpdateProfile={setUserProfile} />}
          </>
        )}
      </div>

      {/* AI Career Assistant - Floating Button */}
      {!showNotifications && <AICareerAssistant userProfile={userProfile} language={userProfile.language} />}

      {/* Bottom Navigation - Clean Design */}
      <nav className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom shadow-sm">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`relative flex flex-col items-center px-3 pb-1 pt-3 transition-all ${
              activeTab === 'home' 
                ? 'text-[#2E63C3]' 
                : 'text-gray-500 hover:text-[#5B7BD5]'
            }`}
          >
            <span
              className={`absolute left-1/2 top-0 h-1 -translate-x-1/2 rounded-full transition-all ${
                activeTab === 'home' ? 'w-10 bg-[#5B7BD5]' : 'w-0 bg-transparent'
              }`}
            />
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">{t.navHome}</span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`relative flex flex-col items-center px-3 pb-1 pt-3 transition-all ${
              activeTab === 'jobs' 
                ? 'text-[#2E63C3]' 
                : 'text-gray-500 hover:text-[#5B7BD5]'
            }`}
          >
            <span
              className={`absolute left-1/2 top-0 h-1 -translate-x-1/2 rounded-full transition-all ${
                activeTab === 'jobs' ? 'w-10 bg-[#5B7BD5]' : 'w-0 bg-transparent'
              }`}
            />
            <Briefcase className="w-6 h-6" />
            <span className="text-xs mt-1">{t.navJobs}</span>
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`relative flex flex-col items-center px-3 pb-1 pt-3 transition-all ${
              activeTab === 'learn' 
                ? 'text-[#2E63C3]' 
                : 'text-gray-500 hover:text-[#5B7BD5]'
            }`}
          >
            <span
              className={`absolute left-1/2 top-0 h-1 -translate-x-1/2 rounded-full transition-all ${
                activeTab === 'learn' ? 'w-10 bg-[#5B7BD5]' : 'w-0 bg-transparent'
              }`}
            />
            <BookOpen className="w-6 h-6" />
            <span className="text-xs mt-1">{t.navLearn}</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`relative flex flex-col items-center px-3 pb-1 pt-3 transition-all ${
              activeTab === 'profile' 
                ? 'text-[#2E63C3]' 
                : 'text-gray-500 hover:text-[#5B7BD5]'
            }`}
          >
            <span
              className={`absolute left-1/2 top-0 h-1 -translate-x-1/2 rounded-full transition-all ${
                activeTab === 'profile' ? 'w-10 bg-[#5B7BD5]' : 'w-0 bg-transparent'
              }`}
            />
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">{t.navProfile}</span>
          </button>
        </div>
      </nav>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
