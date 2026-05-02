import { useState, useEffect, useRef } from 'react';
import { 
  Users, Briefcase, BookOpen, TrendingUp, Search, Plus, Edit, Trash2, 
  BarChart3, Download, X, Check, Clock, FileText, Upload, Video, File, Eye, UserCog, Camera, Building2, ArrowLeft, LogOut, Mail, Sparkles, BookmarkPlus, BookmarkCheck, Bookmark
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast, ToastContainer, useToast } from './ui/toast';
import AdminApplicantManagement from './AdminApplicantManagement';
import EmailAutomationSettings from './EmailAutomationSettings';
import ShortlistManagement from './ShortlistManagement';
import RecommendedCandidatesPanel from './RecommendedCandidatesPanel';
import InterviewInvitationDialog from './InterviewInvitationDialog';
import ConfirmationDialog from './ConfirmationDialog';
import ApplicationManagementPanel from './ApplicationManagementPanel';
import JobManagementPanel from './JobManagementPanel';
import CourseManagementPanel from './CourseManagementPanel';
import { ApplicationStatus } from '../App';
import { recommendCandidatesForOpportunity } from '../utils/recommendations';
import { filterDeletedJobs, markJobDeleted, mergeJobCollections, unmarkJobDeleted } from '../utils/jobVisibility';
import {
  addApplicationStatusNotification,
  addInterviewInvitationNotification,
  addShortlistNotification,
} from '../utils/notifications';
import type {
  AdminAnalytics,
  AdminApplication,
  AdminCourse,
  AdminJob,
  AdminModalType,
  AdminTab,
  AdminUser,
  CandidateRecommendation,
  EditableAdminItem,
  ItemFormData,
  ShortlistRecord,
} from '../types/admin';

// Helper function to remove duplicates from arrays based on id
const deduplicateById = <T extends { id: string | number }>(items: T[]): T[] => {
  if (!items || items.length === 0) return [];
  
  const seen = new Set<string | number>();
  const unique: T[] = [];
  
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  }
  
  return unique;
};

const normalizeDeleteSignature = (value?: string) => (value || '').trim().toLowerCase();

const sameJobSignature = (
  left?: Pick<AdminJob, 'title' | 'company' | 'location'>,
  right?: Pick<AdminJob, 'title' | 'company' | 'location'>,
) =>
  normalizeDeleteSignature(left?.title) === normalizeDeleteSignature(right?.title) &&
  normalizeDeleteSignature(left?.company) === normalizeDeleteSignature(right?.company) &&
  normalizeDeleteSignature(left?.location) === normalizeDeleteSignature(right?.location);

const sameCourseSignature = (
  left?: Pick<AdminCourse, 'title' | 'duration' | 'description'>,
  right?: Pick<AdminCourse, 'title' | 'duration' | 'description'>,
) =>
  normalizeDeleteSignature(left?.title) === normalizeDeleteSignature(right?.title) &&
  normalizeDeleteSignature(left?.duration) === normalizeDeleteSignature(right?.duration) &&
  normalizeDeleteSignature(left?.description) === normalizeDeleteSignature(right?.description);

const sameApplicationSignature = (
  left?: Pick<AdminApplication, 'userId' | 'jobId' | 'jobTitle' | 'company' | 'userEmail'>,
  right?: Pick<AdminApplication, 'userId' | 'jobId' | 'jobTitle' | 'company' | 'userEmail'>,
) =>
  normalizeDeleteSignature(left?.userId) === normalizeDeleteSignature(right?.userId) &&
  normalizeDeleteSignature(left?.jobId) === normalizeDeleteSignature(right?.jobId) &&
  normalizeDeleteSignature(left?.jobTitle) === normalizeDeleteSignature(right?.jobTitle) &&
  normalizeDeleteSignature(left?.company) === normalizeDeleteSignature(right?.company) &&
  normalizeDeleteSignature(left?.userEmail) === normalizeDeleteSignature(right?.userEmail);

const mergeByMatcher = <T extends { id: string }>(
  localItems: T[],
  backendItems: T[],
  isSameItem: (left: T, right: T) => boolean,
) => {
  const merged = [...backendItems];

  for (const localItem of localItems) {
    const existingIndex = merged.findIndex((item) => item.id === localItem.id || isSameItem(item, localItem));
    if (existingIndex === -1) {
      merged.push(localItem);
    } else {
      merged[existingIndex] = { ...localItem, ...merged[existingIndex] };
    }
  }

  return deduplicateById(merged);
};

