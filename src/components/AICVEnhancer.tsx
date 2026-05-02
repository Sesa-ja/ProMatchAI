import { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, AlertCircle, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Education, Experience } from '../App';

interface AICVEnhancerProps {
  open: boolean;
  onClose: () => void;
  onApply: (education: Education[], experience: Experience[]) => void;
}

const informalExamples = [
  {
    informal: "I studied computer science at University of Kyrgyzstan from 2018 to 2022. I also worked at a restaurant as a waiter for 2 years while studying.",
    description: "This will generate both education and work experience entries"
  },
  {
    informal: "I went to high school in Syria until 2020. After that I helped in my family's bakery for a year and then worked as a driver for a delivery company.",
    description: "Multiple work experiences with education background"
  },
  {
    informal: "I have a bachelor's degree in engineering from Damascus University. I worked as a civil engineer for 3 years building roads and bridges.",
    description: "Professional experience with university education"
  },
];

export default function AICVEnhancer({ open, onClose, onApply }: AICVEnhancerProps) {
  const [informalText, setInformalText] = useState('');
  const [generatedEducation, setGeneratedEducation] = useState<Education[]>([]);
  const [generatedExperience, setGeneratedExperience] = useState<Experience[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const parseAndGenerateCV = (prompt: string): { education: Education[], experience: Experience[] } => {
    const lower = prompt.toLowerCase();
    const education: Education[] = [];
    const experience: Experience[] = [];
    
    // Education Detection
    // University/College
    if (lower.includes('university') || lower.includes('college') || lower.includes('bachelor') || lower.includes('master') || lower.includes('degree')) {
      const universityMatch = prompt.match(/(?:studied|degree|bachelor|master).*?(?:at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:University|College|Institute))?)/i);
      const schoolName = universityMatch ? universityMatch[1] : 'University';
      
      let degree = 'Bachelor\'s Degree';
      let field = 'General Studies';
      
      if (lower.includes('master')) degree = 'Master\'s Degree';
      if (lower.includes('phd') || lower.includes('doctorate')) degree = 'Ph.D.';
      
      if (lower.includes('computer') || lower.includes('it') || lower.includes('software')) field = 'Computer Science';
      else if (lower.includes('engineer')) field = 'Engineering';
      else if (lower.includes('business') || lower.includes('management')) field = 'Business Administration';
      else if (lower.includes('medicine') || lower.includes('medical')) field = 'Medicine';
      else if (lower.includes('law')) field = 'Law';
      else if (lower.includes('education') || lower.includes('teach')) field = 'Education';
      else if (lower.includes('arts') || lower.includes('design')) field = 'Arts & Design';
      
      const yearMatch = prompt.match(/(\d{4})\s*(?:to|-|until)\s*(\d{4})/);
      const startYear = yearMatch ? yearMatch[1] : '2018';
      const endYear = yearMatch ? yearMatch[2] : '2022';
      
      education.push({
        school: schoolName,
        degree: degree,
        field: field,
        startYear: startYear,
        endYear: endYear
      });
    }
    
    // High School
    if (lower.includes('high school') || lower.includes('secondary school')) {
      const yearMatch = prompt.match(/(?:high school|secondary).*?(\d{4})/i);
      const endYear = yearMatch ? yearMatch[1] : '2020';
      
      education.push({
        school: 'High School',
        degree: 'High School Diploma',
        field: 'General Education',
        startYear: String(parseInt(endYear) - 4),
        endYear: endYear
      });
    }
    
    // Experience Detection
    // Restaurant/Food Service
    if (lower.includes('restaurant') || lower.includes('waiter') || lower.includes('server') || lower.includes('cook') || lower.includes('chef') || lower.includes('bakery')) {
      let position = 'Food Service Professional';
      if (lower.includes('waiter') || lower.includes('server')) position = 'Waiter/Server';
      else if (lower.includes('cook') || lower.includes('chef')) position = 'Cook';
      else if (lower.includes('bakery')) position = 'Baker';
      
      const company = 'Food Service Establishment';
      const durationMatch = prompt.match(/(\d+)\s*year/i);
      const years = durationMatch ? parseInt(durationMatch[1]) : 2;
      
      experience.push({
        company: company,
        position: position,
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - years),
        endDate: 'Present',
        description: 'Provided excellent customer service in a high-volume dining environment, prepared quality meals following health and safety standards, and maintained professional relationships with diverse clientele while working efficiently under pressure.'
      });
    }
    
    // Driver/Delivery
    if (lower.includes('driv') || lower.includes('deliver')) {
      const durationMatch = prompt.match(/(\d+)\s*year/i);
      const years = durationMatch ? parseInt(durationMatch[1]) : 1;
      
      experience.push({
        company: 'Delivery Service Company',
        position: 'Professional Driver',
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - years),
        endDate: 'Present',
        description: 'Safely transported goods and passengers while maintaining excellent driving records, managed route optimization and time management, and ensured compliance with all traffic regulations and safety protocols.'
      });
    }
    
    // Engineering
    if (lower.includes('engineer') && (lower.includes('work') || lower.includes('job'))) {
      const durationMatch = prompt.match(/(\d+)\s*year/i);
      const years = durationMatch ? parseInt(durationMatch[1]) : 3;
      
      let position = 'Engineer';
      if (lower.includes('civil')) position = 'Civil Engineer';
      else if (lower.includes('software') || lower.includes('computer')) position = 'Software Engineer';
      else if (lower.includes('mechanical')) position = 'Mechanical Engineer';
      else if (lower.includes('electrical')) position = 'Electrical Engineer';
      
      experience.push({
        company: 'Engineering Firm',
        position: position,
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - years),
        endDate: String(new Date().getFullYear() - 1),
        description: 'Applied technical knowledge and engineering principles to design and implement infrastructure projects, collaborated with multidisciplinary teams, and ensured compliance with safety standards and building codes while delivering high-quality results.'
      });
    }
    
    // Retail/Shop
    if (lower.includes('shop') || lower.includes('store') || lower.includes('retail') || lower.includes('cashier')) {
      const durationMatch = prompt.match(/(\d+)\s*year/i);
      const years = durationMatch ? parseInt(durationMatch[1]) : 2;
      
      experience.push({
        company: 'Retail Store',
        position: 'Retail Sales Associate',
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - years),
        endDate: 'Present',
        description: 'Delivered outstanding customer service in a dynamic retail environment, processed transactions accurately, maintained organized product displays, and contributed to achieving sales targets through effective customer engagement.'
      });
    }
    
    // Construction
    if (lower.includes('construction') || lower.includes('build')) {
      const durationMatch = prompt.match(/(\d+)\s*year/i);
      const years = durationMatch ? parseInt(durationMatch[1]) : 2;
      
      experience.push({
        company: 'Construction Company',
        position: 'Construction Worker',
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - years),
        endDate: 'Present',
        description: 'Applied technical knowledge and practical skills to complete construction projects, demonstrated strong problem-solving abilities, and maintained high safety and quality standards while working independently and as part of a team.'
      });
    }
    
    // Teaching/Tutoring
    if (lower.includes('teach') || lower.includes('tutor') || lower.includes('instructor')) {
      const durationMatch = prompt.match(/(\d+)\s*year/i);
      const years = durationMatch ? parseInt(durationMatch[1]) : 2;
      
      experience.push({
        company: 'Educational Institution',
        position: 'Teacher/Instructor',
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - years),
        endDate: 'Present',
        description: 'Designed and delivered engaging lessons to diverse student populations, assessed student progress and provided constructive feedback, and created a positive learning environment that fostered academic growth and personal development.'
      });
    }
    
    // Healthcare
    if (lower.includes('nurse') || lower.includes('hospital') || lower.includes('clinic') || lower.includes('medical')) {
      const durationMatch = prompt.match(/(\d+)\s*year/i);
      const years = durationMatch ? parseInt(durationMatch[1]) : 2;
      
      experience.push({
        company: 'Healthcare Facility',
        position: 'Healthcare Professional',
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - years),
        endDate: 'Present',
        description: 'Provided compassionate care and support to patients, maintained detailed records and documentation, and collaborated with healthcare teams to ensure optimal patient outcomes and satisfaction.'
      });
    }
    
    // If no specific matches, create a general experience
    if (experience.length === 0 && (lower.includes('work') || lower.includes('job') || lower.includes('help'))) {
      experience.push({
        company: 'Previous Employer',
        position: 'Professional',
        location: 'Local Area',
        startDate: String(new Date().getFullYear() - 2),
        endDate: 'Present',
        description: 'Successfully performed assigned responsibilities with dedication and attention to detail, demonstrated strong work ethic and reliability, and contributed positively to team objectives while developing valuable transferable skills in a professional environment.'
      });
    }
    
    return { education, experience };
  };

  const handleGenerate = () => {
    if (!informalText.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const result = parseAndGenerateCV(informalText);
      setGeneratedEducation(result.education);
      setGeneratedExperience(result.experience);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    const text = [
      '=== EDUCATION ===',
      ...generatedEducation.map(edu => 
        `${edu.degree} in ${edu.field}\n${edu.school}\n${edu.startYear} - ${edu.endYear}`
      ),
      '\n=== EXPERIENCE ===',
      ...generatedExperience.map(exp => 
        `${exp.position} at ${exp.company}\n${exp.startDate} - ${exp.endDate}\n${exp.description}`
      )
    ].join('\n\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApply(generatedEducation, generatedExperience);
    onClose();
  };

  const handleUseExample = (example: typeof informalExamples[0]) => {
    setInformalText(example.informal);
  };

  const handleClose = () => {
    setInformalText('');
    setGeneratedEducation([]);
    setGeneratedExperience([]);
    onClose();
  };

  const hasResults = generatedEducation.length > 0 || generatedExperience.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 bg-white p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-slate-900">
                AI CV Enhancement
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-slate-600">
                Describe your education and work experience in your own words, and AI will turn it into clearer,
                structured CV entries you can review before adding to your profile.
              </DialogDescription>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3">
            <div className="flex items-start gap-2 text-sm text-violet-700">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>AI will automatically draft education and experience entries from your description.</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Disclaimer */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">AI-Generated CV Entries</p>
                <p>The AI will parse your description and automatically create structured education and experience entries. Review them before adding to your profile.</p>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">Try an example</p>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Tap to use</span>
            </div>
            <div className="space-y-3">
              {informalExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleUseExample(example)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm transition-all hover:border-blue-200 hover:bg-slate-50"
                >
                  <p className="text-slate-700 leading-6">"{example.informal}"</p>
                  <p className="mt-2 text-xs italic text-slate-500">{example.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              Describe your education and work experience
            </label>
            <Textarea
              value={informalText}
              onChange={(e) => setInformalText(e.target.value)}
              placeholder="E.g., I studied computer science at Damascus University from 2015 to 2019. I worked as a software developer for 2 years and also did some freelance web design projects."
              className="min-h-[140px] resize-none rounded-2xl border-slate-200 bg-slate-50/50 px-4 py-3 focus-visible:ring-blue-200"
            />
            <p className="text-xs text-slate-500 mt-2 leading-5">
              Include your schools, degrees, jobs, positions, companies, and years. The more details you provide, the better the AI can help!
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!informalText.trim() || isGenerating}
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-95"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                AI is analyzing your experience...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate CV Entries with AI
              </>
            )}
          </Button>

          {/* Output */}
          {hasResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  AI-Generated Profile Entries
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy All
                    </>
                  )}
                </button>
              </div>

              {/* Education Results */}
              {generatedEducation.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Education ({generatedEducation.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {generatedEducation.map((edu, index) => (
                      <div key={index} className="rounded-xl border border-emerald-200 bg-white p-3">
                        <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                        <p className="text-sm text-gray-700">{edu.school}</p>
                        <p className="text-sm text-gray-600">{edu.field}</p>
                        <p className="text-xs text-gray-500 mt-1">{edu.startYear} - {edu.endYear}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Results */}
              {generatedExperience.length > 0 && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Work Experience ({generatedExperience.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {generatedExperience.map((exp, index) => (
                      <div key={index} className="rounded-xl border border-blue-200 bg-white p-3">
                        <h5 className="font-semibold text-gray-900">{exp.position}</h5>
                        <p className="text-sm text-gray-700">{exp.company}</p>
                        <p className="text-xs text-gray-500 mb-2">{exp.startDate} - {exp.endDate} • {exp.location}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Transparency Note */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-900">
                    <p><strong>AI Enhancement Applied:</strong> These entries have been professionally formatted using AI based on your description. You can edit them after they're added to your profile.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="h-11 flex-1 rounded-xl"
          >
            Cancel
          </Button>
          {hasResults && (
            <Button
              onClick={handleApply}
              className="h-11 flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white"
            >
              Add {generatedEducation.length + generatedExperience.length} Entries to Profile
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
