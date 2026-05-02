export type AppNotificationType =
  | 'application_status'
  | 'new_match'
  | 'message'
  | 'reminder'
  | 'interview'
  | 'shortlist'
  | 'course';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  actionUrl?: string;
  dedupeKey?: string;
}

const buildStorageKey = (userId: string) => `promatchai_notifications_${userId}`;

const emitNotificationUpdate = (userId: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('promatchai-notifications-updated', {
        detail: { userId },
      }),
    );
  }
};

export const readNotifications = (userId: string): AppNotification[] => {
  try {
    const stored = localStorage.getItem(buildStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading notifications:', error);
    return [];
  }
};

export const writeNotifications = (userId: string, notifications: AppNotification[]) => {
  try {
    localStorage.setItem(buildStorageKey(userId), JSON.stringify(notifications));
    emitNotificationUpdate(userId);
  } catch (error) {
    console.error('Error writing notifications:', error);
  }
};

export const addNotification = (
  userId: string | undefined,
  notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { dedupeKey?: string },
) => {
  if (!userId) return;

  const existingNotifications = readNotifications(userId);

  const filteredNotifications = notification.dedupeKey
    ? existingNotifications.filter((entry) => entry.dedupeKey !== notification.dedupeKey)
    : existingNotifications;

  const nextNotification: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    read: false,
    ...notification,
  };

  writeNotifications(userId, [nextNotification, ...filteredNotifications]);
};

export const addApplicationSubmittedNotification = (
  userId: string | undefined,
  jobTitle: string,
  companyName: string,
) => {
  addNotification(userId, {
    type: 'application_status',
    title: 'Application submitted',
    description: `Your application for ${jobTitle} at ${companyName} was submitted successfully.`,
    dedupeKey: `application-submitted-${jobTitle}-${companyName}`,
  });
};

export const addApplicationStatusNotification = (
  userId: string | undefined,
  status: string,
  jobTitle: string,
  companyName: string,
) => {
  const label =
    status === 'accepted'
      ? 'accepted'
      : status === 'rejected'
      ? 'rejected'
      : status === 'shortlisted'
      ? 'shortlisted'
      : status === 'interview_scheduled'
      ? 'moved to interview'
      : 'updated';

  addNotification(userId, {
    type: status === 'interview_scheduled' ? 'interview' : 'application_status',
    title: `Application ${label}`,
    description: `Your application for ${jobTitle} at ${companyName} was ${label}.`,
    dedupeKey: `application-status-${status}-${jobTitle}-${companyName}`,
  });
};

export const addShortlistNotification = (
  userId: string | undefined,
  jobTitle: string,
  companyName: string,
) => {
  addNotification(userId, {
    type: 'shortlist',
    title: 'You were shortlisted',
    description: `${companyName} saved your profile for ${jobTitle}.`,
    dedupeKey: `shortlisted-${jobTitle}-${companyName}`,
  });
};

export const addInterviewInvitationNotification = (
  userId: string | undefined,
  jobTitle: string,
  companyName: string,
) => {
  addNotification(userId, {
    type: 'interview',
    title: 'Interview invitation',
    description: `${companyName} invited you to continue for ${jobTitle}.`,
    dedupeKey: `interview-${jobTitle}-${companyName}`,
  });
};

export const addCourseCompletedNotification = (
  userId: string | undefined,
  courseTitle: string,
) => {
  addNotification(userId, {
    type: 'course',
    title: 'Course completed',
    description: `You completed ${courseTitle}. Your profile progress was updated.`,
    dedupeKey: `course-complete-${courseTitle}`,
  });
};