const resourcePathByType: Record<'job' | 'course' | 'application', string> = {
  job: 'jobs',
  course: 'courses',
  application: 'applications',
};

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<AdminModalType | null>(null);
  const [editingItem, setEditingItem] = useState<EditableAdminItem | null>(null);
  const [viewingUserCV, setViewingUserCV] = useState<AdminUser | null>(null);
  const [selectedRecommendationJobId, setSelectedRecommendationJobId] = useState<string>('');
  const [recommendedCandidates, setRecommendedCandidates] = useState<CandidateRecommendation[]>([]);
  const [shortlistedCandidateIds, setShortlistedCandidateIds] = useState<string[]>([]);
  const [shortlistRecords, setShortlistRecords] = useState<ShortlistRecord[]>([]);
  const [shortlistSearchTerm, setShortlistSearchTerm] = useState('');
  const [shortlistOpportunityFilter, setShortlistOpportunityFilter] = useState('all');
  const [shortlistSortOrder, setShortlistSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteDialogRecord, setInviteDialogRecord] = useState<ShortlistRecord | null>(null);
  const [inviteDialogCandidate, setInviteDialogCandidate] = useState<AdminUser | null>(null);
  const [inviteDialogOpportunity, setInviteDialogOpportunity] = useState<AdminJob | null>(null);
  const [inviteDialogNote, setInviteDialogNote] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogDescription, setConfirmDialogDescription] = useState('');
  const [confirmDialogAction, setConfirmDialogAction] = useState<(() => Promise<void> | void) | null>(null);
  const { toasts, removeToast } = useToast();
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Handlers for applicant management
  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    const updatedApplications = applications.map(app =>
      app.id === applicationId ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApplications);
    localStorage.setItem('promatchai_applications', JSON.stringify(updatedApplications));
  };

  const handleBulkStatusChange = (applicationIds: string[], newStatus: ApplicationStatus) => {
    const updatedApplications = applications.map(app =>
      applicationIds.includes(app.id) ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApplications);
    localStorage.setItem('promatchai_applications', JSON.stringify(updatedApplications));
  };

  const handleSendNotification = (applicationIds: string[]) => {
    toast.info(`Sending notifications to ${applicationIds.length} applicant(s).`, 'Notifications');
  };

  // Handle horizontal scroll with mouse wheel
  useEffect(() => {
    const wrapper = tabsListRef.current;
    if (!wrapper) return;

    // Find the TabsList element inside the wrapper
    const tabsList = wrapper.querySelector('[data-slot="tabs-list"]') as HTMLElement;
    if (!tabsList) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default vertical scroll
      e.preventDefault();
      e.stopPropagation();
      
      // Scroll horizontally instead
      tabsList.scrollLeft += e.deltaY;
    };

    // Add event listener with passive: false to allow preventDefault
    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const activeJobId = selectedRecommendationJobId || jobs[0]?.id;
    if (activeJobId) {
      fetchRecommendedCandidates(activeJobId);
      loadShortlist(activeJobId);
    }
  }, [jobs, users, selectedRecommendationJobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to load from localStorage first (offline-first approach)
      const storedUsers = localStorage.getItem('promatchai_users');
      const storedJobs = localStorage.getItem('promatchai_jobs');
      const storedCourses = localStorage.getItem('promatchai_courses');
      const storedApplications = localStorage.getItem('promatchai_applications');
      
      // Set data from localStorage
      const usersData: AdminUser[] = storedUsers ? JSON.parse(storedUsers) : [];
      const jobsData: AdminJob[] = storedJobs ? filterDeletedJobs(deduplicateById(JSON.parse(storedJobs))) : [];
      const coursesData: AdminCourse[] = storedCourses ? deduplicateById(JSON.parse(storedCourses)) : [];
      const rawApplications: AdminApplication[] = storedApplications ? JSON.parse(storedApplications) : [];
      
      // Enrich applications with user and job data
      const enrichedApplications: AdminApplication[] = rawApplications.map((app) => {
        const user = usersData.find((u) => u.id === app.userId);
        const job = jobsData.find((j) => j.id === app.jobId);
        
        return {
          ...app,
          userName: user?.name || app.userName || 'Unknown User',
          userEmail: user?.email || app.userEmail || '',
          userSkills: user?.skills || [],
          requiredSkills: job?.requiredSkills || job?.skills || [],
        };
      });
      
      setUsers(usersData);
      setJobs(jobsData);
      setCourses(coursesData);
      setApplications(enrichedApplications);
      
      // Calculate analytics from localStorage data
      setAnalytics({
        totalRefugees: usersData.filter((u) => u.userType === 'refugee').length,
        totalEmployers: usersData.filter((u) => u.userType === 'employer').length,
        totalJobs: jobsData.length,
        activeJobs: jobsData.filter((j) => j.status === 'active').length,
        totalCourses: coursesData.length,
        totalApplications: rawApplications.length,
        successfulMatches: rawApplications.filter((a) => a.status === 'accepted').length,
      });
      
      setLoading(false);
      
      // Try to fetch from backend in the background (optional)
      try {
        const [analyticsRes, usersRes, jobsRes, coursesRes, applicationsRes] = await Promise.all([
          fetch(`${API_URL}/analytics`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
          fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
          fetch(`${API_URL}/jobs`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
          fetch(`${API_URL}/courses`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
          fetch(`${API_URL}/applications`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
        ]);

        const analyticsData = await analyticsRes.json();
        const backendUsersData = await usersRes.json();
        const backendJobsData = await jobsRes.json();
        const backendCoursesData = await coursesRes.json();
        const backendApplicationsData = await applicationsRes.json();

        const backendUsers: AdminUser[] = backendUsersData.data || [];
        const backendJobsRaw: AdminJob[] = filterDeletedJobs(deduplicateById(mergeJobCollections(jobsData, backendJobsData.data || [])));
        const backendCoursesRaw: AdminCourse[] = deduplicateById((backendCoursesData.data || []) as AdminCourse[]);
        const backendRawApplications: AdminApplication[] = backendApplicationsData.data || [];
        const mergedJobs = mergeByMatcher(jobsData, backendJobsRaw, sameJobSignature);
        const mergedCourses = mergeByMatcher(coursesData, backendCoursesRaw, sameCourseSignature);
        const mergedApplicationsRaw = mergeByMatcher(rawApplications, backendRawApplications, sameApplicationSignature);
        
        // Enrich backend applications too
        const backendEnrichedApplications: AdminApplication[] = mergedApplicationsRaw.map((app) => {
          const user = backendUsers.find((u) => u.id === app.userId);
          const job = mergedJobs.find((j) => j.id === app.jobId);
          
          return {
            ...app,
            userName: user?.name || app.userName || 'Unknown User',
            userEmail: user?.email || app.userEmail || '',
            userSkills: user?.skills || [],
            requiredSkills: job?.requiredSkills || job?.skills || [],
          };
        });

        setAnalytics(analyticsData.data as AdminAnalytics);
        setUsers(backendUsers);
        setJobs(mergedJobs);
        setCourses(mergedCourses);
        setApplications(backendEnrichedApplications);
        
        // Update localStorage with backend data
        localStorage.setItem('promatchai_users', JSON.stringify(backendUsers));
        localStorage.setItem('promatchai_jobs', JSON.stringify(mergedJobs));
        localStorage.setItem('promatchai_courses', JSON.stringify(mergedCourses));
        localStorage.setItem('promatchai_applications', JSON.stringify(mergedApplicationsRaw));
      } catch (backendError) {
        console.log('Backend unavailable, using localStorage only');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const shortlistStorageKey = 'promatchai_shortlists';

  const loadShortlist = async (opportunityId: string) => {
    try {
      const storedShortlists = localStorage.getItem(shortlistStorageKey);
      const localShortlists: ShortlistRecord[] = storedShortlists ? JSON.parse(storedShortlists) : [];
      setShortlistRecords(localShortlists);
      const localMatches = localShortlists.filter((record) => record.opportunityId === opportunityId);
      setShortlistedCandidateIds(localMatches.map((record) => record.candidateId));

      try {
        const response = await fetch(`${API_URL}/shortlists/opportunity/${opportunityId}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        if (!response.ok) return;
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const backendShortlists = result.data as ShortlistRecord[];
          setShortlistedCandidateIds(backendShortlists.map((record) => record.candidateId));
          const merged = [...localShortlists.filter((record) => record.opportunityId !== opportunityId), ...backendShortlists];
          localStorage.setItem(shortlistStorageKey, JSON.stringify(merged));
          setShortlistRecords(merged);
        }
      } catch (error) {
        console.log('Shortlist service unavailable, using local shortlist data');
      }
    } catch (error) {
      console.error('Error loading shortlist:', error);
    }
  };

  const fetchRecommendedCandidates = async (opportunityId: string) => {
    const selectedJob = jobs.find((job) => String(job.id) === String(opportunityId));
    if (!selectedJob) return;

    setSelectedRecommendationJobId(String(opportunityId));

    try {
      const response = await fetch(`${API_URL}/recommendations/candidates/${opportunityId}?topK=5`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Recommendation endpoint unavailable');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setRecommendedCandidates(result.data as CandidateRecommendation[]);
        return;
      }
    } catch (error) {
      console.log('Recommendation endpoint unavailable, using local scoring fallback');
    }

    const localRecommendations = recommendCandidatesForOpportunity(selectedJob, users.filter((user) => user.userType === 'refugee'), undefined, 5);
    setRecommendedCandidates(
      localRecommendations.map((recommendation) => ({
        candidate: recommendation.item,
        score: recommendation.score,
        breakdown: recommendation.breakdown,
      })),
    );
  };

  const toggleShortlistCandidate = async (candidateRecommendation: CandidateRecommendation) => {
    const candidate = candidateRecommendation.candidate;
    const opportunityId = selectedRecommendationJobId;
    const selectedJob = jobs.find((job) => String(job.id) === String(opportunityId));
    if (!candidate || !selectedJob) return;

    try {
      const storedShortlists = localStorage.getItem(shortlistStorageKey);
      const shortlists: ShortlistRecord[] = storedShortlists ? JSON.parse(storedShortlists) : [];
      const existingRecord = shortlists.find((record) =>
        record.opportunityId === opportunityId && record.candidateId === candidate.id,
      );

      if (existingRecord) {
        const updatedShortlists = shortlists.filter((record) => record.id !== existingRecord.id);
        localStorage.setItem(shortlistStorageKey, JSON.stringify(updatedShortlists));
        setShortlistRecords(updatedShortlists);
        setShortlistedCandidateIds(updatedShortlists.filter((record) => record.opportunityId === opportunityId).map((record) => record.candidateId));

        try {
          await fetch(`${API_URL}/shortlists/${existingRecord.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          });
        } catch (error) {
          console.log('Shortlist delete sync unavailable, removed locally only');
        }
      } else {
        const shortlistRecord: ShortlistRecord = {
          id: `shortlist-${Date.now()}-${candidate.id}`,
          opportunityId,
          opportunityTitle: selectedJob.title,
          companyName: selectedJob.company,
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          createdAt: new Date().toISOString(),
        };
        const updatedShortlists = [...shortlists, shortlistRecord];
        localStorage.setItem(shortlistStorageKey, JSON.stringify(updatedShortlists));
        setShortlistRecords(updatedShortlists);
        setShortlistedCandidateIds(updatedShortlists.filter((record) => record.opportunityId === opportunityId).map((record) => record.candidateId));
        addShortlistNotification(candidate.id, selectedJob.title, selectedJob.company);

        try {
          await fetch(`${API_URL}/shortlists`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(shortlistRecord),
          });
        } catch (error) {
          console.log('Shortlist save sync unavailable, saved locally only');
        }
      }
    } catch (error) {
      console.error('Error updating shortlist:', error);
    }
  };

  const removeShortlistRecord = async (record: ShortlistRecord) => {
    try {
      const storedShortlists = localStorage.getItem(shortlistStorageKey);
      const shortlists: ShortlistRecord[] = storedShortlists ? JSON.parse(storedShortlists) : [];
      const updatedShortlists = shortlists.filter((entry) => entry.id !== record.id);
      localStorage.setItem(shortlistStorageKey, JSON.stringify(updatedShortlists));
      setShortlistRecords(updatedShortlists);

      if (String(record.opportunityId) === String(selectedRecommendationJobId)) {
        setShortlistedCandidateIds(
          updatedShortlists
            .filter((entry) => entry.opportunityId === record.opportunityId)
            .map((entry) => entry.candidateId),
        );
      }

      try {
        await fetch(`${API_URL}/shortlists/${record.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
      } catch (error) {
        console.log('Shortlist removal sync unavailable, removed locally only');
      }
    } catch (error) {
      console.error('Error removing shortlist record:', error);
    }
  };

  const filteredShortlistRecords = shortlistRecords
    .filter((record) => {
      const candidate = users.find((user) => String(user.id) === String(record.candidateId));
      const opportunity = jobs.find((job) => String(job.id) === String(record.opportunityId));
      const searchTarget = [
        record.candidateName,
        candidate?.name,
        record.opportunityTitle,
        opportunity?.title,
        record.companyName,
        opportunity?.company,
        candidate?.location,
        ...(candidate?.skills || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        shortlistSearchTerm.trim().length === 0 ||
        searchTarget.includes(shortlistSearchTerm.trim().toLowerCase());

      const matchesOpportunity =
        shortlistOpportunityFilter === 'all' ||
        String(record.opportunityId) === String(shortlistOpportunityFilter);

      return matchesSearch && matchesOpportunity;
    })
    .slice()
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt || 0).getTime();
      const rightTime = new Date(right.createdAt || 0).getTime();
      return shortlistSortOrder === 'newest' ? rightTime - leftTime : leftTime - rightTime;
    });

  const exportShortlistsCsv = () => {
    const rows = [
      ['Candidate', 'Opportunity', 'Company', 'Location', 'Skills', 'Saved On'],
      ...filteredShortlistRecords.map((record) => {
        const candidate = users.find((user) => String(user.id) === String(record.candidateId));
        const opportunity = jobs.find((job) => String(job.id) === String(record.opportunityId));

        return [
          record.candidateName || candidate?.name || 'Candidate',
          record.opportunityTitle || opportunity?.title || 'Opportunity',
          record.companyName || opportunity?.company || 'Company',
          candidate?.location || 'Location not specified',
          (candidate?.skills || []).join(' | '),
          record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '',
        ];
      }),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shortlisted-candidates-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const contactCandidate = (record: ShortlistRecord, candidate?: AdminUser, opportunity?: AdminJob) => {
    const recipientEmail = candidate?.email || record.candidateEmail;
    const candidateName = record.candidateName || candidate?.name || 'candidate';
    const opportunityTitle = record.opportunityTitle || opportunity?.title || 'your application';
    const companyName = record.companyName || opportunity?.company || 'our team';

    if (!recipientEmail) {
      toast.warning(`No email is available for ${candidateName}. Add an email to the refugee profile to contact this candidate from the shortlist.`, 'Missing Email');
      return;
    }

    const subject = encodeURIComponent(`Regarding ${opportunityTitle} at ${companyName}`);
    const body = encodeURIComponent(
      `Hello ${candidateName},\n\nWe shortlisted your profile for ${opportunityTitle} at ${companyName} and would like to connect with you.\n\nBest regards,\n${companyName}`,
    );

    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  const openInviteDialog = (record: ShortlistRecord, candidate?: AdminUser, opportunity?: AdminJob) => {
    setInviteDialogRecord(record);
    setInviteDialogCandidate(candidate);
    setInviteDialogOpportunity(opportunity);
    setInviteDialogNote(
      record.invitationNote ||
        `We would like to invite you to an interview for ${record.opportunityTitle || opportunity?.title || 'this opportunity'}.`,
    );
    setInviteDialogOpen(true);
  };

  const inviteShortlistedCandidate = async () => {
    const record = inviteDialogRecord;
    const candidate = inviteDialogCandidate;
    const opportunity = inviteDialogOpportunity;
    const invitationNote = inviteDialogNote.trim();

    if (!record || !invitationNote) {
      return;
    }

    try {
      const storedShortlists = localStorage.getItem(shortlistStorageKey);
      const shortlists: ShortlistRecord[] = storedShortlists ? JSON.parse(storedShortlists) : [];
      const updatedShortlists = shortlists.map((entry) =>
        entry.id === record.id
          ? {
              ...entry,
              invitationNote,
              invitationStatus: 'interview_scheduled',
              invitedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : entry,
      );

      localStorage.setItem(shortlistStorageKey, JSON.stringify(updatedShortlists));
      setShortlistRecords(updatedShortlists);

      const storedApplications = localStorage.getItem('promatchai_applications');
      const localApplications: AdminApplication[] = storedApplications ? JSON.parse(storedApplications) : [];
      const matchingApplication = localApplications.find((application) =>
        String(application.userId) === String(record.candidateId) &&
        String(application.jobId) === String(record.opportunityId),
      );

      if (matchingApplication) {
        const updatedApplications: AdminApplication[] = localApplications.map((application) =>
          application.id === matchingApplication.id
            ? {
                ...application,
                status: 'interview_scheduled',
                interviewNote: invitationNote,
                updatedAt: new Date().toISOString(),
              }
            : application,
        );
        localStorage.setItem('promatchai_applications', JSON.stringify(updatedApplications));
        setApplications(updatedApplications);

        try {
          await fetch(`${API_URL}/applications/${matchingApplication.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              status: 'interview_scheduled',
              interviewNote: invitationNote,
            }),
          });
        } catch (error) {
          console.log('Application interview status sync unavailable, updated locally only');
        }

        addApplicationStatusNotification(
          matchingApplication.userId,
          'interview_scheduled',
          matchingApplication.jobTitle,
          matchingApplication.company,
        );
      }

      try {
        await fetch(`${API_URL}/shortlists/${record.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            invitationNote,
            invitationStatus: 'interview_scheduled',
            invitedAt: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.log('Shortlist invitation sync unavailable, updated locally only');
      }

      setInviteDialogOpen(false);
      setInviteDialogRecord(null);
      setInviteDialogCandidate(null);
      setInviteDialogOpportunity(null);
      setInviteDialogNote('');

      addInterviewInvitationNotification(record.candidateId, record.opportunityTitle, record.companyName);

      toast.success(
        matchingApplication
          ? 'Interview invitation saved and the application was updated to interview scheduled.'
          : 'Interview invitation saved to the shortlist record. No matching application was found to update.',
        'Invitation Saved',
      );
    } catch (error) {
      console.error('Error inviting shortlisted candidate:', error);
      toast.error('Failed to save the interview invitation. Please try again.', 'Invitation Failed');
    }
  };

  const openConfirmationDialog = (
    title: string,
    description: string,
    action: () => Promise<void> | void,
  ) => {
    setConfirmDialogTitle(title);
    setConfirmDialogDescription(description);
    setConfirmDialogAction(() => action);
    setConfirmDialogOpen(true);
  };

  const verifyDeletionInBackend = async (
    type: 'job' | 'course' | 'application',
    id: string,
    existingItem?: AdminJob | AdminCourse | AdminApplication,
  ) => {
    try {
      const response = await fetch(`${API_URL}/${resourcePathByType[type]}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      const items = Array.isArray(result.data) ? result.data : [];

      const stillExists = items.some((item: AdminJob | AdminCourse | AdminApplication) => {
        if (String(item.id) === String(id)) {
          return true;
        }

        if (!existingItem) {
          return false;
        }

        if (type === 'job') {
          return sameJobSignature(item as AdminJob, existingItem as AdminJob);
        }

        if (type === 'course') {
          return sameCourseSignature(item as AdminCourse, existingItem as AdminCourse);
        }

        return sameApplicationSignature(item as AdminApplication, existingItem as AdminApplication);
      });

      return !stillExists;
    } catch (error) {
      return false;
    }
  };

  const cleanupMatchingBackendDuplicates = async (
    type: 'job' | 'course' | 'application',
    id: string,
    existingItem?: AdminJob | AdminCourse | AdminApplication,
  ) => {
    if (!existingItem) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${resourcePathByType[type]}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      const backendItems = Array.isArray(result.data) ? result.data : [];

      const duplicateItems = backendItems.filter((item: AdminJob | AdminCourse | AdminApplication) => {
        if (String(item.id) === String(id)) {
          return false;
        }

        if (type === 'job') {
          return sameJobSignature(item as AdminJob, existingItem as AdminJob);
        }

        if (type === 'course') {
          return sameCourseSignature(item as AdminCourse, existingItem as AdminCourse);
        }

        return sameApplicationSignature(item as AdminApplication, existingItem as AdminApplication);
      });

      await Promise.all(
        duplicateItems.map((item: AdminJob | AdminCourse | AdminApplication) =>
          fetch(`${API_URL}/${resourcePathByType[type]}/${item.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }).catch(() => null),
        ),
      );
    } catch (error) {
      console.log(`${type} duplicate cleanup skipped`);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const storageKey = `promatchai_${type}s`;
      const storedItems = localStorage.getItem(storageKey);
      const previousItems = storedItems ? JSON.parse(storedItems) : null;
      const existingItem = previousItems?.find((item: { id: string }) => item.id === id);

      if (type === 'job' && existingItem) {
        markJobDeleted(existingItem as AdminJob);
      }

      if (storedItems) {
        const items: Array<{ id: string }> = JSON.parse(storedItems);
        const filteredItems = items.filter((item) => item.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(filteredItems));
      }

      if (type === 'application') {
        const storedUsers = localStorage.getItem('promatchai_users');
        if (storedUsers) {
          const users: AdminUser[] = JSON.parse(storedUsers);
          const updatedUsers = users.map((user) => ({
            ...user,
            applications: ((user as AdminUser & { applications?: AdminApplication[] }).applications || []).filter(
              (application) => application.id !== id,
            ),
          }));
          localStorage.setItem('promatchai_users', JSON.stringify(updatedUsers));
        }
      }
      
      try {
        const response = await fetch(`${API_URL}/${type}s/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });

        if (!response.ok && response.status !== 404) {
          throw new Error(`Backend delete failed with status ${response.status}`);
        }

        // Older sample data may exist multiple times with different ids.
        // Clean up matching duplicates without failing the main delete flow.
        if (existingItem && (type === 'job' || type === 'course' || type === 'application')) {
          if (type === 'job') {
            unmarkJobDeleted(existingItem as AdminJob);
          }
          await cleanupMatchingBackendDuplicates(type as 'job' | 'course' | 'application', id, existingItem);
        }
      } catch (backendError) {
        const deletionConfirmed =
          existingItem && (type === 'job' || type === 'course' || type === 'application')
            ? await verifyDeletionInBackend(type as 'job' | 'course' | 'application', id, existingItem)
            : false;

        if (deletionConfirmed) {
          if (type === 'job' && existingItem) {
            unmarkJobDeleted(existingItem as AdminJob);
          }
          await fetchData();
          toast.success(
            type === 'job'
              ? 'Job deleted permanently.'
              : type === 'course'
              ? 'Course deleted permanently.'
              : 'Application deleted permanently.',
            'Delete Complete',
          );
          return;
        }

        if (type !== 'job' && previousItems) {
          localStorage.setItem(storageKey, JSON.stringify(previousItems));
        }
        if (type === 'application') {
          const storedUsers = localStorage.getItem('promatchai_users');
          if (storedUsers && previousItems) {
            const users: AdminUser[] = JSON.parse(storedUsers);
            const restoredApplications = previousItems as AdminApplication[];
            const restoredApplication = restoredApplications.find((application) => application.id === id);
            if (restoredApplication) {
              const updatedUsers = users.map((user) =>
                String(user.id) === String(restoredApplication.userId)
                  ? {
                      ...user,
                      applications: [
                        ...((user as AdminUser & { applications?: AdminApplication[] }).applications || []),
                        restoredApplication,
                      ],
                    }
                  : user,
              );
              localStorage.setItem('promatchai_users', JSON.stringify(updatedUsers));
            }
          }
        }
        console.log('Backend unavailable or delete failed');
        toast.warning(
          type === 'job'
            ? 'The job could not be deleted from the server, so it was only hidden locally.'
            : type === 'course'
            ? 'The course could not be deleted from the backend, so the local change was rolled back.'
            : `The ${type} could not be deleted from the backend, so the local change was rolled back.`,
          'Delete Not Synced',
        );
        await fetchData();
        return;
      }
      
      await fetchData();
      if (type === 'job') {
        toast.success('Job deleted permanently.', 'Delete Complete');
      } else if (type === 'course') {
        toast.success('Course deleted permanently.', 'Delete Complete');
      } else if (type === 'application') {
        toast.success('Application deleted permanently.', 'Delete Complete');
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete this ${type}. Please try again.`, 'Delete Failed');
    }
  };

  const handleApplicationDecision = async (application: AdminApplication, status: 'accepted' | 'rejected') => {
    try {
      await handleSave('application', { ...application, status });
      addApplicationStatusNotification(application.userId, status, application.jobTitle, application.company);
      toast.success(
        status === 'accepted'
          ? 'Application marked as accepted.'
          : 'Application marked as rejected.',
        status === 'accepted' ? 'Application Accepted' : 'Application Rejected',
      );
    } catch (error) {
      console.error(`Error updating application to ${status}:`, error);
      toast.error('Failed to update application status. Please try again.', 'Application Update Failed');
    }
  };

  const openUserProfileFromStorage = (userId: string) => {
    try {
      const storedUsers = localStorage.getItem('promatchai_users');
      if (storedUsers) {
        const allUsers: AdminUser[] = JSON.parse(storedUsers);
        const userProfile = allUsers.find((u) => u.id === userId);
        if (userProfile) {
          setViewingUserCV(userProfile);
        } else {
          toast.warning('User profile not found.', 'Profile Missing');
        }
      } else {
        toast.warning('No users found in storage.', 'Profile Missing');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile.', 'Profile Error');
    }
  };

  const handleSave = async (type: string, data: ItemFormData | AdminApplication) => {
    try {
      const storageKey = `promatchai_${type}s`;
      const storedItems = localStorage.getItem(storageKey);
      const items: EditableAdminItem[] | AdminApplication[] = storedItems ? JSON.parse(storedItems) : [];
      let payload: ItemFormData | AdminApplication | (EditableAdminItem & { createdAt?: string }) = data;
      
      if (editingItem) {
        // Update existing item in localStorage
        const itemIndex = items.findIndex((item) => item.id === editingItem.id);
        if (itemIndex !== -1) {
          items[itemIndex] = { ...items[itemIndex], ...data };
          payload = items[itemIndex] as EditableAdminItem;
          localStorage.setItem(storageKey, JSON.stringify(items));
          if (type === 'job') {
            unmarkJobDeleted(items[itemIndex] as AdminJob);
          }
        }
      } else {
        // Add new item to localStorage
        const newItem = {
          ...data,
          id: `${type}-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        items.push(newItem);
        payload = newItem;
        localStorage.setItem(storageKey, JSON.stringify(items));
        if (type === 'job') {
          unmarkJobDeleted(newItem as AdminJob);
        }
      }
      
      // Try to sync with backend (optional)
      try {
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem ? `${API_URL}/${type}s/${editingItem.id}` : `${API_URL}/${type}s`;
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Backend save failed with status ${response.status}`);
        }

        const result = await response.json();
        if (result?.success && result?.data) {
          const refreshedItems = items.map((item) =>
            item.id === result.data.id || item.id === (payload as { id?: string }).id
              ? { ...item, ...result.data }
              : item,
          );
          localStorage.setItem(storageKey, JSON.stringify(refreshedItems));
        }
      } catch (backendError) {
        console.log('Backend unavailable, saved to localStorage only');
      }
      
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  };

  const openModal = (type: AdminModalType, item?: EditableAdminItem) => {
    setModalType(type);
    setEditingItem(item || null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-[#D9E7F3] bg-gradient-to-r from-white via-[#F7FBFE] to-[#FFF8F4]">
        <div className="mx-auto max-w-[92rem] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF4FF] to-[#F7ECFF] text-[#5B7BD5] shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-[#173B57]">ProMatchAI Admin</h1>
                <p className="mt-1 text-sm text-[#688096]">Manage your refugee job matching platform</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                openConfirmationDialog(
                  'Log Out',
                  'Are you sure you want to log out of the admin panel?',
                  () => onLogout(),
                )
              }
              className="rounded-2xl border-[#D4E2EE] bg-white/90 text-[#4C667D] hover:bg-[#F7FBFE]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-[92rem] px-6 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)}>
          <div ref={tabsListRef} className="mb-6">
            <TabsList className="rounded-[22px] border border-[#D8E6F2] bg-white/80 p-1.5 shadow-sm">
              <TabsTrigger
                value="dashboard"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#F1F6FF] data-[state=active]:text-[#2E63C3]"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#F1F6FF] data-[state=active]:text-[#2E63C3]"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#FFF4EC] data-[state=active]:text-[#F17B2D]"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#EEF9F2] data-[state=active]:text-[#18A96B]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#FBF3FF] data-[state=active]:text-[#7A57D0]"
              >
                <FileText className="w-4 h-4 mr-2" />
                Applications
              </TabsTrigger>
              <TabsTrigger
                value="applicants"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#F1F6FF] data-[state=active]:text-[#2E63C3]"
              >
                <Users className="w-4 h-4 mr-2" />
                Applicants
              </TabsTrigger>
              <TabsTrigger
                value="shortlists"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#FFF8EC] data-[state=active]:text-[#D48A1F]"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Shortlists
              </TabsTrigger>
              <TabsTrigger
                value="emails"
                className="rounded-2xl px-3 py-2 data-[state=active]:bg-[#FFF1F4] data-[state=active]:text-[#E05A73]"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Automation
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="mb-4">
              <h2 className="text-lg text-[#173B57]">Recommended Refugees</h2>
              <p className="mt-1 text-sm text-[#688096]">
                Two-sided hybrid recommendations based on skills, languages, experience, location, and text similarity.
              </p>
            </div>
            <RecommendedCandidatesPanel
              jobs={jobs}
              selectedRecommendationJobId={selectedRecommendationJobId}
              onJobChange={fetchRecommendedCandidates}
              recommendedCandidates={recommendedCandidates}
              shortlistedCandidateIds={shortlistedCandidateIds}
              onToggleShortlist={toggleShortlistCandidate}
              onViewProfile={(candidate) => setViewingUserCV(candidate)}
            />

            <div className="mb-4 mt-8">
              <h2 className="text-lg text-[#173B57]">Platform Stats</h2>
              <p className="mt-1 text-sm text-[#688096]">
                Quick overview of users, jobs, courses, and applications.
              </p>
            </div>

            <div className="mb-8 mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Card className="rounded-[26px] border border-[#D8E6F2] bg-[#F9FCFF] shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm text-[#24455F]">Total Users</CardTitle>
                  <div className="rounded-2xl bg-[#EEF4FF] p-2 text-[#5B7BD5]">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-[#173B57]">{analytics?.totalRefugees || 0} + {analytics?.totalEmployers || 0}</div>
                  <p className="mt-2 text-xs leading-5 text-[#688096]">
                    {analytics?.totalRefugees || 0} refugees, {analytics?.totalEmployers || 0} employers
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border border-[#D8E6F2] bg-[#FFF9F4] shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm text-[#24455F]">Active Jobs</CardTitle>
                  <div className="rounded-2xl bg-[#FFE7D8] p-2 text-[#F17B2D]">
                    <Briefcase className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-[#173B57]">{analytics?.activeJobs || 0}</div>
                  <p className="mt-2 text-xs leading-5 text-[#688096]">
                    {analytics?.totalJobs || 0} total postings
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border border-[#D8E6F2] bg-[#F6FCF8] shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm text-[#24455F]">Active Courses</CardTitle>
                  <div className="rounded-2xl bg-[#DFF5E8] p-2 text-[#18A96B]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-[#173B57]">{analytics?.totalCourses || 0}</div>
                  <p className="mt-2 text-xs leading-5 text-[#688096]">
                    {analytics?.totalCourses || 0} total courses
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border border-[#D8E6F2] bg-[#FBF8FF] shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm text-[#24455F]">Applications</CardTitle>
                  <div className="rounded-2xl bg-[#EEE7FF] p-2 text-[#7A57D0]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-[#173B57]">{analytics?.totalApplications || 0}</div>
                  <p className="mt-2 text-xs leading-5 text-[#688096]">
                    {analytics?.successfulMatches || 0} successful matches
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-4 mt-8">
              <h2 className="text-lg text-[#173B57]">Recent Activity</h2>
              <p className="mt-1 text-sm text-[#688096]">
                Latest application activity across the platform.
              </p>
            </div>

            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between gap-3 rounded-[24px] border border-[#D8E6F2] bg-white px-4 py-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[#173B57]">
                      {app.userName || 'User'} applied for {app.jobTitle || 'Job'}
                    </p>
                    <p className="mt-1 text-xs text-[#688096]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                    {app.status}
                  </Badge>
                </div>
              ))}
              {applications.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">No recent applications</p>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-2xl border-[#D4E2EE]"
                    />
                  </div>
                </div>

                <div className="space-y-3 md:hidden">
                  {users
                    .filter((user) =>
                      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <div key={user.id} className="rounded-[26px] border border-[#D8E6F2] bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-base font-medium text-gray-900">{user.name}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge variant={user.userType === 'refugee' ? 'default' : 'secondary'}>
                                {user.userType}
                              </Badge>
                              <span className="text-sm text-gray-600">{user.skills?.length || 0} skills</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {user.userType === 'refugee' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewingUserCV(user)}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete('user', user.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 text-sm text-gray-600">Name</th>
                        <th className="pb-3 text-sm text-gray-600">Type</th>
                        <th className="pb-3 text-sm text-gray-600">Skills</th>
                        <th className="pb-3 text-sm text-gray-600">Joined</th>
                        <th className="pb-3 text-sm text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((user) =>
                          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => (
                          <tr key={user.id} className="border-b last:border-0">
                            <td className="py-3">{user.name}</td>
                            <td className="py-3">
                              <Badge variant={user.userType === 'refugee' ? 'default' : 'secondary'}>
                                {user.userType}
                              </Badge>
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {user.skills?.length || 0} skills
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 flex gap-2">
                              {user.userType === 'refugee' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewingUserCV(user)}
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete('user', user.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {users.length === 0 && (
                  <p className="py-8 text-center text-gray-500">No users found</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <JobManagementPanel
              jobs={jobs}
              onAddJob={() => openModal('job')}
              onEditJob={(job) => openModal('job', job)}
              onDeleteJob={(job) =>
                openConfirmationDialog(
                  'Delete Job',
                  `Are you sure you want to delete "${job.title}"? This action cannot be undone.`,
                  () => handleDelete('job', job.id),
                )
              }
            />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CourseManagementPanel
              courses={courses}
              onAddCourse={() => openModal('course')}
              onEditCourse={(course) => openModal('course', course)}
              onDeleteCourse={(course) =>
                openConfirmationDialog(
                  'Delete Course',
                  `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
                  () => handleDelete('course', course.id),
                )
              }
            />
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <ApplicationManagementPanel
              applications={applications}
              onViewUserProfile={openUserProfileFromStorage}
              onOpenConfirmation={openConfirmationDialog}
              onApplicationDecision={handleApplicationDecision}
              onContactApplicant={() => {
                toast.info('Contact flow can be expanded here to open email or messaging for the applicant.', 'Contact Applicant');
              }}
              onDeleteApplication={(application) =>
                openConfirmationDialog(
                  'Delete Application',
                  `Delete the application from ${application.userName || 'this applicant'} for ${application.jobTitle || 'this opportunity'}? This action cannot be undone.`,
                  () => handleDelete('application', application.id),
                )
              }
            />
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants">
            <AdminApplicantManagement
              applications={applications}
              users={users}
              onStatusChange={handleStatusChange}
              onBulkStatusChange={handleBulkStatusChange}
              onSendNotification={handleSendNotification}
              onDeleteApplication={(application) =>
                openConfirmationDialog(
                  'Delete Application',
                  `Delete the application from ${application.userName || 'this applicant'} for ${application.jobTitle || 'this opportunity'}? This action cannot be undone.`,
                  () => handleDelete('application', application.id),
                )
              }
            />
          </TabsContent>

          <TabsContent value="shortlists">
            <ShortlistManagement
              shortlistRecords={shortlistRecords}
              filteredShortlistRecords={filteredShortlistRecords}
              shortlistSearchTerm={shortlistSearchTerm}
              setShortlistSearchTerm={setShortlistSearchTerm}
              shortlistOpportunityFilter={shortlistOpportunityFilter}
              setShortlistOpportunityFilter={setShortlistOpportunityFilter}
              shortlistSortOrder={shortlistSortOrder}
              setShortlistSortOrder={setShortlistSortOrder}
              jobs={jobs}
              users={users}
              exportShortlistsCsv={exportShortlistsCsv}
              openInviteDialog={openInviteDialog}
              contactCandidate={contactCandidate}
              openCandidateProfile={(candidate) => candidate && setViewingUserCV(candidate)}
              removeShortlistRecord={removeShortlistRecord}
            />
          </TabsContent>

          {/* Email Automation Tab */}
          <TabsContent value="emails">
            <EmailAutomationSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for Add/Edit Job/Course */}
      {showModal && <ItemModal
        type={modalType!}
        item={editingItem}
        onSave={(data) => handleSave(modalType!, data)}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
      />}

      <InterviewInvitationDialog
        open={inviteDialogOpen}
        onOpenChange={(open) => {
          setInviteDialogOpen(open);
          if (!open) {
            setInviteDialogRecord(null);
            setInviteDialogCandidate(null);
            setInviteDialogOpportunity(null);
            setInviteDialogNote('');
          }
        }}
        candidateName={inviteDialogRecord?.candidateName || inviteDialogCandidate?.name}
        opportunityTitle={inviteDialogRecord?.opportunityTitle || inviteDialogOpportunity?.title}
        companyName={inviteDialogRecord?.companyName || inviteDialogOpportunity?.company}
        note={inviteDialogNote}
        onNoteChange={setInviteDialogNote}
        onSubmit={inviteShortlistedCandidate}
        onCancel={() => {
          setInviteDialogOpen(false);
          setInviteDialogRecord(null);
          setInviteDialogCandidate(null);
          setInviteDialogOpportunity(null);
          setInviteDialogNote('');
        }}
      />

      <ConfirmationDialog
        open={confirmDialogOpen}
        title={confirmDialogTitle}
        description={confirmDialogDescription}
        onOpenChange={(open) => {
          setConfirmDialogOpen(open);
          if (!open) {
            setConfirmDialogTitle('');
            setConfirmDialogDescription('');
            setConfirmDialogAction(null);
          }
        }}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setConfirmDialogTitle('');
          setConfirmDialogDescription('');
          setConfirmDialogAction(null);
        }}
        onConfirm={async () => {
          if (confirmDialogAction) {
            await confirmDialogAction();
          }
          setConfirmDialogOpen(false);
          setConfirmDialogTitle('');
          setConfirmDialogDescription('');
          setConfirmDialogAction(null);
        }}
      />

      {/* CV Viewer Modal */}
      {viewingUserCV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(232,244,248,0.82)] p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[#D7E6F2] bg-[#FCFEFF] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-[#173B57]">Candidate Profile - {viewingUserCV.name}</h2>
              <Button variant="ghost" onClick={() => setViewingUserCV(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* CV-style layout */}
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-[24px] bg-gradient-to-r from-[#2E63C3] via-[#4F63E0] to-[#9A2BE8] p-6 text-white shadow-[0_18px_40px_rgba(79,99,224,0.22)]">
                <h1 className="text-[2rem] leading-tight">{viewingUserCV.name}</h1>
                <div className="mt-5 grid grid-cols-1 gap-3 text-sm [&>p]:rounded-2xl [&>p]:bg-white/12 [&>p]:px-3 [&>p]:py-2.5 [&>p]:leading-6 [&>p]:backdrop-blur-sm [&>p]:break-all sm:grid-cols-2">
                  {viewingUserCV.email && <p>📧 {viewingUserCV.email}</p>}
                  {viewingUserCV.phone && <p>📞 {viewingUserCV.phone}</p>}
                  {viewingUserCV.location && <p>📍 {viewingUserCV.location}</p>}
                  {viewingUserCV.language && <p>🌐 {viewingUserCV.language.toUpperCase()}</p>}
                </div>
              </div>

              {/* Skills */}
              {viewingUserCV.skills && viewingUserCV.skills.length > 0 && (
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded"></div>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingUserCV.skills.map((skill: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {viewingUserCV.experience && viewingUserCV.experience.length > 0 && (
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded"></div>
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {viewingUserCV.experience.map((exp, index: number) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <h4 className="text-gray-900">{exp.position}</h4>
                        <p className="text-gray-600">{exp.company} - {exp.location}</p>
                        <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                        {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {viewingUserCV.education && viewingUserCV.education.length > 0 && (
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded"></div>
                    Education
                  </h3>
                  <div className="space-y-4">
                    {viewingUserCV.education.map((edu, index: number) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4">
                        <h4 className="text-gray-900">{edu.degree} in {edu.field}</h4>
                        <p className="text-gray-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {viewingUserCV.badges && viewingUserCV.badges.length > 0 && (
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-yellow-600 rounded"></div>
                    Certificates & Achievements
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {viewingUserCV.badges.map((badge: string, index: number) => (
                      <li key={index} className="text-gray-600">{badge}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t flex justify-end">
              <Button onClick={() => setViewingUserCV(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

interface ItemModalProps {
  type: AdminModalType;
  item: EditableAdminItem | null;
  onSave: (data: ItemFormData) => void;
  onClose: () => void;
}

// Modal Component for Adding/Editing Items
function ItemModal({ type, item, onSave, onClose }: ItemModalProps) {
  const [formData, setFormData] = useState(
    item || {
      title: '',
      company: type === 'job' ? '' : undefined,
      location: type === 'job' ? '' : undefined,
      description: '',
      requiredSkills: type === 'job' ? [] : undefined,
      preferredSkills: type === 'job' ? [] : undefined,
      requiredLanguages: type === 'job' ? [] : undefined,
      category: type === 'job' ? [] : undefined,
      workMode: type === 'job' ? 'onsite' : undefined,
      minimumExperience: type === 'job' ? 0 : undefined,
      trainingRequirements: type === 'job' ? [] : undefined,
      preferredBadges: type === 'job' ? [] : undefined,
      locationIsMandatory: type === 'job' ? false : undefined,
      duration: type === 'course' ? '' : undefined,
      issuer: type === 'course' ? 'ProMatchAI Learning Center' : undefined,
      certificateName: type === 'course' ? '' : undefined,
      status: 'active',
      offlineAvailable: type === 'course' ? false : undefined,
      videoUrl: type === 'course' ? '' : undefined,
      materials: type === 'course' ? [] : undefined,
    }
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'material') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'video') {
          setFormData({ ...formData, videoUrl: reader.result as string });
        } else {
          const materials = formData.materials || [];
          setFormData({
            ...formData,
            materials: [...materials, { name: file.name, url: reader.result as string }],
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      alert(type === 'job' ? 'Please enter the job title.' : 'Please enter the course title.');
      return false;
    }

    if (!formData.description?.trim()) {
      alert('Please enter a description.');
      return false;
    }

    if (type === 'job') {
      if (!formData.company?.trim()) {
        alert('Please enter a company name.');
        return false;
      }

      if (!formData.location?.trim()) {
        alert('Please enter a location.');
        return false;
      }
    }

    if (type === 'course' && !formData.duration?.trim()) {
      alert('Please enter a duration.');
      return false;
    }

    return true;
  };

  const submitForm = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 p-3 backdrop-blur-sm sm:p-4">
      <div className="mx-auto flex min-h-full max-w-2xl items-center justify-center">
        <div className="max-h-[calc(100vh-1.5rem)] w-full overflow-y-auto rounded-[28px] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-indigo-50 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:max-h-[calc(100vh-2rem)]">
        <div className="sticky top-0 z-10 mb-5 rounded-t-[28px] border-b border-sky-200 bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 px-5 py-4 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-100/80">
            Admin Editor
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {item ? 'Edit' : 'Add'} {type === 'job' ? 'Job' : 'Course'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          {type === 'job' && (
            <div className="space-y-4 rounded-2xl border border-sky-100 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-sky-900">Opportunity Details</h3>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">Smart matching fields</span>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Job Title</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Frontend Developer, Tailoring Apprentice, Kitchen Assistant"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Required Skills</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={(formData.requiredSkills || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                  placeholder="HTML/CSS, JavaScript, Customer Service"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Skills</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={(formData.preferredSkills || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                  placeholder="Git, React, Food Hygiene"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Required Languages</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={(formData.requiredLanguages || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, requiredLanguages: e.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                  placeholder="English, German"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Categories / Sectors</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={(formData.category || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                  placeholder="IT & Tech, Apprenticeship"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Work Mode</label>
                  <select
                    value={formData.workMode || 'onsite'}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Minimum Experience</label>
                  <Input
                    className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                    type="number"
                    min="0"
                    value={formData.minimumExperience ?? 0}
                    onChange={(e) => setFormData({ ...formData, minimumExperience: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Training Requirements</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={(formData.trainingRequirements || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, trainingRequirements: e.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                  placeholder="Web Development Basics, Food Safety & Hygiene"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Badges / Certificates</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={(formData.preferredBadges || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, preferredBadges: e.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                  placeholder="Web Developer, Food Safety Certified"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <input
                  type="checkbox"
                  id="locationIsMandatory"
                  checked={Boolean(formData.locationIsMandatory)}
                  onChange={(e) => setFormData({ ...formData, locationIsMandatory: e.target.checked })}
                />
                <label htmlFor="locationIsMandatory" className="text-sm text-slate-700">Require exact location match</label>
              </div>
            </div>
          )}

          {type === 'course' && (
            <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-indigo-900">Course Details</h3>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">Learning content</span>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Course Title</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Web Development Basics, Customer Service Excellence"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Duration</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Issuing Organization</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={formData.issuer || ''}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="ProMatchAI Learning Center"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Certificate Name</label>
                <Input
                  className="border-slate-200 bg-white text-slate-800 shadow-sm focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  value={formData.certificateName || ''}
                  onChange={(e) => setFormData({ ...formData, certificateName: e.target.value })}
                  placeholder="Certificate of Completion"
                />
              </div>

              {/* Video Upload */}
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  <label className="block text-sm font-medium text-slate-700">Course Video</label>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="text-sm"
                />
                {formData.videoUrl && (
                  <p className="text-xs text-green-600 mt-2">✓ Video uploaded</p>
                )}
              </div>

              {/* Materials Upload */}
              <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <File className="w-5 h-5 text-blue-600" />
                  <label className="block text-sm font-medium text-slate-700">Course Materials (PDFs, Documents)</label>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleFileUpload(e, 'material')}
                  className="text-sm"
                />
                {formData.materials && formData.materials.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {formData.materials.map((material: { name: string; url: string }, index: number) => (
                      <p key={index} className="text-xs text-green-600">
                        ✓ {material.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <input
                  type="checkbox"
                  id="offlineAvailable"
                  checked={formData.offlineAvailable}
                  onChange={(e) => setFormData({ ...formData, offlineAvailable: e.target.checked })}
                />
                <label htmlFor="offlineAvailable" className="text-sm text-slate-700">Make available offline</label>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={submitForm} className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 shadow-lg hover:from-sky-700 hover:via-cyan-600 hover:to-indigo-700">
              Save
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50">
              Cancel
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
