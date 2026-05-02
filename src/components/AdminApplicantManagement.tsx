import { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronDown, Download, Mail, Eye, 
  CheckCircle, XCircle, Star, Sparkles, FileText, Calendar,
  Award, TrendingUp, AlertCircle, Trash2
} from 'lucide-react';
import { ApplicationStatus } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import AdminApplicantProfile from './AdminApplicantProfile';
import { calculateAIMatchScore } from '../utils/aiMatching';

interface Application {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  userSkills?: string[];
  requiredSkills?: string[];
  introduction?: string;
}

interface AdminApplicantManagementProps {
  applications: Application[];
  users: any[];
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  onBulkStatusChange: (applicationIds: string[], newStatus: ApplicationStatus) => void;
  onSendNotification: (applicationIds: string[]) => void;
  onDeleteApplication: (application: Application) => void;
}

export default function AdminApplicantManagement({ 
  applications, 
  users,
  onStatusChange,
  onBulkStatusChange,
  onSendNotification,
  onDeleteApplication,
}: AdminApplicantManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'match' | 'name'>('date');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewingApplicant, setViewingApplicant] = useState<Application | null>(null);

  // Get unique positions
  const uniquePositions = Array.from(new Set(applications.map(app => app.jobTitle)));

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = 
        app.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesPosition = positionFilter === 'all' || app.jobTitle === positionFilter;
      
      return matchesSearch && matchesStatus && matchesPosition;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      } else if (sortBy === 'match') {
        const matchA = calculateAIMatchScore(a.userSkills || [], a.requiredSkills || []);
        const matchB = calculateAIMatchScore(b.userSkills || [], b.requiredSkills || []);
        return matchB - matchA;
      } else {
        return a.userName.localeCompare(b.userName);
      }
    });

  // Status counts
  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-blue-100 text-blue-700',
      shortlisted: 'bg-purple-100 text-purple-700',
      interview_scheduled: 'bg-teal-100 text-teal-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status];
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    const labels = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      shortlisted: 'Shortlisted',
      interview_scheduled: 'Interview',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };
    return labels[status];
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  const handleSelectApplication = (id: string) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(selectedApplications.filter(appId => appId !== id));
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  const handleBulkStatusChange = (newStatus: ApplicationStatus) => {
    onBulkStatusChange(selectedApplications, newStatus);
    setSelectedApplications([]);
    setShowBulkActions(false);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Position', 'Company', 'Status', 'Applied Date', 'Match Score'],
      ...filteredApplications.map(app => {
        const matchScore = calculateAIMatchScore(app.userSkills || [], app.requiredSkills || []);
        return [
          app.userName,
          app.userEmail,
          app.jobTitle,
          app.company,
          getStatusLabel(app.status),
          formatDate(app.appliedDate),
          `${matchScore}%`
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Get top recommended candidate
  const topCandidate = filteredApplications.length > 0 
    ? filteredApplications.reduce((top, current) => {
        const topMatch = calculateAIMatchScore(top.userSkills || [], top.requiredSkills || []);
        const currentMatch = calculateAIMatchScore(current.userSkills || [], current.requiredSkills || []);
        return currentMatch > topMatch ? current : top;
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            <p className="text-xs text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.under_review}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Shortlisted</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.shortlisted}</div>
            <p className="text-xs text-gray-600 mt-1">Top candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.accepted}</div>
            <p className="text-xs text-gray-600 mt-1">Successful matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Recommended Candidate Banner */}
      {topCandidate && calculateAIMatchScore(topCandidate.userSkills || [], topCandidate.requiredSkills || []) >= 80 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">Top Recommended Candidate</span>
                </div>
                <div className="text-gray-900 font-medium">
                  {topCandidate.userName} - {topCandidate.jobTitle}
                </div>
                <div className="text-sm text-gray-600">
                  {calculateAIMatchScore(topCandidate.userSkills || [], topCandidate.requiredSkills || [])}% AI Match Score
                </div>
              </div>
              <Button 
                onClick={() => setViewingApplicant(topCandidate)}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <div className="space-y-4">
        <div>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, position, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl border-[#D4E2EE]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="w-full gap-2 rounded-2xl border-[#D4E2EE] text-[#355E94] sm:w-auto"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {(statusFilter !== 'all' || positionFilter !== 'all') && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-30">
                    <div className="px-4 py-2 border-b">
                      <div className="text-sm font-semibold text-gray-700">Filter by Status</div>
                    </div>
                    {(['all', 'submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => { setStatusFilter(status); }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{status === 'all' ? 'All Applications' : getStatusLabel(status)}</span>
                          <span className="text-sm text-gray-500">({statusCounts[status as keyof typeof statusCounts]})</span>
                        </div>
                      </button>
                    ))}

                    <div className="px-4 py-2 border-t border-b mt-2">
                      <div className="text-sm font-semibold text-gray-700">Filter by Position</div>
                    </div>
                    <button
                      onClick={() => { setPositionFilter('all'); }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${positionFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      All Positions
                    </button>
                    {uniquePositions.map((position) => (
                      <button
                        key={position}
                        onClick={() => { setPositionFilter(position); }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${positionFilter === position ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                      >
                        {position}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'match' | 'name')}
                className="w-full rounded-2xl border border-[#D4E2EE] px-4 py-2.5 hover:border-[#BFD6F4] transition-colors sm:w-auto"
              >
                <option value="date">Sort by Date</option>
                <option value="match">Sort by Match Score</option>
                <option value="name">Sort by Name</option>
              </select>

              {/* Export CSV */}
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="w-full gap-2 rounded-2xl border-[#D4E2EE] text-[#355E94] sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(statusFilter !== 'all' || positionFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-gray-600">Active filters:</span>
              {statusFilter !== 'all' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="gap-2"
                >
                  Status: {getStatusLabel(statusFilter)}
                  <span>×</span>
                </Button>
              )}
              {positionFilter !== 'all' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPositionFilter('all')}
                  className="gap-2"
                >
                  Position: {positionFilter}
                  <span>×</span>
                </Button>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Bulk Actions Bar */}
          {selectedApplications.length > 0 && (
            <div className="mb-4 rounded-2xl border border-[#CFE0EF] bg-[#F5FAFE] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedApplications.length === filteredApplications.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium text-gray-900">
                    {selectedApplications.length} selected
                  </span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="gap-2 rounded-2xl border-[#D4E2EE]"
                  >
                    Change Status
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {showBulkActions && (
                    <div className="absolute mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => handleBulkStatusChange('under_review')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        Mark as Under Review
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('shortlisted')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('interview_scheduled')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('accepted')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('rejected')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendNotification(selectedApplications)}
                    className="gap-2 rounded-2xl border-[#D4E2EE]"
                  >
                    <Mail className="w-4 h-4" />
                    Send Notification
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 md:hidden">
            {filteredApplications.map((app) => {
              const matchScore = calculateAIMatchScore(app.userSkills || [], app.requiredSkills || []);
              const isTopCandidate = app.id === topCandidate?.id && matchScore >= 80;

              return (
                <div key={app.id} className="rounded-[28px] border border-[#D8E6F2] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start gap-3">
                    <Checkbox
                      checked={selectedApplications.includes(app.id)}
                      onCheckedChange={() => handleSelectApplication(app.id)}
                    />
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                      {app.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-medium text-gray-900">{app.userName}</div>
                        {isTopCandidate && <Award className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="truncate text-sm text-gray-500">{app.userEmail}</div>
                      <div className="mt-1 text-sm text-[#355E94]">{app.jobTitle}</div>
                      <div className="text-xs text-gray-500">{app.company}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingApplicant(app)}
                        className="rounded-xl"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteApplication(app)}
                        className="rounded-xl"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">AI Match</div>
                      <div className="mt-1 text-base font-medium text-gray-900">{matchScore}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Applied</div>
                      <div className="mt-1 text-sm text-gray-700">{formatDate(app.appliedDate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className={`mt-1 w-full rounded-full border-0 px-3 py-1 text-xs font-medium ${getStatusColor(app.status)}`}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview_scheduled">Interview</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-2.5 rounded-full ${
                        matchScore >= 80 ? 'bg-green-600' : matchScore >= 60 ? 'bg-yellow-600' : 'bg-orange-600'
                      }`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Applications Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">
                    <Checkbox 
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="pb-3 text-sm text-gray-600">Applicant</th>
                  <th className="pb-3 text-sm text-gray-600">Position</th>
                  <th className="pb-3 text-sm text-gray-600">AI Match</th>
                  <th className="pb-3 text-sm text-gray-600">Status</th>
                  <th className="pb-3 text-sm text-gray-600">Applied</th>
                  <th className="pb-3 text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => {
                  const matchScore = calculateAIMatchScore(app.userSkills || [], app.requiredSkills || []);
                  const isTopCandidate = app.id === topCandidate?.id && matchScore >= 80;

                  return (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <Checkbox 
                          checked={selectedApplications.includes(app.id)}
                          onCheckedChange={() => handleSelectApplication(app.id)}
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {app.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {app.userName}
                              {isTopCandidate && (
                                <Award className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{app.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{app.jobTitle}</div>
                        <div className="text-sm text-gray-500">{app.company}</div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[120px]">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  matchScore >= 80 ? 'bg-green-600' :
                                  matchScore >= 60 ? 'bg-yellow-600' :
                                  'bg-orange-600'
                                }`}
                                style={{ width: `${matchScore}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[45px]">
                            {matchScore}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <select
                          value={app.status}
                          onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(app.status)}`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview_scheduled">Interview</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {formatDate(app.appliedDate)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingApplicant(app)}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteApplication(app)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredApplications.length === 0 && (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No applications found</p>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Profile Modal */}
      {viewingApplicant && (
        <AdminApplicantProfile
          application={viewingApplicant}
          onClose={() => setViewingApplicant(null)}
          onStatusChange={(newStatus) => {
            onStatusChange(viewingApplicant.id, newStatus);
            setViewingApplicant(null);
          }}
        />
      )}
    </div>
  );
}
