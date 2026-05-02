import { useState } from 'react';
import { Users, Building2, GraduationCap, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface UserTypeOption {
  id: 'refugee' | 'employer' | 'professional' | 'university_student';
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface MobileUserTypeSelectionProps {
  onSelectUserType: (userType: 'refugee' | 'employer' | 'professional' | 'university_student') => void;
}

export default function MobileUserTypeSelection({ onSelectUserType }: MobileUserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const userTypes: UserTypeOption[] = [
    {
      id: 'refugee',
      title: 'Find Opportunities',
      description: 'Search for jobs, training, and skill development',
      icon: <Users className="w-8 h-8" />,
    },
    {
      id: 'employer',
      title: 'Post Opportunities',
      description: 'Find talented candidates and connect with professionals',
      icon: <Building2 className="w-8 h-8" />,
    },
    {
      id: 'university_student',
      title: 'Student Portal',
      description: 'Access internships, part-time jobs, and career guidance',
      icon: <GraduationCap className="w-8 h-8" />,
    },
    {
      id: 'professional',
      title: 'Career Growth',
      description: 'Network, upskill, and advance your career',
      icon: <Briefcase className="w-8 h-8" />,
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      onSelectUserType(selectedType as any);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6"></div>
        <h1 className="text-2xl text-gray-900 mb-3">Welcome to ProMatchAI</h1>
        <p className="text-gray-600">Choose how you'd like to use the platform</p>
      </div>

      {/* User Type Cards */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-4">
          {userTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                selectedType === type.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
                {selectedType === type.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button - Fixed at bottom */}
        <div className="mt-8 pb-safe">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
