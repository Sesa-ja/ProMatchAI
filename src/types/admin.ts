import type { ApplicationStatus, Education, Experience, UserType } from '../App';
import type { ScoreBreakdown } from '../utils/recommendations';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'jobs'
  | 'courses'
  | 'applications'
  | 'applicants'
  | 'shortlists'
  | 'emails';

export type AdminModalType = 'job' | 'course';

export interface AdminAnalytics {
  totalRefugees: number;
  totalEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalCourses: number;
  totalApplications: number;
  successfulMatches: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  languages?: string[];
  language?: string;
  userType?: UserType;
  skills: string[];
  learning?: string[];
  training?: string[];
  experience: Experience[];
  education: Education[];
  badges: string[];
  interests?: string[];
  preferredSectors?: string[];
  preferredOpportunityTypes?: string[];
  bio?: string;
  summary?: string;
  workModePreference?: string;
  createdAt?: string;
  applications?: AdminApplication[];
}

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  requiredLanguages?: string[];
  category?: string[];
  workMode?: string;
  minimumExperience?: number;
  trainingRequirements?: string[];
  preferredBadges?: string[];
  locationIsMandatory?: boolean;
  status?: string;
  matchScore?: number;
  createdAt?: string;
}

export interface CourseMaterial {
  name: string;
  url: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  duration?: string;
  issuer?: string;
  certificateName?: string;
  status?: string;
  offlineAvailable?: boolean;
  videoUrl?: string;
  materials?: CourseMaterial[];
  createdAt?: string;
}

export interface AdminApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  status: ApplicationStatus;
  createdAt: string;
  appliedDate?: string;
  introduction?: string;
  coverLetter?: string;
  coverLetterFile?: string;
  coverLetterFileName?: string;
  cv?: string;
  cvFileName?: string;
  interviewNote?: string;
  updatedAt?: string;
  userName?: string;
  userEmail?: string;
  userSkills?: string[];
  requiredSkills?: string[];
}

export interface ShortlistRecord {
  id: string;
  opportunityId: string;
  opportunityTitle?: string;
  companyName?: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  createdAt: string;
  updatedAt?: string;
  invitedAt?: string;
  invitationNote?: string;
  invitationStatus?: 'interview_scheduled';
}

export interface CandidateRecommendation {
  candidate: AdminUser;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface JobFormData {
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredLanguages: string[];
  category: string[];
  workMode: string;
  minimumExperience: number;
  trainingRequirements: string[];
  preferredBadges: string[];
  locationIsMandatory: boolean;
  status: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  duration: string;
  issuer?: string;
  certificateName?: string;
  status: string;
  offlineAvailable: boolean;
  videoUrl: string;
  materials: CourseMaterial[];
}

export type EditableAdminItem = AdminJob | AdminCourse;
export type ItemFormData = JobFormData | CourseFormData;
