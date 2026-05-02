import { useState } from 'react';
import { Mail, Send, Eye, Save, CheckCircle, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  enabled: boolean;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'application_received',
    name: 'Application Received',
    subject: 'We received your application for {{jobTitle}}',
    body: `Dear {{applicantName}},

Thank you for applying for the {{jobTitle}} position at {{company}}. We have received your application and our team is currently reviewing it.

We will get back to you within 5-7 business days regarding the next steps in our recruitment process.

If you have any questions in the meantime, please feel free to reach out to us.

Best regards,
{{company}} Recruitment Team`,
    enabled: true,
  },
  {
    id: 'shortlisted',
    name: 'Application Shortlisted',
    subject: 'Great news about your application for {{jobTitle}}',
    body: `Dear {{applicantName}},

Congratulations! We are pleased to inform you that your application for the {{jobTitle}} position has been shortlisted.

Our team was impressed with your qualifications and experience. We would like to move forward with your application to the next stage of our recruitment process.

You will receive further information about the interview process within the next 2-3 business days.

Best regards,
{{company}} Recruitment Team`,
    enabled: true,
  },
  {
    id: 'interview_scheduled',
    name: 'Interview Scheduled',
    subject: 'Interview scheduled for {{jobTitle}} position',
    body: `Dear {{applicantName}},

We are pleased to invite you for an interview for the {{jobTitle}} position at {{company}}.

Interview Details:
Date: {{interviewDate}}
Location: {{interviewLocation}}
Duration: Approximately 45-60 minutes

Please arrive 10 minutes early and bring:
- Valid ID
- Your resume (printed copy)
- Any relevant certificates or documents

If you need to reschedule or have any questions, please contact us as soon as possible.

We look forward to meeting you!

Best regards,
{{company}} Recruitment Team`,
    enabled: true,
  },
  {
    id: 'accepted',
    name: 'Application Accepted',
    subject: 'Congratulations! Offer for {{jobTitle}} position',
    body: `Dear {{applicantName}},

Congratulations! We are delighted to offer you the {{jobTitle}} position at {{company}}.

We were very impressed with your skills, experience, and enthusiasm during the interview process. We believe you will be a valuable addition to our team.

Next Steps:
1. Review the attached offer letter
2. Sign and return the acceptance form within 5 business days
3. Complete the onboarding paperwork

Your expected start date is {{startDate}}.

If you have any questions about the offer or the onboarding process, please don't hesitate to contact us.

Welcome to the team!

Best regards,
{{company}} Recruitment Team`,
    enabled: true,
  },
  {
    id: 'rejected',
    name: 'Application Not Selected',
    subject: 'Update on your application for {{jobTitle}}',
    body: `Dear {{applicantName}},

Thank you for taking the time to apply for the {{jobTitle}} position at {{company}} and for your interest in joining our team.

After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We were impressed with your background and encourage you to apply for future positions that match your skills and experience. We will keep your resume on file for consideration for other opportunities.

We wish you all the best in your job search and future endeavors.

Best regards,
{{company}} Recruitment Team`,
    enabled: true,
  },
];

