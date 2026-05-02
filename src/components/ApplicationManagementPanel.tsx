import { Check, Download, Eye, FileText, Trash2, X } from 'lucide-react';
import { CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { AdminApplication } from '../types/admin';

interface ApplicationManagementPanelProps {
  applications: AdminApplication[];
  onViewUserProfile: (userId: string) => void;
  onOpenConfirmation: (
    title: string,
    description: string,
    action: () => Promise<void> | void,
  ) => void;
  onApplicationDecision: (application: AdminApplication, status: 'accepted' | 'rejected') => Promise<void>;
  onContactApplicant: () => void;
  onDeleteApplication: (application: AdminApplication) => void;
}

export default function ApplicationManagementPanel({
  applications,
  onViewUserProfile,
  onOpenConfirmation,
  onApplicationDecision,
  onContactApplicant,
  onDeleteApplication,
}: ApplicationManagementPanelProps) {
  const downloadFile = (href: string, filename: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div>
        <CardTitle>Application Management</CardTitle>
      </div>
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="rounded-[28px] border border-[#D8E6F2] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-gray-900">{app.userName || 'Unknown User'}</h3>
                  <Badge
                    variant={
                      app.status === 'pending'
                        ? 'secondary'
                        : app.status === 'accepted'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
                <p className="mb-1 text-sm text-gray-600">
                  Applied for: <span className="text-gray-900">{app.jobTitle || 'Unknown Job'}</span>
                </p>
                <p className="mb-1 text-sm text-gray-600">
                  Company: {app.company || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(app.createdAt).toLocaleDateString()}
                </p>
                {app.userEmail && (
                  <p className="mt-1 text-sm text-gray-600">
                    Email: {app.userEmail}
                  </p>
                )}
              </div>
            </div>

            {app.introduction && (
              <div className="mb-4 rounded-2xl border border-[#D8E6F2] bg-[#F7FBFE] p-4">
                <h4 className="mb-2 text-sm text-gray-700">Introduction</h4>
                <p className="text-sm text-gray-600">{app.introduction}</p>
              </div>
            )}

            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={() => onViewUserProfile(app.userId)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#EEF4FF] px-4 py-3 text-[#355E94] transition-colors hover:bg-[#E3EEFC]"
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm">View Full Profile/CV</span>
              </button>

              {app.cv && (
                <button
                  onClick={() => downloadFile(app.cv, app.cvFileName || `${app.userName}_CV.pdf`)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#F5F8FC] px-4 py-3 text-[#355E94] transition-colors hover:bg-[#EBF1F7]"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Download CV</span>
                </button>
              )}

              {app.coverLetterFile && (
                <button
                  onClick={() =>
                    downloadFile(
                      app.coverLetterFile,
                      app.coverLetterFileName || `${app.userName}_CoverLetter.pdf`,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#F5F8FC] px-4 py-3 text-[#355E94] transition-colors hover:bg-[#EBF1F7]"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Download Cover Letter</span>
                </button>
              )}
            </div>

            {app.coverLetter && (
              <div className="mb-4 rounded-2xl border border-[#E6EEF5] bg-[#F8FBFE] p-4">
                <h4 className="mb-2 text-sm text-gray-700">Cover Letter</h4>
                <p className="whitespace-pre-wrap text-sm text-gray-600">{app.coverLetter}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-[#E6EEF5] pt-4 sm:flex sm:flex-wrap">
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  onOpenConfirmation(
                    'Accept Application',
                    `Accept ${app.userName || 'this applicant'} for ${app.jobTitle || 'this position'}?`,
                    () => onApplicationDecision(app, 'accepted'),
                  )
                }
                disabled={app.status === 'accepted'}
                className="rounded-2xl bg-[#18A96B] hover:bg-[#14935D]"
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  onOpenConfirmation(
                    'Reject Application',
                    `Reject ${app.userName || 'this applicant'} for ${app.jobTitle || 'this position'}?`,
                    () => onApplicationDecision(app, 'rejected'),
                  )
                }
                disabled={app.status === 'rejected'}
                className="rounded-2xl"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              {app.status === 'pending' && (
                <Button variant="outline" size="sm" onClick={onContactApplicant} className="rounded-2xl border-[#D4E2EE] text-[#355E94]">
                  <FileText className="mr-2 h-4 w-4" />
                  Contact Applicant
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteApplication(app)}
                className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p>No applications found</p>
            <p className="mt-1 text-sm">Applications will appear here when students apply for jobs</p>
          </div>
        )}
      </div>
    </div>
  );
}
