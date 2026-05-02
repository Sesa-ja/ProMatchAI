import { useEffect, useMemo, useState } from 'react';
import { UserProfile, Application } from '../App';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { calculateAIMatchDetails } from '../utils/aiMatching';
import { getTranslation } from '../utils/translations';
import AIInfoTooltip from './AIInfoTooltip';
import { filterDeletedJobs, mergeJobCollections } from '../utils/jobVisibility';
import { addApplicationSubmittedNotification } from '../utils/notifications';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-215f50be`;

let applicationCounter = 0;

interface JobsTabProps {
  userProfile: UserProfile;
  onBack?: () => void;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  logo: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  description: string;
  salary?: string;
  requirements?: string[];
}

type JobFilter = 'all' | 'fulltime' | 'freelance' | 'internship';

export default function JobsTab({ userProfile }: JobsTabProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobFilter, setJobFilter] = useState<JobFilter>('all');
  const [introduction, setIntroduction] = useState('');

  const t = getTranslation(userProfile.language);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const mapJob = (job: any): Job => {
    const userSkills = userProfile.skills || [];
    const jobSkills = job.requiredSkills || [];

    const matchingSkills = userSkills.filter((skill) =>
      jobSkills.some(
        (jobSkill: string) =>
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase()),
      ),
    );

    const missingSkills = jobSkills.filter(
      (jobSkill: string) =>
        !userSkills.some(
          (skill) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(jobSkill.toLowerCase()),
        ),
    );

    const matchScore =
      jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 50;

    return {
      id: String(job.id),
      title: job.title || 'Untitled opportunity',
      company: job.company || 'Company',
      location: job.location || 'Location not specified',
      type: job.type || 'Full-time',
      logo: job.logo || '💼',
      matchScore,
      matchingSkills,
      missingSkills,
      description: job.description || 'No description available.',
      salary: job.salary,
      requirements: job.requiredSkills || [],
    };
  };

  const sortJobsByMatch = (items: Job[]) => [...items].sort((a, b) => b.matchScore - a.matchScore);

  const fetchJobs = async () => {
    try {
      const cachedJobs = localStorage.getItem('promatchai_jobs');
      const localJobs = cachedJobs ? filterDeletedJobs(JSON.parse(cachedJobs)) : [];

      if (cachedJobs) {
        setJobs(sortJobsByMatch(localJobs.map(mapJob)));
        setLoading(false);
      } else {
        setJobs([]);
        setLoading(false);
      }

      const response = await fetch(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) {
        throw new Error('Backend unavailable');
      }

      const result = await response.json();
      if (result.success && result.data) {
        const visibleJobs = filterDeletedJobs(mergeJobCollections(localJobs, result.data));
        localStorage.setItem('promatchai_jobs', JSON.stringify(visibleJobs));
        setJobs(sortJobsByMatch(visibleJobs.map(mapJob)));
      }
    } catch (error) {
      console.log('Backend unavailable, keeping cached jobs only');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!userProfile.id) return;

    try {
      const storedApplications = localStorage.getItem('promatchai_applications');
      if (storedApplications) {
        const applications = JSON.parse(storedApplications);
        const userApplications = applications
          .filter((app: any) => app.userId === userProfile.id)
          .map((app: any) => String(app.jobId));
        setAppliedJobs(new Set(userApplications));
      }

      try {
        const response = await fetch(`${API_URL}/applications`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            localStorage.setItem('promatchai_applications', JSON.stringify(result.data));
            const userApplications = result.data
              .filter((app: any) => app.userId === userProfile.id)
              .map((app: any) => String(app.jobId));
            setAppliedJobs(new Set(userApplications));
          }
        }
      } catch (fetchError) {
        console.log('Backend unavailable, using localStorage data');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const openApplicationModal = (job: Job) => {
    if (!userProfile.id) {
      alert('Please complete your profile first.');
      return;
    }

    if (appliedJobs.has(job.id)) {
      alert('You have already applied to this job!');
      return;
    }

    setSelectedJob(job);
    setShowApplicationModal(true);
    setIntroduction('');
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob || !userProfile.id) return;

    if (!introduction.trim()) {
      alert('Please provide an introduction.');
      return;
    }

    setApplyingJobId(selectedJob.id);

    try {
      const newApplication: Application = {
        id: `app-${Date.now()}-${applicationCounter++}`,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        location: selectedJob.location,
        status: 'submitted',
        appliedDate: new Date().toISOString(),
        introduction,
      };

      try {
        const storedUsers = localStorage.getItem('promatchai_users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const userIndex = users.findIndex((user: any) => user.id === userProfile.id);
          if (userIndex !== -1) {
            const currentApplications = users[userIndex].applications || [];
            users[userIndex].applications = [...currentApplications, newApplication];
            localStorage.setItem('promatchai_users', JSON.stringify(users));
          }
        }

        const storedApplications = localStorage.getItem('promatchai_applications');
        const applications = storedApplications ? JSON.parse(storedApplications) : [];
        applications.push({
          ...newApplication,
          userId: userProfile.id,
          userName: userProfile.name,
          userEmail: userProfile.email || '',
          createdAt: newApplication.appliedDate,
        });
        localStorage.setItem('promatchai_applications', JSON.stringify(applications));
      } catch (error) {
        console.error('Error saving application to localStorage:', error);
      }

      setAppliedJobs(new Set([...appliedJobs, selectedJob.id]));
      setShowApplicationModal(false);
      setSelectedJob(null);
      addApplicationSubmittedNotification(userProfile.id, newApplication.jobTitle, newApplication.company);
      alert(
        `Successfully applied to ${selectedJob.title} at ${selectedJob.company}! The employer will review your application.`,
      );

      fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          id: newApplication.id,
          userId: userProfile.id,
          jobId: selectedJob.id,
          status: 'submitted',
          appliedAt: newApplication.appliedDate,
          createdAt: newApplication.appliedDate,
          userName: userProfile.name,
          userEmail: userProfile.email || '',
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          introduction,
        }),
      }).catch(() => {
        console.log('Backend unavailable, application saved locally');
      });
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplyingJobId(null);
    }
  };

  const toggleJobExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !normalizedQuery ||
        [job.title, job.company, job.location, job.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      const normalizedType = job.type.toLowerCase();
      const matchesType =
        jobFilter === 'all'
          ? true
          : jobFilter === 'fulltime'
          ? normalizedType.includes('full')
          : jobFilter === 'freelance'
          ? normalizedType.includes('free')
          : normalizedType.includes('intern') || normalizedType.includes('apprent');

      return matchesSearch && matchesType;
    });
  }, [jobs, searchQuery, jobFilter]);

  const getMatchBadgeClasses = (score: number) => {
    if (score >= 70) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (score >= 50) return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-rose-200 bg-rose-50 text-rose-700';
  };

  const getJobTypeClasses = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('intern') || normalizedType.includes('apprent')) {
      return 'bg-[#EEF2FF] text-[#5665C7]';
    }
    if (normalizedType.includes('free')) {
      return 'bg-[#EEFDF6] text-[#17865F]';
    }
    return 'bg-[#EEF6FF] text-[#3567B7]';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E8F4F8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F4F8] pb-4">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="mb-2 text-[30px] leading-none tracking-tight font-medium text-[#173B57]">{t.jobsTitle}</h1>
            <p className="text-gray-600">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'result' : 'results'} based on your profile and filters
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8AA0B5]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search jobs, companies, or locations"
              className="w-full rounded-2xl border border-[#D5E6F3] bg-white px-11 py-3 text-[#24455F] outline-none transition focus:border-[#BDD9F0] focus:ring-2 focus:ring-[#E6F3FB]"
            />
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {[
              { key: 'all', label: 'All' },
              { key: 'fulltime', label: 'Fulltime' },
              { key: 'freelance', label: 'Freelance' },
              { key: 'internship', label: 'Internship' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setJobFilter(option.key as JobFilter)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  jobFilter === option.key
                    ? option.key === 'all'
                      ? 'border-[#4254C5] bg-[#4254C5] text-white'
                      : option.key === 'fulltime'
                      ? 'border-[#3567B7] bg-[#3567B7] text-white'
                      : option.key === 'freelance'
                      ? 'border-[#17865F] bg-[#17865F] text-white'
                      : 'border-[#7A57D0] bg-[#7A57D0] text-white'
                    : 'border-[#D7E5F3] bg-white text-[#5A748B]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {(['all', 'fulltime', 'freelance', 'internship'] as JobFilter[]).map((key) => (
              <span
                key={key}
                className={`h-1.5 rounded-full transition-all ${
                  jobFilter === key ? 'w-5 bg-[#4254C5]' : 'w-1.5 bg-[#C8D7E5]'
                }`}
              />
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-6xl">📭</div>
            <h3 className="text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try a different search or filter to see more opportunities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobs.has(job.id);
              const isApplying = applyingJobId === job.id;
              const aiMatchDetails = calculateAIMatchDetails(
                job.matchingSkills,
                job.requirements || [],
                userProfile.language,
              );

              return (
                <div
                  key={job.id}
                  className="overflow-hidden rounded-[22px] border border-[#D9E6F2] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#EEF3FA] text-2xl">
                        {job.logo}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[17px] leading-5 text-[#1D3045]">{job.title}</h3>
                            <p className="mt-1 truncate text-xs text-[#7A8FA4]">{job.company}</p>
                          </div>
                          <div
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getMatchBadgeClasses(
                              job.matchScore,
                            )}`}
                          >
                            {job.matchScore}%
                          </div>
                        </div>

                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#687F95]">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{job.location}</span>
                          </div>
                          <span>•</span>
                          <span>{job.type}</span>
                          {job.salary && (
                            <>
                              <span>•</span>
                              <span>{job.salary}</span>
                            </>
                          )}
                        </div>

                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${getJobTypeClasses(job.type)}`}>
                            {job.type}
                          </span>
                          {job.salary && <span className="text-sm font-semibold text-[#3C5D96]">{job.salary}</span>}
                        </div>

                        <div className="mb-3 rounded-2xl border border-[#E8D7FF] bg-[#FBF7FF] p-3">
                          <div className="flex items-start gap-2">
                            <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#8A40FF]" />
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-xs font-medium text-[#6D31C7]">{t.aiRecommended}</span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                                    aiMatchDetails.confidence === 'high'
                                      ? 'bg-green-100 text-green-700'
                                      : aiMatchDetails.confidence === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  {aiMatchDetails.confidenceLabel}
                                </span>
                                <AIInfoTooltip content={t.aiMatchExplanation} />
                              </div>
                              <div className="mb-1 text-[11px] text-[#7A46C9]">
                                {aiMatchDetails.skillsMatched} {t.skillOverlap} {aiMatchDetails.skillsRequired}{' '}
                                {t.requiredSkills.toLowerCase()}
                              </div>
                              {aiMatchDetails.reasons.length > 0 && (
                                <div className="line-clamp-2 text-[11px] text-[#8A5AD3]">
                                  {t.aiSuggestion} {aiMatchDetails.reasons[0].toLowerCase()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 space-y-1.5">
                          {job.matchingSkills.length > 0 && (
                            <div className="flex items-start gap-2">
                              <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                              <span className="line-clamp-1 text-xs text-green-700">
                                Your skills: {job.matchingSkills.join(', ')}
                              </span>
                            </div>
                          )}
                          {job.missingSkills.length > 0 && (
                            <div className="flex items-start gap-2">
                              <BookOpen className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-600" />
                              <span className="line-clamp-1 text-xs text-orange-700">
                                Learn: {job.missingSkills.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => toggleJobExpand(job.id)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#BFD6F4] bg-white px-4 py-2.5 text-sm font-medium text-[#2E63C3] transition-colors hover:bg-[#EEF6FF]"
                          >
                            <span>{expandedJob === job.id ? 'Hide Details' : 'View Details'}</span>
                            {expandedJob === job.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          {hasApplied && (
                            <div className="flex items-center rounded-xl bg-[#EAF8F2] px-4 py-2.5 text-sm font-medium text-[#17865F]">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              <span>Applied</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedJob === job.id && (
                    <div className="border-t border-[#E2EAF2] bg-[#F8FBFE] p-5">
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-[#EAF2FF] px-3 py-2 text-center text-sm font-medium text-[#2E63C3]">
                          Job Desc.
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 text-center text-sm font-medium text-[#7A8FA4]">
                          Gallery
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 text-center text-sm font-medium text-[#7A8FA4]">
                          Skills
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-gray-900">Job Description</h4>
                        <p className="rounded-2xl border border-[#E6EEF5] bg-white px-4 py-3 text-sm leading-7 text-gray-600 shadow-sm">
                          {job.description}
                        </p>
                      </div>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mt-5">
                          <h4 className="mb-2 text-gray-900">Requirements</h4>
                          <div className="rounded-2xl border border-[#E6EEF5] bg-white px-4 py-3 shadow-sm">
                            <ul className="list-inside list-disc space-y-1">
                              {job.requirements.map((requirement, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  {requirement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {job.missingSkills.length > 0 && (
                        <div className="mt-5">
                          <h4 className="mb-2 text-gray-900">Build Missing Skills</h4>
                          <div className="space-y-2">
                            {job.missingSkills.map((skill) => (
                              <div
                                key={skill}
                                className="flex items-center justify-between rounded-2xl border border-[#E6EEF5] bg-white p-3 shadow-sm"
                              >
                                <div>
                                  <div className="text-gray-900">{skill}</div>
                                  <div className="text-sm text-gray-600">Find courses in the Learn tab</div>
                                </div>
                                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0FAF8E] to-[#19C37D] px-4 py-2 text-sm text-white transition-colors hover:from-[#0C9A7D] hover:to-[#15AE70]">
                                  <BookOpen className="h-4 w-4" />
                                  <span>Learn</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasApplied && (
                        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                            <div>
                              <h4 className="mb-1 text-green-900">Application Submitted</h4>
                              <p className="text-sm text-green-700">
                                Your application has been sent to {job.company}. They will review it and contact you if
                                you&apos;re a good fit.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!hasApplied && (
                        <button
                          onClick={() => openApplicationModal(job)}
                          className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5F6D] px-5 py-3 text-sm font-medium text-white transition-colors hover:from-[#F17B2D] hover:to-[#F04F60]"
                        >
                          APPLY FOR THIS JOB
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(232,244,248,0.82)] backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#D7E6F2] bg-[#FCFEFF] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between rounded-t-[28px] border-b border-[#E3ECF4] bg-[#FCFEFF] px-6 py-4">
              <div>
                <h2 className="text-gray-900">Apply for {selectedJob.title}</h2>
                <p className="text-sm text-gray-600">{selectedJob.company}</p>
              </div>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm text-gray-700">
                  Introduction <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={introduction}
                  onChange={(event) => setIntroduction(event.target.value)}
                  placeholder="Tell the employer about yourself and why you're interested in this position..."
                  rows={4}
                  className="w-full rounded-2xl border border-[#C9D9E7] bg-white px-4 py-3 text-[#24455F] focus:outline-none focus:ring-2 focus:ring-[#DDECF8]"
                />
                <p className="mt-1 text-xs text-gray-500">Brief introduction about yourself and your motivation</p>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-[#E3ECF4] bg-[#F7FBFE] px-6 py-4 rounded-b-[28px]">
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedJob(null);
                }}
                className="flex-1 rounded-2xl border border-[#CBD9E6] bg-white px-4 py-3 text-[#4D667D] transition-colors hover:bg-[#F7FBFE]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={applyingJobId !== null}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5F6D] px-4 py-3 text-white transition-colors hover:from-[#F17B2D] hover:to-[#F04F60] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {applyingJobId ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