export default function EmailAutomationSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const handleToggleTemplate = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      setEditingTemplate(null);
    }
  };

  const handleSendTestEmail = (template: EmailTemplate) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }
    // Simulate sending test email
    alert(`Test email sent to ${testEmail} using template: ${template.name}`);
  };

  const getPreviewWithVariables = (text: string) => {
    return text
      .replace(/{{applicantName}}/g, 'John Doe')
      .replace(/{{jobTitle}}/g, 'Software Developer')
      .replace(/{{company}}/g, 'ProMatchAI')
      .replace(/{{interviewDate}}/g, 'March 15, 2026 at 2:00 PM')
      .replace(/{{interviewLocation}}/g, 'Office Building, 123 Main St')
      .replace(/{{startDate}}/g, 'April 1, 2026');
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[26px] border border-[#D8E6F2] shadow-sm">
        <CardHeader className="space-y-4 bg-white">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#4667D8]">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xl leading-7 text-[#1C334A]">Email Automation Settings</CardTitle>
              <p className="mt-1 text-sm leading-6 text-[#688096]">
                Configure automated email notifications for applicants.
              </p>
            </div>
          </div>
          <Button className="w-full rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5F6D] text-white hover:from-[#F17B2D] hover:to-[#F04F60] sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </CardHeader>
      </Card>

      <Card className="rounded-[26px] border border-[#D8E6F2] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-[#1C334A]">Test Email Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email address for testing..."
              className="w-full flex-1 rounded-2xl border border-[#D4E2EE] bg-white px-4 py-3 text-sm focus:border-[#B8D1E9] focus:outline-none"
            />
            <Button variant="outline" className="w-full rounded-2xl border-[#D4E2EE] text-[#355E94] sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              Send Test
            </Button>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#7A8FA4]">
            Enter an email address to receive test emails with sample data
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`rounded-[26px] border border-[#D8E6F2] shadow-sm ${!template.enabled ? 'opacity-70' : ''}`}
          >
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Switch
                    checked={template.enabled}
                    onCheckedChange={() => handleToggleTemplate(template.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-[#1C334A]">{template.name}</h3>
                      {template.enabled ? (
                        <Badge className="border-0 bg-emerald-100 text-emerald-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#688096]">
                      Subject: {template.subject}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                    className="rounded-2xl border-[#D4E2EE] text-[#355E94]"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                    className="rounded-2xl border-[#D4E2EE] text-[#355E94]"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendTestEmail(template)}
                    disabled={!testEmail}
                    className="col-span-2 rounded-2xl border-[#D4E2EE] text-[#355E94] sm:col-span-1"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-[#F8FBFE] p-4">
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#4F667D]">
                  {template.body}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full border-[#D7E5F3] bg-white text-xs text-[#5B748B]">{'{{applicantName}}'}</Badge>
                <Badge variant="outline" className="rounded-full border-[#D7E5F3] bg-white text-xs text-[#5B748B]">{'{{jobTitle}}'}</Badge>
                <Badge variant="outline" className="rounded-full border-[#D7E5F3] bg-white text-xs text-[#5B748B]">{'{{company}}'}</Badge>
                {template.id === 'interview_scheduled' && (
                  <>
                    <Badge variant="outline" className="rounded-full border-[#D7E5F3] bg-white text-xs text-[#5B748B]">{'{{interviewDate}}'}</Badge>
                    <Badge variant="outline" className="rounded-full border-[#D7E5F3] bg-white text-xs text-[#5B748B]">{'{{interviewLocation}}'}</Badge>
                  </>
                )}
                {template.id === 'accepted' && (
                  <Badge variant="outline" className="rounded-full border-[#D7E5F3] bg-white text-xs text-[#5B748B]">{'{{startDate}}'}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(232,244,248,0.82)] p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#D7E6F2] bg-[#FCFEFF] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] border-b border-[#E3ECF4] bg-[#FCFEFF] px-6 py-4">
              <h2 className="text-gray-900 text-xl font-semibold">Edit Email Template</h2>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full rounded-2xl border border-[#D4E2EE] px-4 py-3 focus:border-[#B8D1E9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full rounded-2xl border border-[#D4E2EE] px-4 py-3 focus:border-[#B8D1E9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  rows={12}
                  className="w-full resize-none rounded-2xl border border-[#D4E2EE] px-4 py-3 font-mono text-sm focus:border-[#B8D1E9] focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-[#D9E7F4] bg-[#F7FBFE] p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Variables</h4>
                <div className="flex flex-wrap gap-2">
                  <code className="rounded-full bg-white px-3 py-1 text-xs">{'{{applicantName}}'}</code>
                  <code className="rounded-full bg-white px-3 py-1 text-xs">{'{{jobTitle}}'}</code>
                  <code className="rounded-full bg-white px-3 py-1 text-xs">{'{{company}}'}</code>
                  <code className="rounded-full bg-white px-3 py-1 text-xs">{'{{interviewDate}}'}</code>
                  <code className="rounded-full bg-white px-3 py-1 text-xs">{'{{interviewLocation}}'}</code>
                  <code className="rounded-full bg-white px-3 py-1 text-xs">{'{{startDate}}'}</code>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 rounded-b-[28px] border-t border-[#E3ECF4] bg-[#F7FBFE] px-6 py-4">
              <Button variant="outline" onClick={() => setEditingTemplate(null)} className="flex-1 rounded-2xl border-[#D4E2EE]">
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} className="flex-1 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5F6D] text-white hover:from-[#F17B2D] hover:to-[#F04F60]">
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Template Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(232,244,248,0.82)] p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#D7E6F2] bg-[#FCFEFF] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] border-b border-[#E3ECF4] bg-[#FCFEFF] px-6 py-4">
              <div>
                <h2 className="text-gray-900 text-xl font-semibold">Email Preview</h2>
                <p className="text-sm text-gray-600">{previewTemplate.name}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4 rounded-2xl border border-[#D8E6F2] bg-[#F8FBFE] p-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Subject:</div>
                  <div className="font-semibold text-gray-900">
                    {getPreviewWithVariables(previewTemplate.subject)}
                  </div>
                </div>
                <div className="border-t border-gray-300" />
                <div>
                  <div className="text-xs text-gray-500 mb-2">Message:</div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {getPreviewWithVariables(previewTemplate.body)}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[#F5DFAB] bg-[#FFF8E8] p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This preview shows sample data. Actual emails will use real applicant information.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 rounded-b-[28px] border-t border-[#E3ECF4] bg-[#F7FBFE] px-6 py-4">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)} className="w-full rounded-2xl border-[#D4E2EE]">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
