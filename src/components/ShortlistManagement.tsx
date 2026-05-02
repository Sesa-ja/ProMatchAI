import { Search, Download, BookmarkCheck, Calendar, Mail, Eye, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { AdminJob, AdminUser, ShortlistRecord } from '../types/admin';

interface ShortlistManagementProps {
  shortlistRecords: ShortlistRecord[];
  filteredShortlistRecords: ShortlistRecord[];
  shortlistSearchTerm: string;
  setShortlistSearchTerm: (value: string) => void;
  shortlistOpportunityFilter: string;
  setShortlistOpportunityFilter: (value: string) => void;
  shortlistSortOrder: 'newest' | 'oldest';
  setShortlistSortOrder: (value: 'newest' | 'oldest') => void;
  jobs: AdminJob[];
  users: AdminUser[];
  exportShortlistsCsv: () => void;
  openInviteDialog: (record: ShortlistRecord, candidate?: AdminUser, opportunity?: AdminJob) => void;
  contactCandidate: (record: ShortlistRecord, candidate?: AdminUser, opportunity?: AdminJob) => void;
  openCandidateProfile: (candidate?: AdminUser) => void;
  removeShortlistRecord: (record: ShortlistRecord) => void;
}

export default function ShortlistManagement({
  shortlistRecords,
  filteredShortlistRecords,
  shortlistSearchTerm,
  setShortlistSearchTerm,
  shortlistOpportunityFilter,
  setShortlistOpportunityFilter,
  shortlistSortOrder,
  setShortlistSortOrder,
  jobs,
  users,
  exportShortlistsCsv,
  openInviteDialog,
  contactCandidate,
  openCandidateProfile,
  removeShortlistRecord,
}: ShortlistManagementProps) {
  return (
    <Card className="overflow-hidden rounded-[24px] border border-[#D9E6F2] shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Saved Candidates</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Review all shortlisted refugees across your opportunities in one place.
              </p>
            </div>
            <Badge variant="secondary" className="w-fit self-start sm:self-auto">
              {shortlistRecords.length} saved
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px_auto] md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={shortlistSearchTerm}
                onChange={(e) => setShortlistSearchTerm(e.target.value)}
                placeholder="Search by candidate, opportunity, company, or skill..."
                className="h-11 pl-10"
              />
            </div>
            <select
              value={shortlistOpportunityFilter}
              onChange={(e) => setShortlistOpportunityFilter(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
            >
              <option value="all">All opportunities</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
            <select
              value={shortlistSortOrder}
              onChange={(e) => setShortlistSortOrder(e.target.value as 'newest' | 'oldest')}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={exportShortlistsCsv}
              disabled={filteredShortlistRecords.length === 0}
              className="h-11 w-full md:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {(shortlistSearchTerm || shortlistOpportunityFilter !== 'all') && (
            <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center">
              <span>{filteredShortlistRecords.length} result(s)</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShortlistSearchTerm('');
                  setShortlistOpportunityFilter('all');
                  setShortlistSortOrder('newest');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredShortlistRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredShortlistRecords.map((record) => {
              const candidate = users.find((user) => String(user.id) === String(record.candidateId));
              const opportunity = jobs.find((job) => String(job.id) === String(record.opportunityId));

              return (
                <div key={record.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <BookmarkCheck className="w-4 h-4 text-blue-600" />
                        <h3 className="truncate text-gray-900">{record.candidateName || candidate?.name || 'Candidate'}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Saved for: {record.opportunityTitle || opportunity?.title || 'Opportunity'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Company: {record.companyName || opportunity?.company || 'Company'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Location: {candidate?.location || 'Location not specified'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Skills: {(candidate?.skills || []).slice(0, 5).join(', ') || 'No skills listed'}
                      </p>
                      <p className="text-xs text-gray-400 mt-3">
                        Saved on {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                      {record.invitationStatus === 'interview_scheduled' && (
                        <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                          Interview invited
                          {record.invitedAt ? ` on ${new Date(record.invitedAt).toLocaleDateString()}` : ''}
                          {record.invitationNote ? `: ${record.invitationNote}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[360px]">
                      <Button
                        variant="outline"
                        onClick={() => openInviteDialog(record, candidate, opportunity)}
                        className="h-10 w-full justify-center border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Invite to Interview
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => contactCandidate(record, candidate, opportunity)}
                        className="h-10 w-full justify-center"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openCandidateProfile(candidate)}
                        disabled={!candidate}
                        className="h-10 w-full justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => removeShortlistRecord(record)}
                        className="h-10 w-full justify-center border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {shortlistRecords.length > 0
              ? 'No shortlist entries match the current filters.'
              : 'No saved candidates yet. Use the recommendation cards to shortlist refugees.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
