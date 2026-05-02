import { useState, useRef } from 'react';
import { UserProfile, Education, Experience, EarnedCertificate } from '../App';
import { User, Mail, Phone, MapPin, Edit2, Check, X, Plus, Trash2, Download, Camera, LogOut, Sparkles, Share2, Wand2, FileText, Briefcase, Calendar, CheckCircle, GraduationCap, Award, Star, Globe, Edit, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import jsPDF from 'jspdf';
import AICVEnhancer from './AICVEnhancer';
import AIEthicsInfo from './AIEthicsInfo';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { getTranslation } from '../utils/translations';
import AIInfoTooltip from './AIInfoTooltip';
import { computeProfileAchievements } from '../utils/profileAchievements';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-215f50be`;

// Counters to ensure unique IDs
let educationCounter = 0;
let experienceCounter = 0;

interface ProfileTabProps {
  userProfile: UserProfile;
  onLogout?: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

const mockBadges = [
  { name: 'First Course', icon: '🎓', earned: true },
  { name: 'Quick Learner', icon: '⚡', earned: true },
  { name: 'Team Player', icon: '🤝', earned: false },
  { name: 'Tech Savvy', icon: '💻', earned: false },
  { name: 'Language Pro', icon: '🗣️', earned: false },
  { name: 'Top Performer', icon: '⭐', earned: false },
];

const badgeColors = [
  'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
  'bg-gradient-to-br from-green-400 to-green-600 text-white',
  'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
  'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
  'bg-gradient-to-br from-pink-400 to-pink-600 text-white',
  'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white',
];

const achievementStyles = {
  gold: {
    medal: 'bg-amber-100 text-amber-600',
    bar: 'bg-amber-400',
  },
  silver: {
    medal: 'bg-slate-100 text-slate-500',
    bar: 'bg-slate-400',
  },
  green: {
    medal: 'bg-emerald-100 text-emerald-600',
    bar: 'bg-emerald-400',
  },
  purple: {
    medal: 'bg-violet-100 text-violet-600',
    bar: 'bg-violet-400',
  },
} as const;

const skillTagStyles = [
  {
    dot: 'bg-[#2E63C3]',
    chip: 'border-[#D6E5F8] bg-[#EEF5FF] text-[#214B8D]',
  },
  {
    dot: 'bg-[#2F7A5D]',
    chip: 'border-[#D8EEE4] bg-[#EEF9F3] text-[#235D48]',
  },
  {
    dot: 'bg-[#C97A1B]',
    chip: 'border-[#F3E2CB] bg-[#FFF6EB] text-[#9A5C12]',
  },
  {
    dot: 'bg-[#8A52CC]',
    chip: 'border-[#E8DBF8] bg-[#F7F1FF] text-[#6F3FB0]',
  },
];

export default function ProfileTab({ userProfile, onLogout, onUpdateProfile }: ProfileTabProps) {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<EarnedCertificate | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);
  const [showAICVEnhancer, setShowAICVEnhancer] = useState(false);
  const [showAIEthics, setShowAIEthics] = useState(false);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState<number | null>(null);
  const [contactData, setContactData] = useState({
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    location: userProfile.location || '',
  });
  const [skillsData, setSkillsData] = useState(userProfile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [educationData, setEducationData] = useState<Education[]>(userProfile.education || []);
  const [experienceData, setExperienceData] = useState<Experience[]>(userProfile.experience || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = getTranslation(userProfile.language);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const applications = userProfile.applications || [];
  const profileHeadline =
    userProfile.summary ||
    userProfile.preferredSectors?.[0] ||
    userProfile.interests?.[0] ||
    userProfile.skills?.[0] ||
    'Career Profile';
  const achievements = userProfile.achievements || computeProfileAchievements(userProfile);
  const earnedCertificates: EarnedCertificate[] =
    userProfile.earnedCertificates && userProfile.earnedCertificates.length > 0
      ? userProfile.earnedCertificates
      : (userProfile.badges || [])
          .filter((badge): badge is string => typeof badge === 'string' && badge.trim().length > 0)
          .map((badge, index) => {
            const cleanedTitle = badge.trim();
            const looksGeneric = /^course completed$/i.test(cleanedTitle) || /^certificate$/i.test(cleanedTitle);

            return {
              id: `${cleanedTitle}-${index}`,
              courseTitle: looksGeneric ? `Completed Course ${index + 1}` : cleanedTitle,
              certificateName: looksGeneric ? `Course Certificate ${index + 1}` : `${cleanedTitle} Certificate`,
              issuer: 'ProMatchAI Learning Center',
              completedAt: new Date().toISOString(),
            };
          });

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedProfile = { ...userProfile, profilePicture: reader.result as string };
        onUpdateProfile(updatedProfile);
        updateBackend(updatedProfile);
        updateLocalStorage(updatedProfile); // Save to localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  const updateLocalStorage = (profile: UserProfile) => {
    if (profile.id) {
      try {
        const storedUsers = localStorage.getItem('promatchai_users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const userIndex = users.findIndex((u: any) => u.id === profile.id);
          if (userIndex !== -1) {
            users[userIndex] = profile;
            localStorage.setItem('promatchai_users', JSON.stringify(users));
          }
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
  };

  const updateBackend = async (profile: UserProfile) => {
    if (profile.id) {
      try {
        await fetch(`${API_URL}/users/${profile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(profile),
        });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleSaveContact = () => {
    const updatedProfile = { ...userProfile, ...contactData };
    onUpdateProfile(updatedProfile);
    updateBackend(updatedProfile);
    updateLocalStorage(updatedProfile); // Save to localStorage
    setEditingContact(false);
  };

  const handleSaveSkills = () => {
    const updatedProfile = { ...userProfile, skills: skillsData };
    onUpdateProfile(updatedProfile);
    updateBackend(updatedProfile);
    updateLocalStorage(updatedProfile); // Save to localStorage
    setEditingSkills(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsData.includes(newSkill.trim())) {
      setSkillsData([...skillsData, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsData(skillsData.filter(s => s !== skill));
  };

  const handleSaveEducation = () => {
    const updatedProfile = { ...userProfile, education: educationData };
    onUpdateProfile(updatedProfile);
    updateBackend(updatedProfile);
    updateLocalStorage(updatedProfile); // Save to localStorage
    setEditingEducation(false);
  };

  const handleAddEducation = () => {
    setEducationData([...educationData, {
      id: (educationCounter++).toString(),
      school: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
    }]);
  };

  const handleUpdateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educationData];
    updated[index] = { ...updated[index], [field]: value };
    setEducationData(updated);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationData(educationData.filter((_, i) => i !== index));
  };

  const handleSaveExperience = () => {
    const updatedProfile = { ...userProfile, experience: experienceData };
    onUpdateProfile(updatedProfile);
    updateBackend(updatedProfile);
    updateLocalStorage(updatedProfile); // Save to localStorage
    setEditingExperience(false);
  };

  const handleAddExperience = () => {
    setExperienceData([...experienceData, {
      id: (experienceCounter++).toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    }]);
  };

  const handleUpdateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experienceData];
    updated[index] = { ...updated[index], [field]: value };
    setExperienceData(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setExperienceData(experienceData.filter((_, i) => i !== index));
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(userProfile.name, 20, yPos);
    yPos += 10;

    // Contact Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (userProfile.email) doc.text(userProfile.email, 20, yPos);
    yPos += 5;
    if (userProfile.phone) doc.text(userProfile.phone, 20, yPos);
    yPos += 5;
    if (userProfile.location) doc.text(userProfile.location, 20, yPos);
    yPos += 15;

    // Skills
    if (userProfile.skills && userProfile.skills.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Skills', 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(userProfile.skills.join(', '), 20, yPos, { maxWidth: 170 });
      yPos += 15;
    }

    // Experience
    if (userProfile.experience && userProfile.experience.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Experience', 20, yPos);
      yPos += 7;
      userProfile.experience.forEach((exp) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(exp.position, 20, yPos);
        yPos += 5;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`${exp.company} - ${exp.location}`, 20, yPos);
        yPos += 5;
        doc.text(`${exp.startDate} - ${exp.endDate}`, 20, yPos);
        yPos += 5;
        if (exp.description) {
          doc.text(exp.description, 20, yPos, { maxWidth: 170 });
          yPos += 10;
        }
        yPos += 5;
      });
      yPos += 5;
    }

    // Education
    if (userProfile.education && userProfile.education.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Education', 20, yPos);
      yPos += 7;
      userProfile.education.forEach((edu) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${edu.degree} in ${edu.field}`, 20, yPos);
        yPos += 5;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(edu.school, 20, yPos);
        yPos += 5;
        doc.text(`${edu.startYear} - ${edu.endYear}`, 20, yPos);
        yPos += 10;
      });
    }

    // Certificates
    if (earnedCertificates.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Certificates', 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      earnedCertificates.forEach((certificate) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${badge}`, 20, yPos);
        yPos += 5;
      });
    }

    doc.save(`${userProfile.name}_CV.pdf`);
  };

  const handleDownloadCV = () => {
    handleGeneratePDF();
  };

  const handleShare = () => {
    alert('Share profile functionality would be implemented here. Users could share their digital CV via link or QR code.');
  };

  const handleEnhanceCV = () => {
    setShowAICVEnhancer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-[#D1E9F6] pb-4">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.10),transparent_30%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="absolute right-0 top-0 flex items-center gap-2">
              <button
                onClick={handleEnhanceCV}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16 backdrop-blur-sm transition-colors hover:bg-white/22"
                title={t.enhanceWithAI}
              >
                <Wand2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAIEthics(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16 backdrop-blur-sm transition-colors hover:bg-white/22"
                title="Learn about AI ethics"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4 mt-2">
              <div className="absolute inset-0 scale-110 rounded-full bg-[radial-gradient(circle,rgba(255,232,122,0.82)_0%,rgba(255,214,84,0.42)_38%,rgba(255,255,255,0)_72%)] blur-[2px]" />
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white/18 shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
                {userProfile.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/12">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={handleProfilePictureClick}
                className="absolute bottom-1 right-1 rounded-full bg-white px-2.5 py-2 text-[#3A69C9] shadow-md transition-colors hover:bg-[#F6FAFF]"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
            <h2 className="mb-1 text-[30px] leading-tight text-white">{userProfile.name}</h2>
            <p className="mb-6 text-sm text-white/85">
              {typeof profileHeadline === 'string' && profileHeadline.length > 32
                ? `${profileHeadline.slice(0, 32)}...`
                : profileHeadline}
            </p>

            <div className="grid w-full grid-cols-3 border-t border-white/20 pt-4">
              <div className="text-center">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-white/75">{t.skills}</div>
                <div className="mt-2 text-2xl text-white">{userProfile.skills?.length || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-white/75">Courses Completed</div>
                <div className="mt-2 text-2xl text-white">{userProfile.completedCourses}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-white/75">{t.applied}</div>
                <div className="mt-2 text-2xl text-white">{applications.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGeneratePDF}
            className="bg-white text-green-600 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-2 border-green-500"
          >
            <Download className="w-5 h-5" />
            <span>{t.downloadCV}</span>
          </button>
          <button
            onClick={handleShare}
            className="bg-white text-purple-600 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-2 border-purple-500"
          >
            <Share2 className="w-5 h-5" />
            <span>{t.shareProfile}</span>
          </button>
        </div>

        {/* Achievements */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-lg font-medium text-[#173B57]">Achievements</h2>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <p className="text-sm text-gray-600 mb-5">
            Achievement progress is synced with your profile activity and stored with your account.
          </p>

          <div className="space-y-5">
            {achievements.map((achievement) => {
              const style = achievementStyles[achievement.color];
              const progress = achievement.target > 0
                ? Math.min(100, (achievement.current / achievement.target) * 100)
                : 0;

              return (
                <div key={achievement.id} className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.medal}`}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm text-gray-900">{achievement.title}</h3>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {achievement.current}/{achievement.target}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        {/* My Applications */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-lg font-medium text-[#173B57]">
              <FileText className="w-5 h-5 text-blue-600" />
              {t.myApplications}
            </h2>
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <Briefcase className="w-3 h-3" />
              <span>{applications.length} {applications.length === 1 ? (t.myApplications.slice(0, -1) || 'Application') : t.myApplications}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 mb-1 truncate">{app.jobTitle}</h4>
                      <p className="text-sm text-gray-600 mb-1">{app.company}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{app.location}</span>
                      </div>
                    </div>
                    <ApplicationStatusBadge 
                      status={app.status}
                      translatedLabels={{
                        submitted: t.statusSubmitted,
                        under_review: t.statusUnderReview,
                        shortlisted: t.statusShortlisted,
                        accepted: t.statusAccepted,
                        rejected: t.statusRejected,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{t.appliedOn} {formatDate(app.appliedDate)}</span>
                  </div>
                  {app.introduction && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 italic">&ldquo;{app.introduction}&rdquo;</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>{t.noApplications}</p>
              <p className="text-sm">{t.startApplying}</p>
            </div>
          )}
        </div>
        </div>

        {/* Contact Information */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-lg font-medium text-[#173B57]">{t.contactInfo}</h2>
            <button
              onClick={() => {
                setContactData({
                  email: userProfile.email || '',
                  phone: userProfile.phone || '',
                  location: userProfile.location || '',
                });
                setEditingContact(true);
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">{t.edit}</span>
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-blue-500" />
              <span>{userProfile.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-5 h-5 text-green-500" />
              <span>{userProfile.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>{userProfile.location || 'No location provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Globe className="w-5 h-5 text-purple-500" />
              <span>{userProfile.language?.toUpperCase() || 'EN'}</span>
            </div>
          </div>
        </div>
        </div>

        {/* Skills */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-lg font-medium text-[#173B57]">{t.skills}</h2>
            <button
              onClick={() => {
                setSkillsData(userProfile.skills || []);
                setEditingSkills(true);
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">{t.edit}</span>
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-wrap gap-3">
            {(userProfile.skills || []).map((skill, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${skillTagStyles[index % skillTagStyles.length].chip}`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${skillTagStyles[index % skillTagStyles.length].dot}`}
                />
                <span>{skill}</span>
              </div>
            ))}
            {(!userProfile.skills || userProfile.skills.length === 0) && (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </div>
        </div>

        {/* Experience */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-lg font-medium text-[#173B57]">
              <Briefcase className="w-5 h-5 text-blue-600" />
              {t.experience}
            </h2>
            <button
              onClick={() => {
                setExperienceData(userProfile.experience || []);
                setEditingExperience(true);
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">{t.edit}</span>
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            {(userProfile.experience || []).map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-blue-50 rounded-r-lg transition-colors">
                <h3 className="text-gray-900">{exp.position}</h3>
                <p className="text-sm text-gray-600">{exp.company} - {exp.location}</p>
                <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
              </div>
            ))}
            {(!userProfile.experience || userProfile.experience.length === 0) && (
              <p className="text-gray-500">No work experience added yet</p>
            )}
          </div>
        </div>
        </div>

        {/* Education */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-lg font-medium text-[#173B57]">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              {t.education}
            </h2>
            <button
              onClick={() => {
                setEducationData(userProfile.education || []);
                setEditingEducation(true);
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">{t.edit}</span>
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            {(userProfile.education || []).map((edu, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 hover:bg-purple-50 rounded-r-lg transition-colors">
                <h3 className="text-gray-900">{edu.degree} in {edu.field}</h3>
                <p className="text-sm text-gray-600">{edu.school}</p>
                <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
              </div>
            ))}
            {(!userProfile.education || userProfile.education.length === 0) && (
              <p className="text-gray-500">No education added yet</p>
            )}
          </div>
        </div>
        </div>

        {/* Certificates */}
        <div>
          <div className="mb-3 px-1">
            <h2 className="text-lg font-medium text-[#173B57]">Certificates & Achievements</h2>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          {earnedCertificates.length > 0 ? (
            <div className="space-y-3">
              {earnedCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-blue-50 via-purple-50 to-transparent p-4 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900">{certificate.certificateName}</h4>
                    <p className="text-sm text-gray-600">{certificate.courseTitle}</p>
                    <p className="text-xs text-gray-500">Issued by {certificate.issuer}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCertificate(certificate)}
                    className="text-blue-600 hover:text-blue-700 hover:underline text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No certificates earned yet</p>
              <p className="text-sm">Complete courses to earn certificates</p>
            </div>
          )}
        </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>{t.logout}</span>
          </button>
        )}
      </div>

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setLogoutConfirmOpen(false);
                onLogout?.();
              }}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            >
              Confirm Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Modal */}
      <Dialog open={editingContact} onOpenChange={setEditingContact}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>
              Update your email, phone number, and location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <Input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Phone</label>
              <Input
                type="tel"
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                placeholder="+49 123 456 7890"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Location</label>
              <Input
                value={contactData.location}
                onChange={(e) => setContactData({ ...contactData, location: e.target.value })}
                placeholder="Berlin, Germany"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditingContact(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveContact} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Skills Modal */}
      <Dialog open={editingSkills} onOpenChange={setEditingSkills}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Skills</DialogTitle>
            <DialogDescription>
              Add or remove skills from your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <Button onClick={handleAddSkill} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsData.map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditingSkills(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveSkills} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Education Modal */}
      <Dialog open={editingEducation} onOpenChange={setEditingEducation}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Add or edit your educational background
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button onClick={handleAddEducation} className="w-full bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
            {educationData.map((edu, index) => (
              <div key={edu.id} className="border rounded-lg p-4 space-y-3 relative">
                <button
                  onClick={() => handleRemoveEducation(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">School/University</label>
                    <Input
                      value={edu.school}
                      onChange={(e) => handleUpdateEducation(index, 'school', e.target.value)}
                      placeholder="University Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Degree</label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                      placeholder="Bachelor's, Master's, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Field of Study</label>
                    <Input
                      value={edu.field}
                      onChange={(e) => handleUpdateEducation(index, 'field', e.target.value)}
                      placeholder="Computer Science, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Start Year</label>
                      <Input
                        value={edu.startYear}
                        onChange={(e) => handleUpdateEducation(index, 'startYear', e.target.value)}
                        placeholder="2018"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">End Year</label>
                      <Input
                        value={edu.endYear}
                        onChange={(e) => handleUpdateEducation(index, 'endYear', e.target.value)}
                        placeholder="2022"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditingEducation(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveEducation} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Experience Modal */}
      <Dialog open={editingExperience} onOpenChange={setEditingExperience}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>
              Add or edit your professional work history
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button onClick={handleAddExperience} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
            {experienceData.map((exp, index) => (
              <div key={exp.id} className="border rounded-lg p-4 space-y-3 relative">
                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Company</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Position</label>
                    <Input
                      value={exp.position}
                      onChange={(e) => handleUpdateExperience(index, 'position', e.target.value)}
                      placeholder="Job Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Location</label>
                    <Input
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(index, 'location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Start Date</label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(index, 'startDate', e.target.value)}
                        placeholder="Jan 2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">End Date</label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) => handleUpdateExperience(index, 'endDate', e.target.value)}
                        placeholder="Present"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm mb-1">Description</label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      rows={3}
                    />
                    <button
                      onClick={() => {
                        setCurrentExperienceIndex(index);
                        setShowAICVEnhancer(true);
                      }}
                      className="mt-2 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg transition-all"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Enhance with AI</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditingExperience(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveExperience} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedCertificate)} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <DialogContent className="sm:max-w-2xl overflow-hidden rounded-[30px] border border-[#D9E6F2] bg-[#FCFDFE] p-0 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
          <div className="border-b border-[#E3EDF6] bg-[linear-gradient(135deg,#F7FBFF_0%,#EEF6FF_52%,#FDFEFF_100%)] px-7 py-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#5D86B3]">Professional Certificate</p>
                <DialogTitle className="mt-3 text-left text-[28px] leading-tight text-[#163B63]">
                  {selectedCertificate?.certificateName || 'Certificate of Completion'}
                </DialogTitle>
                <DialogDescription className="mt-2 text-left text-base text-[#58708D]">
                  {selectedCertificate?.issuer || 'ProMatchAI Learning Center'}
                </DialogDescription>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#D7E6F5] bg-white text-[#2E63C3] shadow-sm">
                <Award className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="space-y-5 px-7 py-6">
            <div className="rounded-[24px] border border-[#E4ECF5] bg-white px-6 py-6 shadow-sm">
              <p className="text-center text-xs uppercase tracking-[0.26em] text-[#7290AF]">Awarded To</p>
              <p className="mt-3 text-center text-[30px] leading-tight text-[#193A5A]">{userProfile.name}</p>
              <div className="mx-auto mt-5 h-px w-24 bg-[#D9E7F4]" />
              <p className="mt-5 text-center text-sm leading-7 text-[#5D728B]">
                This certifies successful completion of
              </p>
              <p className="mt-2 text-center text-2xl leading-tight text-[#20476F]">
                {selectedCertificate?.courseTitle || 'Course Title'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[20px] border border-[#E4ECF5] bg-[#F9FBFD] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7290AF]">Issued By</p>
                <p className="mt-2 text-sm leading-6 text-[#24496E]">
                  {selectedCertificate?.issuer || 'ProMatchAI Learning Center'}
                </p>
              </div>
              <div className="rounded-[20px] border border-[#E4ECF5] bg-[#F9FBFD] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7290AF]">Completed On</p>
                <p className="mt-2 text-sm leading-6 text-[#24496E]">
                  {selectedCertificate?.completedAt ? formatDate(selectedCertificate.completedAt) : 'Recently completed'}
                </p>
              </div>
            </div>

            <div className="rounded-[20px] border border-dashed border-[#C9DAEC] bg-[#F8FBFF] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7290AF]">Certificate Note</p>
              <p className="mt-2 text-sm leading-7 text-[#55708D]">
                This achievement verifies that the learner has completed the required course materials and earned the
                certificate shown above.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setSelectedCertificate(null)}
                className="rounded-full bg-[#2E63C3] px-5 text-white hover:bg-[#2454AA]"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI CV Enhancer */}
      <AICVEnhancer
        open={showAICVEnhancer}
        onClose={() => {
          setShowAICVEnhancer(false);
          setCurrentExperienceIndex(null);
        }}
        onApply={(education, experience) => {
          // Add the generated education and experience to the profile
          const updatedProfile = {
            ...userProfile,
            education: [...(userProfile.education || []), ...education],
            experience: [...(userProfile.experience || []), ...experience]
          };
          
          onUpdateProfile(updatedProfile);
          updateBackend(updatedProfile);
          updateLocalStorage(updatedProfile);
          
          // Show success message
          alert(`Successfully added ${education.length} education ${education.length === 1 ? 'entry' : 'entries'} and ${experience.length} experience ${experience.length === 1 ? 'entry' : 'entries'} to your profile!`);
        }}
      />

      {/* AI Ethics Info */}
      <AIEthicsInfo />
    </div>
  );
}
