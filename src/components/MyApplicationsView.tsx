import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Search, Filter, ChevronDown } from 'lucide-react';
import { Application, ApplicationStatus, UserProfile } from '../App';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import { getTranslation } from '../utils/translations';

interface MyApplicationsViewProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export default function MyApplicationsView({ userProfile, onBack }: MyApplicationsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const t = getTranslation(userProfile.language);
  const applications = userProfile.applications || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by date (most recent first)
  const sortedApplications = [...filteredApplications].sort((a, b) => 
    new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  );

  // Count by status
  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#E8F4F8] pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-gray-900 text-2xl font-bold">My Applications</h1>
              <p className="text-gray-600 text-sm">
                {applications.length} total {applications.length === 1 ? 'application' : 'applications'}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors bg-white"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Filter</span>
                {statusFilter !== 'all' && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-30">
                  <button
                    onClick={() => { setStatusFilter('all'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Applications</span>
                      <span className="text-sm text-gray-500">({statusCounts.all})</span>
                    </div>
                  </button>
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    onClick={() => { setStatusFilter('submitted'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'submitted' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Submitted</span>
                      <span className="text-sm text-gray-500">({statusCounts.submitted})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setStatusFilter('under_review'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'under_review' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Under Review</span>
                      <span className="text-sm text-gray-500">({statusCounts.under_review})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setStatusFilter('shortlisted'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'shortlisted' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Shortlisted</span>
                      <span className="text-sm text-gray-500">({statusCounts.shortlisted})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setStatusFilter('interview_scheduled'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'interview_scheduled' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Interview Scheduled</span>
                      <span className="text-sm text-gray-500">({statusCounts.interview_scheduled})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setStatusFilter('accepted'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'accepted' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Accepted</span>
                      <span className="text-sm text-gray-500">({statusCounts.accepted})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setStatusFilter('rejected'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'rejected' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Rejected</span>
                      <span className="text-sm text-gray-500">({statusCounts.rejected})</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Indicator */}
          {statusFilter !== 'all' && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtered by:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                <span>{statusFilter.replace('_', ' ').charAt(0).toUpperCase() + statusFilter.slice(1).replace('_', ' ')}</span>
                <span className="text-blue-500">×</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {sortedApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-gray-900 text-xl font-semibold mb-2">
              {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
            </h3>
            <p className="text-gray-600 mb-6">
              {applications.length === 0 
                ? 'Start exploring jobs and submit your first application!'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {applications.length === 0 && (
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                onClick={() => setSelectedApplication(app)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 text-lg font-semibold mb-1 truncate">
                        {app.jobTitle}
                      </h3>
                      <p className="text-gray-700 mb-1">{app.company}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
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
                        interview_scheduled: 'Interview Scheduled',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{t.appliedOn} {formatDate(app.appliedDate)}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          language={userProfile.language}
        />
      )}
    </div>
  );
}
