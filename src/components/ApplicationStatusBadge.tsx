import { ApplicationStatus } from '../App';
import { Clock, Eye, Star, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus | string;
  translatedLabels: {
    submitted: string;
    under_review: string;
    shortlisted: string;
    interview_scheduled?: string;
    accepted: string;
    rejected: string;
  };
}

export default function ApplicationStatusBadge({ status, translatedLabels }: ApplicationStatusBadgeProps) {
  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      label: translatedLabels.submitted,
    },
    submitted: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      label: translatedLabels.submitted,
    },
    under_review: {
      icon: Eye,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      label: translatedLabels.under_review,
    },
    shortlisted: {
      icon: Star,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      label: translatedLabels.shortlisted,
    },
    interview_scheduled: {
      icon: Calendar,
      color: 'bg-teal-100 text-teal-700 border-teal-300',
      label: translatedLabels.interview_scheduled || 'Interview Scheduled',
    },
    accepted: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-300',
      label: translatedLabels.accepted,
    },
    rejected: {
      icon: XCircle,
      color: 'bg-red-100 text-red-700 border-red-300',
      label: translatedLabels.rejected,
    },
  };

  const config = statusConfig[status] || {
    icon: Clock,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    label: String(status || translatedLabels.submitted)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()),
  };
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
