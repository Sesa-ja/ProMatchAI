import { useState } from 'react';
import { 
  X, Award, Briefcase, GraduationCap, MapPin, Mail, Phone, 
  FileText, Star, TrendingUp, MessageSquare, Save, Sparkles,
  CheckCircle, Calendar
} from 'lucide-react';
import { ApplicationStatus } from '../App';
import { calculateAIMatchScore, calculateAIMatchDetails } from '../utils/aiMatching';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface AdminApplicantProfileProps {
  application: {
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
  };
  onClose: () => void;
  onStatusChange: (newStatus: ApplicationStatus) => void;
}

export default function AdminApplicantProfile({ application, onClose, onStatusChange }: AdminApplicantProfileProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [recruiterMessage, setRecruiterMessage] = useState('');

  const matchScore = calculateAIMatchScore(application.userSkills || [], application.requiredSkills || []);
  const matchDetails = calculateAIMatchDetails(
    application.userSkills || [],
    application.requiredSkills || [],
    'en'
  );

  const userSkills = application.userSkills || [];
  const requiredSkills = application.requiredSkills || [];
  const matchingSkills = userSkills.filter(skill => 
    requiredSkills.some(reqSkill => 
      reqSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(reqSkill.toLowerCase())
    )
  );
  const missingSkills = requiredSkills.filter(reqSkill => 
    !userSkills.some(skill => 
      reqSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(reqSkill.toLowerCase())
    )
  );

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      under_review: 'bg-blue-100 text-blue-700 border-blue-300',
      shortlisted: 'bg-purple-100 text-purple-700 border-purple-300',
      interview_scheduled: 'bg-teal-100 text-teal-700 border-teal-300',
      accepted: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status];
  };

  const handleSave = () => {
    onStatusChange(status);
    // In a real app, also save notes, interview date, and recruiter message
    console.log('Saving:', { status, notes, interviewDate, recruiterMessage });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-gray-900 text-xl font-semibold">Applicant Profile</h2>
            <p className="text-sm text-gray-600">{application.jobTitle} at {application.company}</p>
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
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Applicant Info */}
            <div className="col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                    {application.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 text-xl font-semibold mb-1">{application.userName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{application.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{application.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Applied on {formatDate(application.appliedDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Match Score */}
              <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h4 className="text-gray-900 font-semibold">AI Match Analysis</h4>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">Overall Match Score</span>
                    <span className="text-2xl font-bold text-gray-900">{matchScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        matchScore >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                        matchScore >= 60 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                        'bg-gradient-to-r from-orange-600 to-red-600'
                      }`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={matchDetails.confidence === 'high' ? 'default' : 'secondary'}>
                      {matchDetails.confidenceLabel}
                    </Badge>
                    {matchScore >= 80 && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Award className="w-3 h-3 mr-1" />
                        Top Candidate
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Matching Skills ({matchingSkills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchingSkills.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {missingSkills.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Skills to Develop ({missingSkills.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {missingSkills.map((skill, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Recommendations */}
                {matchDetails.reasons.length > 0 && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-900 mb-2">AI Recommendations</div>
                    <ul className="space-y-1">
                      {matchDetails.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Introduction */}
              {application.introduction && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    Applicant's Introduction
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.introduction}</p>
                </div>
              )}

              {/* Resume Preview */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Resume Preview
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Resume preview not available</p>
                    <Button variant="outline" className="mt-3" size="sm">
                      View Full Resume
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Notes */}
            <div className="col-span-1 space-y-6">
              {/* Status Management */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-gray-900 font-semibold mb-4">Application Status</h4>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className={`w-full px-4 py-3 rounded-lg border-2 font-medium ${getStatusColor(status)} cursor-pointer`}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Interview Date (show when status is interview_scheduled) */}
                {status === 'interview_scheduled' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Recruiter Message */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-gray-900 font-semibold mb-3">Message to Applicant</h4>
                <textarea
                  value={recruiterMessage}
                  onChange={(e) => setRecruiterMessage(e.target.value)}
                  placeholder="Write a message to the applicant..."
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm resize-none"
                />
                <Button className="w-full mt-3" variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>

              {/* Internal Notes */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-gray-900 font-semibold mb-3">Internal Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this applicant..."
                  rows={6}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  These notes are only visible to administrators
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-gray-900 font-semibold mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Applicant
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
