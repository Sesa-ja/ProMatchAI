import { Plus, Edit, Trash2 } from 'lucide-react';
import { CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { AdminJob } from '../types/admin';

interface JobManagementPanelProps {
  jobs: AdminJob[];
  onAddJob: () => void;
  onEditJob: (job: AdminJob) => void;
  onDeleteJob: (job: AdminJob) => void;
}

export default function JobManagementPanel({
  jobs,
  onAddJob,
  onEditJob,
  onDeleteJob,
}: JobManagementPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>Job Management</CardTitle>
        <Button
          onClick={onAddJob}
          className="rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5F6D] text-white hover:from-[#F17B2D] hover:to-[#F04F60]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-[26px] border border-[#D8E6F2] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="mt-1 text-sm text-gray-500">{job.location}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                  {job.matchScore && <Badge variant="outline">{job.matchScore}% Match</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEditJob(job)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteJob(job)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className="py-8 text-center text-gray-500">No jobs found</p>}
      </div>
    </div>
  );
}
