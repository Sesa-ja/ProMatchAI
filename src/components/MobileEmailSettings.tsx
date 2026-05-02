import { useState } from 'react';
import { Mail, Bell, CheckCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';

interface EmailPreferences {
  applicationUpdates: boolean;
  newJobMatches: boolean;
  weeklyDigest: boolean;
  courseRecommendations: boolean;
  systemNotifications: boolean;
}

interface MobileEmailSettingsProps {
  userId: string;
  onSave?: (preferences: EmailPreferences) => Promise<void>;
}

export default function MobileEmailSettings({ userId, onSave }: MobileEmailSettingsProps) {
  const [preferences, setPreferences] = useState<EmailPreferences>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`email_preferences_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      applicationUpdates: true,
      newJobMatches: true,
      weeklyDigest: false,
      courseRecommendations: true,
      systemNotifications: true,
    };
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setShowSuccess(false);

    try {
      // Save to localStorage
      localStorage.setItem(`email_preferences_${userId}`, JSON.stringify(preferences));

      // Call external save function if provided
      if (onSave) {
        await onSave(preferences);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const notificationSettings = [
    {
      key: 'applicationUpdates' as keyof EmailPreferences,
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      title: 'Application Updates',
      description: 'Get notified when your application status changes',
    },
    {
      key: 'newJobMatches' as keyof EmailPreferences,
      icon: <Bell className="w-5 h-5 text-purple-600" />,
      title: 'New Job Matches',
      description: 'Receive alerts for jobs matching your profile',
    },
    {
      key: 'weeklyDigest' as keyof EmailPreferences,
      icon: <Mail className="w-5 h-5 text-green-600" />,
      title: 'Weekly Digest',
      description: 'Summary of new opportunities and updates',
    },
    {
      key: 'courseRecommendations' as keyof EmailPreferences,
      icon: <Settings className="w-5 h-5 text-orange-600" />,
      title: 'Course Recommendations',
      description: 'Get personalized learning suggestions',
    },
    {
      key: 'systemNotifications' as keyof EmailPreferences,
      icon: <Bell className="w-5 h-5 text-gray-600" />,
      title: 'System Notifications',
      description: 'Important updates and announcements',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl text-gray-900 mb-2">Email Notifications</h2>
          <p className="text-sm text-gray-600">
            Choose which emails you'd like to receive
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">Preferences saved successfully</p>
              <p className="text-xs text-green-700 mt-1">Your email notification settings have been updated</p>
            </div>
          </div>
        )}

        {/* Settings List */}
        <div className="space-y-3 mb-6">
          {notificationSettings.map((setting) => (
            <div
              key={setting.key}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {setting.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{setting.title}</h3>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3">
                  <input
                    type="checkbox"
                    checked={preferences[setting.key]}
                    onChange={() => handleToggle(setting.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can update these preferences at any time. Changes take effect immediately.
        </p>
      </div>
    </div>
  );
}
