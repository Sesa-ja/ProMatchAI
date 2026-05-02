import type { UserProfile } from '../App';

export interface ProfileAchievement {
  id: string;
  title: string;
  current: number;
  target: number;
  color: 'gold' | 'silver' | 'green' | 'purple';
  description: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toSafeCount = (value: unknown) => {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

const communicationSignals = (profile: Partial<UserProfile>) => {
  const languages = Array.isArray(profile.languages) ? profile.languages.length : 0;
  const phone = profile.phone ? 1 : 0;
  const email = profile.email ? 1 : 0;
  const location = profile.location ? 1 : 0;
  const bio = profile.bio || profile.summary ? 1 : 0;
  return languages + phone + email + location + bio;
};

export const computeProfileAchievements = (profile: Partial<UserProfile>): ProfileAchievement[] => {
  const courseCount = toSafeCount(profile.completedCourses);
  const skillCount = Array.isArray(profile.skills) ? profile.skills.length : 0;
  const experienceCount = Array.isArray(profile.experience) ? profile.experience.length : 0;
  const applicationCount = Array.isArray(profile.applications) ? profile.applications.length : 0;
  const badgesCount = Array.isArray(profile.badges) ? profile.badges.length : 0;

  return [
    {
      id: 'learning-master',
      title: 'Learning master',
      current: clamp(courseCount + badgesCount, 0, 5),
      target: 5,
      color: 'gold',
      description: 'Grow this by completing courses and earning certificates.',
    },
    {
      id: 'skill-builder',
      title: 'Skill Builder',
      current: clamp(skillCount, 0, 5),
      target: 5,
      color: 'silver',
      description: 'Add verified and practical skills to strengthen your profile.',
    },
    {
      id: 'leadership',
      title: 'Leadership',
      current: clamp(experienceCount + Math.min(applicationCount, 1), 0, 2),
      target: 2,
      color: 'green',
      description: 'Show initiative through experience and active applications.',
    },
    {
      id: 'communicator',
      title: 'Communicator',
      current: clamp(communicationSignals(profile), 0, 10),
      target: 10,
      color: 'purple',
      description: 'Complete more profile details to improve communication strength.',
    },
  ];
};

export const withProfileAchievements = <T extends Partial<UserProfile>>(profile: T): T & { achievements: ProfileAchievement[] } => ({
  ...profile,
  achievements: computeProfileAchievements(profile),
});
