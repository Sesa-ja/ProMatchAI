import { Sparkles, BookmarkPlus, BookmarkCheck, Eye } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import type { AdminJob, AdminUser, CandidateRecommendation } from '../types/admin';

interface RecommendedCandidatesPanelProps {
  jobs: AdminJob[];
  selectedRecommendationJobId: string;
  onJobChange: (jobId: string) => void;
  recommendedCandidates: CandidateRecommendation[];
  shortlistedCandidateIds: string[];
  onToggleShortlist: (recommendation: CandidateRecommendation) => void;
  onViewProfile: (candidate: AdminUser) => void;
}

export default function RecommendedCandidatesPanel({
  jobs,
  selectedRecommendationJobId,
  onJobChange,
  recommendedCandidates,
  shortlistedCandidateIds,
  onToggleShortlist,
  onViewProfile,
}: RecommendedCandidatesPanelProps) {
  return (
    <Card className="mt-4 rounded-[26px] border border-[#D8E6F2] shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <select
              value={selectedRecommendationJobId || jobs[0]?.id || ''}
              onChange={(e) => onJobChange(e.target.value)}
              className="h-11 w-full min-w-0 rounded-lg border border-gray-200 px-4 py-2 text-sm sm:min-w-[260px]"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        {recommendedCandidates.length > 0 ? (
          <div className="mt-4">
            {recommendedCandidates.map((recommendation) => {
              const candidate = recommendation.candidate;
              const score = Math.round((recommendation.score || 0) * 100);
              const isShortlisted = shortlistedCandidateIds.includes(candidate.id);
              const explanations = recommendation.breakdown?.explanations || [];

              return (
                <div
                  key={candidate.id}
                  className="relative border-b border-dashed border-[#DCE7F0] px-1 py-5 last:border-b-0"
                >
                  <span className="absolute left-0 top-8 h-2.5 w-2.5 rounded-full bg-[#C8D9E8]" />
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 pl-5">
                      <h3 className="text-[22px] leading-tight text-[#183B56]">{candidate.name}</h3>
                      <p className="mt-1 text-sm text-[#617A91]">{candidate.location || 'Location not specified'}</p>
                      <p className="mt-2 text-sm leading-6 text-[#567089]">
                        {(candidate.skills || []).slice(0, 4).join(', ') || 'Profile skills pending'}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[34px] leading-none text-[#2E63C3]">{score}%</div>
                      <div className="mt-1 text-xs text-[#6E8498]">Reciprocal match</div>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    {explanations.map((explanation: string, index: number) => (
                      <div
                        key={index}
                        className="rounded-xl bg-[#FAF7FF] px-3 py-2 text-xs leading-5 text-[#7B49BD]"
                      >
                        {explanation}
                      </div>
                    ))}
                    {explanations.length === 0 && (
                      <div className="rounded-xl bg-[#F8FBFD] px-3 py-2 text-xs leading-5 text-[#617A91]">
                        Potential fit based on structured profile alignment.
                      </div>
                    )}
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-[#506A81]">
                    <div>Skills: {Math.round((recommendation.breakdown?.componentScores?.skills || 0) * 100)}%</div>
                    <div>Language: {Math.round((recommendation.breakdown?.componentScores?.language || 0) * 100)}%</div>
                    <div>Experience: {Math.round((recommendation.breakdown?.componentScores?.experienceTraining || 0) * 100)}%</div>
                    <div>Location: {Math.round((recommendation.breakdown?.componentScores?.location || 0) * 100)}%</div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      variant={isShortlisted ? 'secondary' : 'default'}
                      onClick={() => onToggleShortlist(recommendation)}
                      className={
                        isShortlisted
                          ? 'h-9 w-full rounded-full border border-[#D7E6F3] bg-[#F4F8FC] px-3 text-xs text-[#355975] hover:bg-[#EDF4FA]'
                          : 'h-9 w-full rounded-full bg-[#2E63C3] px-3 text-xs text-white hover:bg-[#2454AA]'
                      }
                    >
                      {isShortlisted ? (
                        <>
                          <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" />
                          Shortlisted
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />
                          Save Candidate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onViewProfile(candidate)}
                      className="h-9 w-full rounded-full border-[#D7E6F3] px-3 text-xs text-[#274866] hover:bg-[#F7FAFD]"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View Profile
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No recommended candidates yet. Add richer refugee profiles and active jobs to generate matches.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
