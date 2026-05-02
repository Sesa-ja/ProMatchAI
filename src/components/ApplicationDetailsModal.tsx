import { useState } from 'react';
import { X, CheckCircle2, Clock, AlertCircle, Calendar, FileText, MessageSquare, History } from 'lucide-react';
import { Application, ApplicationStatus } from '../App';
import { getTranslation } from '../utils/translations';

interface ApplicationDetailsModalProps {
  application: Application & {
    interviewDate?: string;
    recruiterMessage?: string;
    activityHistory?: Array<{ date: string; action: string; note?: string }>;
    requiredDocuments?: Array<{ name: string; uploaded: boolean }>;
  };
  onClose: () => void;
  language: string;
}

const statusSteps: ApplicationStatus[] = ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted'];

export default function ApplicationDetailsModal({ application, onClose, language }: ApplicationDetailsModalProps) {
  const t = getTranslation(language as any);
  
  const getCurrentStepIndex = () => {
    if (application.status === 'rejected') return -1;
    if (application.status === 'interview_scheduled') return 3;
    return statusSteps.indexOf(application.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return t.statusSubmitted;
      case 'under_review': return t.statusUnderReview;
      case 'shortlisted': return t.statusShortlisted;
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'accepted': return t.statusAccepted;
      case 'rejected': return t.statusRejected;
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-gray-900 text-xl font-semibold">{application.jobTitle}</h2>
            <p className="text-sm text-gray-600">{application.company} • {application.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Application Status Progress */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-gray-900 font-medium mb-4">Application Progress</h3>
            
            {application.status === 'rejected' ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <div className="text-red-900 font-medium">Application Not Selected</div>
                  <p className="text-sm text-red-700 mt-1">
                    Thank you for your interest. We encourage you to apply for other positions that match your skills.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
                
                {/* Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step} className="flex flex-col items-center" style={{ width: '20%' }}>
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all z-10 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg' 
                              : 'bg-white border-2 border-gray-300 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div className={`text-xs text-center px-1 ${isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {getStatusLabel(step)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interview Date */}
          {application.interviewDate && (
            <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-teal-900 font-medium mb-1">Interview Scheduled</h4>
                  <p className="text-teal-700 text-sm">
                    {formatDate(application.interviewDate)}
                  </p>
                  <p className="text-teal-600 text-xs mt-2">
                    Please arrive 10 minutes early and bring your ID and any required documents.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Required Documents */}
          {application.requiredDocuments && application.requiredDocuments.length > 0 && (
            <div>
              <h4 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Required Documents
              </h4>
              <div className="space-y-2">
                {application.requiredDocuments.map((doc, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        doc.uploaded ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        {doc.uploaded ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <span className="text-gray-900">{doc.name}</span>
                    </div>
                    {doc.uploaded ? (
                      <span className="text-sm text-green-600 font-medium">Uploaded</span>
                    ) : (
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter Message */}
          {application.recruiterMessage && (
            <div>
              <h4 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                Message from Recruiter
              </h4>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {application.recruiterMessage}
                </p>
              </div>
            </div>
          )}

          {/* Application Details */}
          <div>
            <h4 className="text-gray-900 font-medium mb-3">Application Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Applied On:</span>
                <span className="text-gray-900 font-medium">{formatDate(application.appliedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                  application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                  application.status === 'interview_scheduled' ? 'bg-teal-100 text-teal-800' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>
              {application.introduction && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600 block mb-2">Your Introduction:</span>
                  <p className="text-gray-700 text-sm">{application.introduction}</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity History */}
          {application.activityHistory && application.activityHistory.length > 0 && (
            <div>
              <h4 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-600" />
                Activity History
              </h4>
              <div className="space-y-3">
                {application.activityHistory.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      {index < application.activityHistory!.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 flex-1 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-gray-900 font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-500">{formatDate(activity.date)}</div>
                      {activity.note && (
                        <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          {application.status !== 'rejected' && application.status !== 'accepted' && (
            <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Contact Recruiter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
