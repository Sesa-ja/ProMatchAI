import { useState, useEffect } from 'react';
import { UserProfile } from '../App';
import { Sparkles, TrendingUp, Award, BookOpen, MapPin, Briefcase, ChevronRight, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import TranslationIndicator from './TranslationIndicator';
import { getTranslation } from '../utils/translations';
import { calculateAIMatchDetails } from '../utils/aiMatching';
import AIInfoTooltip from './AIInfoTooltip';
import MyApplicationsView from './MyApplicationsView';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { recommendOpportunitiesForCandidate } from '../utils/recommendations';
import { filterDeletedJobs } from '../utils/jobVisibility';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-215f50be`;

interface DashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

type RecommendedJob = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  logo?: string;
  requiredSkills?: string[];
  matchScore?: number;
  explanations?: string[];
};

type DashboardCourse = {
  id: string | number;
  title: string;
  progress?: number;
  thumbnail?: string;
  duration?: string;
};

const mockCourses = [
  {
    id: 1,
    title: 'Web Development Basics',
    progress: 40,
    thumbnail: '💻',
    duration: '2 hours',
  },
  {
    id: 2,
    title: 'Customer Service Excellence',
    progress: 75,
    thumbnail: '🤝',
    duration: '1.5 hours',
  },
  {
    id: 3,
    title: 'German Language A1',
    progress: 20,
    thumbnail: '🗣️',
    duration: '5 hours',
  },
];

const mockJobs = [
  {
    id: 1,
    title: 'Junior Web Developer',
    company: 'Tech Solutions GmbH',
    location: 'Berlin, Germany',
    matchScore: 95,
    logo: '🏢',
  },
  {
    id: 2,
    title: 'Restaurant Cook',
    company: 'Culinary Masters',
    location: 'Munich, Germany',
    matchScore: 88,
    logo: '🍳',
  },
  {
    id: 3,
    title: 'Customer Support Representative',
    company: 'Global Services Inc',
    location: 'Remote',
    matchScore: 82,
    logo: '💼',
  },
];

const categories = [
  { name: 'Construction', icon: '🏗️', color: 'bg-orange-100 text-orange-700' },
  { name: 'IT & Tech', icon: '💻', color: 'bg-blue-100 text-blue-700' },
  { name: 'Healthcare', icon: '⚕️', color: 'bg-green-100 text-green-700' },
  { name: 'Hospitality', icon: '🍽️', color: 'bg-purple-100 text-purple-700' },
  { name: 'Retail', icon: '🛍️', color: 'bg-pink-100 text-pink-700' },
  { name: 'Logistics', icon: '🚚', color: 'bg-yellow-100 text-yellow-700' },
];

export default function Dashboard({ userProfile, onUpdateProfile }: DashboardProps) {
  const [showAICareerChat, setShowAICareerChat] = useState(false);
  const [showSkillMatchingFlow, setShowSkillMatchingFlow] = useState(false);
  const [showMyApplications, setShowMyApplications] = useState(false);
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [courses, setCourses] = useState<DashboardCourse[]>([]);

  const t = getTranslation(userProfile.language);

  const applications = userProfile.applications || [];
  const recentApplications = applications.slice(0, 3);
  const topRecommendedJob = jobs[0];
  const additionalRecommendedJobs = jobs.slice(1);

  const getMatchTone = (score = 0) => {
    if (score >= 85) {
      return {
        label: 'Elite Match',
        accent: 'from-cyan-500 via-blue-500 to-indigo-600',
        badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        ring: 'ring-cyan-200',
        panel: 'from-cyan-50 via-white to-blue-50',
        glow: 'shadow-cyan-100/80',
      };
    }

    if (score >= 70) {
      return {
        label: 'Strong Match',
        accent: 'from-emerald-500 via-teal-500 to-cyan-500',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ring: 'ring-emerald-200',
        panel: 'from-emerald-50 via-white to-teal-50',
        glow: 'shadow-emerald-100/80',
      };
    }

    if (score >= 50) {
      return {
        label: 'Potential Match',
        accent: 'from-amber-400 via-orange-400 to-rose-400',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        ring: 'ring-amber-200',
        panel: 'from-amber-50 via-white to-orange-50',
        glow: 'shadow-amber-100/80',
      };
    }

    return {
      label: 'Emerging Match',
      accent: 'from-slate-400 via-slate-500 to-slate-600',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      ring: 'ring-slate-200',
      panel: 'from-slate-50 via-white to-gray-50',
      glow: 'shadow-slate-100/80',
    };
  };

  const buildRecommendationSignals = (job: RecommendedJob) => {
    const userSkills = userProfile.skills || [];
    const jobSkills = job.requiredSkills || [];
    const matchingSkills = userSkills.filter(skill =>
      jobSkills.some((jSkill: string) =>
        jSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jSkill.toLowerCase())
      )
    );

    return {
      matchingSkills,
      aiMatchDetails: calculateAIMatchDetails(
        matchingSkills,
        jobSkills,
        userProfile.language
      ),
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    fetchRecommendedJobs();
    fetchCourses();
  }, [userProfile.id, userProfile.language, userProfile.location, userProfile.skills.length, userProfile.badges.length]);

  const mapRecommendedJobs = (recommendations: any[]) =>
    recommendations.map((entry: any) => {
      const job = entry.opportunity || entry.item || entry;
      const reciprocalScore = entry.score || entry.breakdown?.reciprocalScore || 0;

      return {
        ...job,
        title: job.title,
        company: job.company || 'Company',
        location: job.location || 'Location not specified',
        logo: job.logo || '💼',
        requiredSkills: job.requiredSkills || [],
        matchScore: Math.round(reciprocalScore * 100),
        explanations: entry.breakdown?.explanations || [],
      };
    });

  const fetchRecommendedJobs = async () => {
    try {
      let hasRealJobSource = false;

      if (userProfile.id) {
        const response = await fetch(`${API_URL}/recommendations/opportunities/${userProfile.id}?topK=3`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            hasRealJobSource = true;
            if (result.data.length > 0) {
              setJobs(mapRecommendedJobs(result.data));
              return;
            }
          }
        }
      }

      const cachedJobs = localStorage.getItem('promatchai_jobs');
      if (cachedJobs) {
        hasRealJobSource = true;
        const visibleJobs = filterDeletedJobs(JSON.parse(cachedJobs));
        const recommendations = recommendOpportunitiesForCandidate(userProfile, visibleJobs, undefined, 3);
        if (recommendations.length > 0) {
          setJobs(mapRecommendedJobs(recommendations));
          return;
        }
      }

      if (hasRealJobSource) {
        setJobs([]);
        return;
      }
    } catch (error) {
      console.log('Recommendation service unavailable, showing cached recommendations only');
    }

    setJobs([]);
  };

  const fetchCourses = async () => {
    try {
      // Try localStorage first
      const cachedCourses = localStorage.getItem('promatchai_courses');
      if (cachedCourses) {
        const storedCourses = JSON.parse(cachedCourses);
        setCourses(storedCourses.slice(0, 3));
      }

      // Try to fetch from backend in the background
      const response = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      
      if (!response.ok) throw new Error('Backend unavailable');
      
      const result = await response.json();
      if (result.success && result.data) {
        // Cache the courses
        localStorage.setItem('promatchai_courses', JSON.stringify(result.data));
        setCourses(result.data.slice(0, 3));
      }
    } catch (error) {
      console.log('Backend unavailable, keeping cached courses only');
    }
  };

  return (
    <>
      {showMyApplications ? (
        <MyApplicationsView 
          userProfile={userProfile} 
          onBack={() => setShowMyApplications(false)} 
        />
      ) : (
        <div className="min-h-screen bg-[#E8F4F8]">
          <div className="max-w-4xl mx-auto px-5 py-3">
              <div>
                <h2 className="text-[30px] leading-none tracking-tight font-medium text-[#173B57]">
                  {t.dashboardWelcome}, {userProfile.name}!
                </h2>
              </div>
              {/* Translation Indicator */}
              {userProfile.language !== 'en' && (
                <div className="mt-2">
                  <TranslationIndicator language={userProfile.language} variant="inline" />
                </div>
              )}
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-gray-900">{userProfile.completedCourses}</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-gray-900">{userProfile.badges.length}</div>
                <div className="text-sm text-gray-600">Badges</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-gray-900">{userProfile.skills.length}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
            </div>

            {/* My Applications */}
            {applications.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">{t.myApplications}</h3>
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <Briefcase className="w-3 h-3" />
                    <span>{applications.length} {applications.length === 1 ? 'Application' : 'Applications'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
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
                    </div>
                  ))}
                </div>
                {applications.length > 3 && (
                  <div className="mt-3 text-center">
                    <button 
                      onClick={() => setShowMyApplications(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View all {applications.length} applications →
                    </button>
                  </div>
                )}
              </section>
            )}

            {applications.length === 0 && (
              <section>
                <h3 className="text-gray-900 mb-4">{t.myApplications}</h3>
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="text-5xl mb-3">📋</div>
                  <h4 className="text-gray-900 mb-2">{t.noApplications}</h4>
                  <p className="text-gray-600 text-sm mb-4">{t.startApplying}</p>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                    {t.viewAllJobs}
                  </button>
                </div>
              </section>
            )}

            {/* Pick up where you left off */}
            <section>
              <h3 className="text-gray-900 mb-4">{t.continueeLearning}</h3>
              <div className="space-y-3">
                {courses
                  .filter((c) => c.progress > 0 && c.progress < 100)
                  .slice(0, 2)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{course.thumbnail}</div>
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">{course.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{course.duration} remaining</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-blue-600 mt-1">{course.progress}% complete</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Top AI Matches */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-gray-900">{t.aiMatchedJobs}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span>{t.aiAssisted}</span>
                  </div>
                  <AIInfoTooltip content={t.aiMatchExplanation} />
                </div>
              </div>
              {topRecommendedJob ? (
                <div className="space-y-4">
                  {(() => {
                    const topSignals = buildRecommendationSignals(topRecommendedJob);
                    const topTone = getMatchTone(topRecommendedJob.matchScore || 0);

                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                              {topRecommendedJob.logo || '💼'}
                            </div>
                            <div>
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                                  AI Top Match
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${topTone.badge}`}>
                                  {topTone.label}
                                </span>
                              </div>
                              <h4 className="text-xl text-slate-900">{topRecommendedJob.title}</h4>
                              <p className="mt-1 text-sm text-slate-600">
                                {topRecommendedJob.company} · {topRecommendedJob.location}
                              </p>
                            </div>
                          </div>

                          <div className="min-w-[180px] rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Match Score</div>
                            <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-3xl font-semibold text-slate-900">
                                {topRecommendedJob.matchScore || 0}%
                              </span>
                              <span className="text-sm text-slate-500">fit</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${topTone.accent}`}
                                style={{ width: `${Math.max(8, topRecommendedJob.matchScore || 0)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Skills</div>
                            <div className="mt-2 text-lg text-slate-900">
                              {topSignals.aiMatchDetails.skillsMatched}/{topSignals.aiMatchDetails.skillsRequired || 0}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">matched required skills</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Confidence</div>
                            <div className="mt-2 text-lg text-slate-900">
                              {topSignals.aiMatchDetails.confidenceLabel}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">profile-to-job alignment</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Location</div>
                            <div className="mt-2 flex items-center gap-2 text-lg text-slate-900">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>{topRecommendedJob.location}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">checked against your profile</p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Sparkles className="h-4 w-4 text-sky-500" />
                            <span>Why this recommendation stands out</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(topRecommendedJob.explanations && topRecommendedJob.explanations.length > 0
                              ? topRecommendedJob.explanations
                              : topSignals.aiMatchDetails.reasons.length > 0
                              ? topSignals.aiMatchDetails.reasons
                              : [t.aiMatchingInfo]
                            ).slice(0, 3).map((reason, index) => (
                              <span
                                key={`${topRecommendedJob.id}-reason-${index}`}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                          {topSignals.matchingSkills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {topSignals.matchingSkills.slice(0, 4).map((skill) => (
                                <span
                                  key={`${topRecommendedJob.id}-${skill}`}
                                  className="rounded-full border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {additionalRecommendedJobs.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {additionalRecommendedJobs.map((job) => {
                        const signals = buildRecommendationSignals(job);
                        const tone = getMatchTone(job.matchScore || 0);

                        return (
                          <div
                            key={job.id}
                            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl"
                          >
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.accent}`} />
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone.accent} text-2xl text-white shadow-md`}>
                                {job.logo || '💼'}
                              </div>
                              <div className={`rounded-full border px-3 py-1 text-xs font-medium ${tone.badge}`}>
                                {job.matchScore || 0}% match
                              </div>
                            </div>
                            <h4 className="text-lg text-slate-900">{job.title}</h4>
                            <p className="mt-1 text-sm text-slate-600">{job.company}</p>
                            <p className="mt-1 text-sm text-slate-500">{job.location}</p>

                            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-500">
                                <span>AI signal</span>
                                <span>{signals.aiMatchDetails.confidenceLabel}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${tone.accent}`}
                                  style={{ width: `${Math.max(8, job.matchScore || 0)}%` }}
                                />
                              </div>
                              <p className="mt-2 text-sm text-slate-600">
                                {signals.aiMatchDetails.skillsMatched} matched skills out of {signals.aiMatchDetails.skillsRequired || 0} requested
                              </p>
                            </div>

                            <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500" />
                              <span>
                                {job.explanations && job.explanations.length > 0
                                  ? job.explanations[0]
                                  : signals.aiMatchDetails.reasons.length > 0
                                  ? signals.aiMatchDetails.reasons[0]
                                  : t.aiMatchingInfo}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 text-white shadow-lg shadow-sky-100">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl text-slate-900">Your AI match feed is warming up</h4>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                    Add more skills, languages, training, and preferences to your profile, then the recommendation engine
                    can surface stronger job and apprenticeship matches here.
                  </p>
                </div>
              )}
            </section>

            {/* Explore Categories */}
            <section>
              <h3 className="text-gray-900 mb-4">{t.exploreCategories}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className={`${category.color} rounded-xl p-6 text-center hover:shadow-md transition-shadow`}
                  >
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <div>{category.name}</div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
