import { useEffect, useMemo, useRef, useState } from 'react';
import { CourseProgress, EarnedCertificate, UserProfile } from '../App';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Play,
  Search,
  X,
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { addCourseCompletedNotification } from '../utils/notifications';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-215f50be`;

interface LearnTabProps {
  userProfile: UserProfile;
  onCourseComplete: (certificate: EarnedCertificate) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

interface Course {
  id: string | number;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
  downloaded: boolean;
  progress: number;
  badge: string;
  certificateName: string;
  issuer: string;
  videoUrl?: string;
  offlineAvailable?: boolean;
}

const categoryThemes = [
  'from-[#F3F8FF] via-[#E7F0FF] to-[#DCEBFF]',
  'from-[#F5FBFF] via-[#E6F6FF] to-[#D8EEFF]',
  'from-[#F8F7FF] via-[#EEF0FF] to-[#E3E8FF]',
  'from-[#F4FBF8] via-[#E7F7F0] to-[#D7F0E6]',
];

const toSafeCourseProgress = (value: UserProfile['courseProgress']) =>
  value && typeof value === 'object' ? value : {};

const buildCourseVisual = (course: any) => {
  if (typeof course.thumbnail === 'string' && course.thumbnail.trim()) {
    return course.thumbnail;
  }

  const title = String(course.title || '').toLowerCase();
  if (title.includes('web') || title.includes('code') || title.includes('developer')) return '💻';
  if (title.includes('language') || title.includes('english') || title.includes('german')) return '🗣️';
  if (title.includes('network') || title.includes('security')) return '🌐';
  if (title.includes('mobile') || title.includes('app')) return '📱';
  if (title.includes('food') || title.includes('cook')) return '🍽️';
  return '📘';
};

const normalizeCourse = (course: any, courseProgress: Record<string, CourseProgress>): Course => {
  const id = String(course.id ?? `course-${course.title ?? 'unknown'}`);
  const progressState = courseProgress[id];

  return {
    id,
    title: course.title || 'Untitled course',
    description: course.description || 'No description available yet.',
    duration: course.duration || 'Self-paced',
    thumbnail: buildCourseVisual(course),
    category: course.category || 'General',
    downloaded: progressState?.downloaded ?? Boolean(course.downloaded),
    progress: progressState?.progress ?? Number(course.progress || 0),
    badge: course.badge || course.certificate || 'Course Completed',
    certificateName: course.certificateName || course.badge || course.certificate || course.title || 'Course Certificate',
    issuer: course.issuer || course.provider || course.company || 'ProMatchAI Learning Center',
    videoUrl: course.videoUrl || '',
    offlineAvailable: Boolean(course.offlineAvailable),
  };
};

const formatProgressLabel = (progress: number) => {
  if (progress >= 100) return 'Completed';
  if (progress > 0) return 'In progress';
  return 'Ready to start';
};

const getCourseMonogram = (course: Course) =>
  course.title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || 'CR';

const getProgressRingStyle = (progress: number) => ({
  background: `conic-gradient(#2B9C8F 0deg ${Math.max(progress, 4) * 3.6}deg, #E6E8CE ${
    Math.max(progress, 4) * 3.6
  }deg 360deg)`,
});

export default function LearnTab({ userProfile, onCourseComplete, onUpdateProfile }: LearnTabProps) {
  const [filter, setFilter] = useState<'all' | 'downloaded' | 'inprogress'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState<string | number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingEnrollmentCourse, setPendingEnrollmentCourse] = useState<Course | null>(null);
  const [featuredScrollIndex, setFeaturedScrollIndex] = useState(0);
  const featuredRailRef = useRef<HTMLDivElement | null>(null);

  const t = getTranslation(userProfile.language);
  const filterButtonStyles: Record<'all' | 'downloaded' | 'inprogress', string> = {
    all: 'border-[#2D63F6] bg-[#2D63F6] text-white shadow-sm',
    downloaded: 'border-[#16A34A] bg-[#16A34A] text-white shadow-sm',
    inprogress: 'border-[#F59E0B] bg-[#F59E0B] text-white shadow-sm',
  };

  const syncProfileProgress = async (nextCourses: Course[]) => {
    const nextCourseProgress = nextCourses.reduce<Record<string, CourseProgress>>((accumulator, course) => {
      accumulator[String(course.id)] = {
        progress: course.progress,
        downloaded: course.downloaded,
        lastAccessedAt: new Date().toISOString(),
      };
      return accumulator;
    }, {});

    const updatedProfile: UserProfile = {
      ...userProfile,
      courseProgress: nextCourseProgress,
    };

    onUpdateProfile(updatedProfile);

    try {
      const storedUsers = localStorage.getItem('promatchai_users');
      if (storedUsers && userProfile.id) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.map((user: UserProfile) =>
          String(user.id) === String(userProfile.id)
            ? { ...user, courseProgress: nextCourseProgress }
            : user,
        );
        localStorage.setItem('promatchai_users', JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error('Error updating course progress in localStorage:', error);
    }

    if (userProfile.id) {
      try {
        await fetch(`${API_URL}/users/${userProfile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ courseProgress: nextCourseProgress }),
        });
      } catch (error) {
        console.error('Error syncing course progress to backend:', error);
      }
    }
  };

  const persistCourses = (nextCourses: Course[]) => {
    setCourses(nextCourses);
    syncProfileProgress(nextCourses);
  };

  const fetchCourses = async () => {
    try {
      const currentProgress = toSafeCourseProgress(userProfile.courseProgress);
      const cachedCourses = localStorage.getItem('promatchai_courses');

      if (cachedCourses) {
        const parsedCourses = JSON.parse(cachedCourses);
        setCourses(parsedCourses.map((course: any) => normalizeCourse(course, currentProgress)));
      }

      const response = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Backend unavailable');

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        localStorage.setItem('promatchai_courses', JSON.stringify(result.data));
        setCourses(result.data.map((course: any) => normalizeCourse(course, currentProgress)));
      }
    } catch (error) {
      console.log('Course service unavailable, keeping cached courses only');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [userProfile.id]);

  const searchedCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'downloaded'
          ? course.downloaded
          : course.progress > 0 && course.progress < 100;

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [course.title, course.description, course.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [courses, filter, searchQuery]);

  const featuredCourses = searchedCourses.filter((course) => course.progress === 0).slice(0, 4);
  const activeCourses = searchedCourses.filter((course) => course.progress > 0 || course.downloaded);
  const featuredDotCount = Math.max(1, Math.ceil(featuredCourses.length / 2));

  const handleDownload = (courseId: string | number) => {
    setDownloading(courseId);
    setTimeout(() => {
      const nextCourses = courses.map((course) =>
        course.id === courseId ? { ...course, downloaded: true } : course,
      );
      persistCourses(nextCourses);
      setDownloading(null);
    }, 1200);
  };

  const handleStartCourse = (courseId: string | number) => {
    const course = courses.find((entry) => entry.id === courseId);
    if (!course) return;

    if (course.progress === 0) {
      const nextCourses = courses.map((entry) =>
        entry.id === courseId ? { ...entry, progress: 15 } : entry,
      );
      persistCourses(nextCourses);
      return;
    }

    if (course.progress > 0 && course.progress < 100) {
      const nextProgress = Math.min(course.progress + 20, 100);
      const nextCourses = courses.map((entry) =>
        entry.id === courseId ? { ...entry, progress: nextProgress } : entry,
      );
      persistCourses(nextCourses);

      if (nextProgress === 100) {
        onCourseComplete({
          id: `certificate-${course.id}-${Date.now()}`,
          courseId: String(course.id),
          courseTitle: course.title,
          certificateName: course.certificateName || course.badge || course.title,
          issuer: course.issuer || 'ProMatchAI Learning Center',
          completedAt: new Date().toISOString(),
        });
        addCourseCompletedNotification(userProfile.id ? String(userProfile.id) : undefined, course.title);
      }
    }
  };

  const openEnrollmentPreview = (course: Course) => {
    setPendingEnrollmentCourse(course);
  };

  const confirmEnrollment = () => {
    if (!pendingEnrollmentCourse) return;
    handleStartCourse(pendingEnrollmentCourse.id);
    setPendingEnrollmentCourse(null);
  };

  const handleFeaturedRailScroll = () => {
    const rail = featuredRailRef.current;
    if (!rail) return;

    const cardWidth = 224;
    const nextIndex = Math.round(rail.scrollLeft / (cardWidth * 2));
    setFeaturedScrollIndex(Math.max(0, Math.min(nextIndex, featuredDotCount - 1)));
  };

  const scrollFeaturedToDot = (dotIndex: number) => {
    const rail = featuredRailRef.current;
    if (!rail) return;

    const cardWidth = 224;
    rail.scrollTo({
      left: dotIndex * cardWidth * 2,
      behavior: 'smooth',
    });
    setFeaturedScrollIndex(dotIndex);
  };

  const renderCourseMedia = (course: Course, compact = false, showOverlayContent = true) => {
    const themeIndex = Math.abs(String(course.id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % categoryThemes.length;
    const theme = categoryThemes[themeIndex];

    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${theme} ${
          compact ? 'h-full min-h-[168px] w-full rounded-[18px]' : 'h-32 w-full rounded-[22px]'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.35)_55%,transparent_75%)]" />
        {!compact && showOverlayContent && (
          <div className="absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#4A6A85]">
            {course.category}
          </div>
        )}
        <div
          className={`absolute ${
            compact ? 'left-1/2 top-6 h-16 w-16 -translate-x-1/2 text-xl' : 'left-5 top-5 h-16 w-16 text-xl'
          } flex items-center justify-center rounded-2xl bg-white/88 font-semibold text-[#2F5EA8] shadow-[0_10px_24px_rgba(148,163,184,0.14)]`}
        >
          {getCourseMonogram(course)}
        </div>
        {compact && (
          <div className="absolute inset-x-3 bottom-3">
            <div className="rounded-full bg-white/82 px-2.5 py-1 text-center text-[11px] font-medium text-[#5A728A]">
              {course.category}
            </div>
          </div>
        )}
        {!compact && showOverlayContent && (
          <div className="absolute inset-x-4 bottom-4">
            <h3 className="max-w-[85%] text-xl leading-[1.08] text-[#183B56]">{course.title}</h3>
            <div className="mt-2 inline-flex items-center rounded-full bg-[#1FC98A] px-3 py-1 text-xs font-medium text-white shadow-sm">
              {course.progress > 0 ? 'Continue' : 'Enroll Now'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E8F4F8]">
      <div className="mx-auto max-w-4xl">
        <div className="px-5 pb-2 pt-5">
          <div className="mb-4">
            <div className="min-w-0">
              <h1 className="text-[30px] leading-none tracking-tight font-medium text-[#173B57]">Learning Center</h1>
              <p className="mt-2 text-sm text-[#58728A]">Grow your skills with guided courses and track your progress.</p>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8AA0B5]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses"
              className="w-full rounded-2xl border border-[#D5E6F3] bg-[#FCFEFF] px-11 py-3 text-[#24455F] outline-none transition focus:border-[#BDD9F0] focus:ring-2 focus:ring-[#E6F3FB]"
            />
          </div>
        </div>

        <div className="space-y-7 px-5 py-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[#49637B]">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'all', label: 'All Courses' },
                { key: 'downloaded', label: 'Downloaded' },
                { key: 'inprogress', label: 'In Progress' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key as 'all' | 'downloaded' | 'inprogress')}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                    filter === option.key
                      ? filterButtonStyles[option.key as 'all' | 'downloaded' | 'inprogress']
                      : 'border-[#D7E5F3] bg-white text-[#5A748B] hover:bg-[#F5FAFE]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {featuredCourses.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl text-[#183B56]">New Courses</h2>
                <span className="text-sm text-[#6A839A]">{featuredCourses.length} available</span>
              </div>
              <div
                ref={featuredRailRef}
                onScroll={handleFeaturedRailScroll}
                className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex w-max snap-x snap-mandatory gap-4 pr-8">
                  {featuredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="w-[208px] flex-shrink-0 snap-start rounded-[26px] border border-[#DFEAF3] bg-white px-3 py-3.5 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                    >
                      {renderCourseMedia(course, false, false)}
                      <div className="px-1 pt-3">
                        <h3 className="line-clamp-2 min-h-[52px] text-[17px] leading-6 text-[#183B56]">{course.title}</h3>
                        <button
                          onClick={() => openEnrollmentPreview(course)}
                          className="mt-3 rounded-full bg-[#1FC98A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#19B87D]"
                        >
                          Enroll
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {featuredDotCount > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  {Array.from({ length: featuredDotCount }).map((_, dotIndex) => (
                    <button
                      key={`featured-dot-${dotIndex}`}
                      onClick={() => scrollFeaturedToDot(dotIndex)}
                      aria-label={`Go to course group ${dotIndex + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        featuredScrollIndex === dotIndex ? 'w-5 bg-[#2E63C3]' : 'w-2 bg-[#C7D7E4]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl text-[#183B56]">My Courses</h2>
              <span className="text-sm text-[#6A839A]">
                {activeCourses.length > 0 ? `${activeCourses.length} active` : 'No active courses yet'}
              </span>
            </div>

            <div className="space-y-4">
              {(activeCourses.length > 0 ? activeCourses : searchedCourses).map((course) => (
                <div
                  key={course.id}
                  className="overflow-hidden rounded-[22px] border border-[#D7E8F4] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-stretch gap-0">
                    <div className="w-[118px] flex-shrink-0">
                      <div className="h-full min-h-[188px] overflow-hidden rounded-r-[20px]">
                        {renderCourseMedia(course, true)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 p-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[17px] leading-6 text-[#183B56]">{course.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6A839A]">{course.description}</p>
                        </div>

                        {course.progress >= 100 ? (
                          <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        ) : downloading === course.id ? (
                          <div className="rounded-full bg-blue-100 p-2">
                            <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDownload(course.id)}
                            className="flex flex-col items-center gap-1 rounded-2xl p-2 text-[#6A839A] transition-colors hover:bg-[#F6FAFD]"
                            disabled={!course.offlineAvailable && !course.videoUrl}
                            title={course.offlineAvailable ? 'Download course' : 'Download available when offline materials exist'}
                          >
                            <div className="rounded-full bg-[#F3F7FB] p-2">
                              <Download className="h-5 w-5" />
                            </div>
                            <span className="text-xs">
                              {course.offlineAvailable ? 'Download' : 'Save'}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#6A839A]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <span className="rounded-full bg-[#F3F7FB] px-2.5 py-1 text-xs font-medium text-[#59758D]">
                          {course.category}
                        </span>
                        {course.downloaded && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                            Offline
                          </span>
                        )}
                      </div>

                      <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-[#E3ECF4] bg-[#FBFDFF] px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#2F516A]">{formatProgressLabel(course.progress)}</p>
                          <div className="mt-2 h-2.5 w-full max-w-[160px] overflow-hidden rounded-full bg-[#E5EEF5]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#FFCA55] to-[#F59E0B] transition-all"
                              style={{ width: `${Math.max(course.progress, course.progress > 0 ? 8 : 0)}%` }}
                            />
                          </div>
                        </div>
                        <div
                          className="relative flex h-14 w-14 items-center justify-center rounded-full"
                          style={getProgressRingStyle(course.progress)}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#2F516A]">
                            {course.progress}%
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartCourse(course.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors ${
                          course.progress >= 100
                            ? 'bg-slate-400 cursor-default'
                            : 'bg-[#1FC98A] hover:bg-[#19B87D]'
                        }`}
                        disabled={course.progress >= 100}
                      >
                        {course.progress >= 100 ? <CheckCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span>
                          {course.progress >= 100
                            ? 'Completed'
                            : course.progress > 0
                            ? 'Continue'
                            : 'Start Course'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(activeCourses.length > 0 ? activeCourses : searchedCourses).length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl text-[#183B56]">Learning Progress</h2>
                <span className="text-sm text-[#6A839A]">Completion overview</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(activeCourses.length > 0 ? activeCourses : searchedCourses).slice(0, 4).map((course) => (
                  <div
                    key={`${course.id}-progress`}
                    className="rounded-[20px] border border-[#D7E8F4] bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium leading-5 text-[#264761]">{course.title}</p>
                        <p className="mt-1 text-xs text-[#6A839A]">{course.category}</p>
                      </div>
                      <div
                        className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                        style={getProgressRingStyle(course.progress)}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#2F516A]">
                          {course.progress}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {searchedCourses.length === 0 && (
            <div className="rounded-3xl border border-[#D9EAF5] bg-white px-6 py-12 text-center shadow-sm">
              <BookOpen className="mx-auto mb-4 h-14 w-14 text-[#BDD0DE]" />
              <h3 className="text-[#183B56]">No courses found</h3>
              <p className="mt-2 text-sm text-[#6A839A]">
                No real courses match your current search or filter yet. Add courses from the admin panel and they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {pendingEnrollmentCourse && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(232,244,248,0.82)] backdrop-blur-sm p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[28px] border border-[#D7E8F4] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E3ECF4] px-5 py-4">
              <div>
                <h3 className="text-lg text-[#183B56]">{pendingEnrollmentCourse.title}</h3>
                <p className="mt-1 text-sm text-[#6A839A]">
                  {pendingEnrollmentCourse.category} · {pendingEnrollmentCourse.duration}
                </p>
              </div>
              <button
                onClick={() => setPendingEnrollmentCourse(null)}
                className="rounded-full p-2 text-[#6A839A] transition-colors hover:bg-[#F4F8FB] hover:text-[#183B56]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm leading-7 text-[#58728A]">{pendingEnrollmentCourse.description}</p>
            </div>

            <div className="flex gap-3 border-t border-[#E3ECF4] px-5 py-4">
              <button
                onClick={() => setPendingEnrollmentCourse(null)}
                className="flex-1 rounded-2xl border border-[#D7E8F4] bg-white px-4 py-3 text-sm font-medium text-[#58728A] transition-colors hover:bg-[#F7FBFE]"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnrollment}
                className="flex-1 rounded-2xl bg-[#1FC98A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#19B87D]"
              >
                Confirm Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
