import { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle, Briefcase, GraduationCap, Heart, Globe } from 'lucide-react';
import type { Language } from '../App';

interface AISkillMatchingFlowProps {
  language: Language;
  onComplete: (data: SkillMatchingData) => void;
  onBack: () => void;
}

export interface SkillMatchingData {
  skills: string[];
  experience: string;
  educationLevel: string;
  interests: string[];
  preferredLanguage: Language;
  name: string;
}

const translations = {
  en: {
    title: 'AI Skill Matching',
    subtitle: 'Answer a few questions and let AI find your perfect apprenticeship match',
    aiPowered: 'AI-Powered Matching',
    step: 'Step',
    of: 'of',
    next: 'Next',
    back: 'Back',
    finish: 'Find My Matches',
    skip: 'Skip',
    
    // Step 1
    step1Title: 'What skills do you have?',
    step1Subtitle: 'Select all that apply',
    
    // Step 2
    step2Title: 'Work Experience',
    step2Subtitle: 'Tell us about your background',
    noExperience: 'No work experience',
    lessThan1Year: 'Less than 1 year',
    oneToThreeYears: '1-3 years',
    threeToFiveYears: '3-5 years',
    moreThan5Years: 'More than 5 years',
    
    // Step 3
    step3Title: 'Education Level',
    step3Subtitle: 'What is your highest level of education?',
    primarySchool: 'Primary School',
    secondarySchool: 'Secondary School',
    highSchool: 'High School',
    vocationalTraining: 'Vocational Training',
    university: 'University',
    
    // Step 4
    step4Title: 'Your Interests',
    step4Subtitle: 'What type of work interests you?',
    
    // Step 5
    step5Title: 'Preferred Language',
    step5Subtitle: 'Which language are you most comfortable with?',
    
    // Results
    resultsTitle: 'AI Analysis Complete!',
    resultsSubtitle: 'Here are your personalized apprenticeship matches',
    matchedBased: 'Matched based on your skills, experience, and interests',
    viewAllMatches: 'View All Matches',
  },
  ar: {
    title: 'مطابقة المهارات بالذكاء الاصطناعي',
    subtitle: 'أجب عن بعض الأسئلة ودع الذكاء الاصطناعي يجد لك التدريب المهني المثالي',
    aiPowered: 'مطابقة مدعومة بالذكاء الاصطناعي',
    step: 'خطوة',
    of: 'من',
    next: 'التالي',
    back: 'رجوع',
    finish: 'ابحث عن تطابقاتي',
    skip: 'تخطي',
    step1Title: 'ما هي المهارات التي لديك؟',
    step1Subtitle: 'حدد كل ما ينطبق',
    step2Title: 'خبرة العمل',
    step2Subtitle: 'أخبرنا عن خلفيتك',
    noExperience: 'لا توجد خبرة عمل',
    lessThan1Year: 'أقل من سنة',
    oneToThreeYears: '1-3 سنوات',
    threeToFiveYears: '3-5 سنوات',
    moreThan5Years: 'أكثر من 5 سنوات',
    step3Title: 'المستوى التعليمي',
    step3Subtitle: 'ما هو أعلى مستوى تعليمي لديك؟',
    primarySchool: 'المدرسة الابتدائية',
    secondarySchool: 'المدرسة الثانوية',
    highSchool: 'الثانوية العامة',
    vocationalTraining: 'التدريب المهني',
    university: 'الجامعة',
    step4Title: 'اهتماماتك',
    step4Subtitle: 'ما نوع العمل الذي يهمك؟',
    step5Title: 'اللغة المفضلة',
    step5Subtitle: 'ما هي اللغة التي ترتاح لها أكثر؟',
    resultsTitle: 'اكتمل تحليل الذكاء الاصطناعي!',
    resultsSubtitle: 'إليك تطابقات التدريب المهني الشخصية',
    matchedBased: 'تم المطابقة بناءً على مهاراتك وخبرتك واهتماماتك',
    viewAllMatches: 'عرض جميع التطابقات',
  },
  fr: {
    title: 'Correspondance de compétences IA',
    subtitle: "Répondez à quelques questions et laissez l'IA trouver votre apprentissage parfait",
    aiPowered: 'Correspondance alimentée par IA',
    step: 'Étape',
    of: 'sur',
    next: 'Suivant',
    back: 'Retour',
    finish: 'Trouver mes correspondances',
    skip: 'Passer',
    step1Title: 'Quelles compétences avez-vous?',
    step1Subtitle: 'Sélectionnez tout ce qui s\'applique',
    step2Title: 'Expérience professionnelle',
    step2Subtitle: 'Parlez-nous de votre parcours',
    noExperience: 'Aucune expérience',
    lessThan1Year: 'Moins d\'un an',
    oneToThreeYears: '1-3 ans',
    threeToFiveYears: '3-5 ans',
    moreThan5Years: 'Plus de 5 ans',
    step3Title: 'Niveau d\'éducation',
    step3Subtitle: 'Quel est votre niveau d\'études le plus élevé?',
    primarySchool: 'École primaire',
    secondarySchool: 'Collège',
    highSchool: 'Lycée',
    vocationalTraining: 'Formation professionnelle',
    university: 'Université',
    step4Title: 'Vos intérêts',
    step4Subtitle: 'Quel type de travail vous intéresse?',
    step5Title: 'Langue préférée',
    step5Subtitle: 'Avec quelle langue êtes-vous le plus à l\'aise?',
    resultsTitle: 'Analyse IA terminée!',
    resultsSubtitle: 'Voici vos correspondances d\'apprentissage personnalisées',
    matchedBased: 'Correspondance basée sur vos compétences, expérience et intérêts',
    viewAllMatches: 'Voir toutes les correspondances',
  },
  de: {
    title: 'KI-Skill-Matching',
    subtitle: 'Beantworten Sie ein paar Fragen und lassen Sie die KI Ihre perfekte Ausbildung finden',
    aiPowered: 'KI-gestütztes Matching',
    step: 'Schritt',
    of: 'von',
    next: 'Weiter',
    back: 'Zurück',
    finish: 'Meine Übereinstimmungen finden',
    skip: 'Überspringen',
    step1Title: 'Welche Fähigkeiten haben Sie?',
    step1Subtitle: 'Wählen Sie alle zutreffenden',
    step2Title: 'Berufserfahrung',
    step2Subtitle: 'Erzählen Sie uns von Ihrem Hintergrund',
    noExperience: 'Keine Berufserfahrung',
    lessThan1Year: 'Weniger als 1 Jahr',
    oneToThreeYears: '1-3 Jahre',
    threeToFiveYears: '3-5 Jahre',
    moreThan5Years: 'Mehr als 5 Jahre',
    step3Title: 'Bildungsniveau',
    step3Subtitle: 'Was ist Ihr höchster Bildungsabschluss?',
    primarySchool: 'Grundschule',
    secondarySchool: 'Hauptschule',
    highSchool: 'Gymnasium',
    vocationalTraining: 'Berufsausbildung',
    university: 'Universität',
    step4Title: 'Ihre Interessen',
    step4Subtitle: 'Welche Art von Arbeit interessiert Sie?',
    step5Title: 'Bevorzugte Sprache',
    step5Subtitle: 'Mit welcher Sprache fühlen Sie sich am wohlsten?',
    resultsTitle: 'KI-Analyse abgeschlossen!',
    resultsSubtitle: 'Hier sind Ihre personalisierten Ausbildungsübereinstimmungen',
    matchedBased: 'Übereinstimmung basierend auf Ihren Fähigkeiten, Erfahrungen und Interessen',
    viewAllMatches: 'Alle Übereinstimmungen anzeigen',
  },
  uk: {
    title: 'Підбір навичок зі ШІ',
    subtitle: 'Дайте відповіді на кілька запитань, і ШІ знайде ідеальне учнівство',
    aiPowered: 'Підбір на основі ШІ',
    step: 'Крок',
    of: 'з',
    next: 'Далі',
    back: 'Назад',
    finish: 'Знайти збіги',
    skip: 'Пропустити',
    step1Title: 'Які у вас навички?',
    step1Subtitle: 'Виберіть усе, що підходить',
    step2Title: 'Досвід роботи',
    step2Subtitle: 'Розкажіть про свій досвід',
    noExperience: 'Без досвіду',
    lessThan1Year: 'Менше року',
    oneToThreeYears: '1-3 роки',
    threeToFiveYears: '3-5 років',
    moreThan5Years: 'Більше 5 років',
    step3Title: 'Рівень освіти',
    step3Subtitle: 'Який ваш найвищий рівень освіти?',
    primarySchool: 'Початкова школа',
    secondarySchool: 'Середня школа',
    highSchool: 'Старша школа',
    vocationalTraining: 'Професійна підготовка',
    university: 'Університет',
    step4Title: 'Ваші інтереси',
    step4Subtitle: 'Який тип роботи вас цікавить?',
    step5Title: 'Бажана мова',
    step5Subtitle: 'Якою мовою вам найзручніше?',
    resultsTitle: 'Аналіз ШІ завершено!',
    resultsSubtitle: 'Ось ваші персоналізовані збіги учнівства',
    matchedBased: 'Підібрано на основі ваших навичок, досвіду та інтересів',
    viewAllMatches: 'Переглянути всі збіги',
  },
  es: {
    title: 'Coincidencia de habilidades IA',
    subtitle: 'Responde algunas preguntas y deja que la IA encuentre tu aprendizaje perfecto',
    aiPowered: 'Coincidencia impulsada por IA',
    step: 'Paso',
    of: 'de',
    next: 'Siguiente',
    back: 'Atrás',
    finish: 'Encontrar mis coincidencias',
    skip: 'Omitir',
    step1Title: '¿Qué habilidades tienes?',
    step1Subtitle: 'Selecciona todo lo que aplique',
    step2Title: 'Experiencia laboral',
    step2Subtitle: 'Cuéntanos sobre tu experiencia',
    noExperience: 'Sin experiencia',
    lessThan1Year: 'Menos de 1 año',
    oneToThreeYears: '1-3 años',
    threeToFiveYears: '3-5 años',
    moreThan5Years: 'Más de 5 años',
    step3Title: 'Nivel de educación',
    step3Subtitle: '¿Cuál es tu nivel educativo más alto?',
    primarySchool: 'Escuela primaria',
    secondarySchool: 'Escuela secundaria',
    highSchool: 'Bachillerato',
    vocationalTraining: 'Formación profesional',
    university: 'Universidad',
    step4Title: 'Tus intereses',
    step4Subtitle: '¿Qué tipo de trabajo te interesa?',
    step5Title: 'Idioma preferido',
    step5Subtitle: '¿Con qué idioma te sientes más cómodo?',
    resultsTitle: '¡Análisis de IA completado!',
    resultsSubtitle: 'Aquí están tus coincidencias de aprendizaje personalizadas',
    matchedBased: 'Coincidencia basada en tus habilidades, experiencia e intereses',
    viewAllMatches: 'Ver todas las coincidencias',
  },
};

const availableSkills = [
  'Carpentry', 'Plumbing', 'Electrical Work', 'Construction',
  'Cooking', 'Baking', 'Food Service', 'Kitchen Management',
  'Python', 'JavaScript', 'HTML/CSS', 'Web Development',
  'English A1', 'English A2', 'English B1', 'English B2',
  'German A1', 'German A2', 'Arabic', 'French',
  'Customer Service', 'Sales', 'Retail', 'Cashier',
  'Driving License', 'Forklift', 'Warehouse', 'Logistics',
  'Cleaning', 'Housekeeping', 'Maintenance', 'Painting',
  'Welding', 'Metalwork', 'Mechanics', 'Auto Repair',
  'Nursing', 'Healthcare', 'First Aid', 'Elderly Care',
  'Teaching', 'Childcare', 'Tutoring', 'Education',
  'Data Entry', 'Microsoft Office', 'Excel', 'Typing',
  'Graphic Design', 'Photography', 'Video Editing', 'Adobe Suite',
];

const interests = [
  { id: 'tech', name: 'Technology & IT', icon: '💻' },
  { id: 'construction', name: 'Construction & Trades', icon: '🏗️' },
  { id: 'healthcare', name: 'Healthcare', icon: '⚕️' },
  { id: 'hospitality', name: 'Hospitality & Food', icon: '🍽️' },
  { id: 'retail', name: 'Retail & Sales', icon: '🛍️' },
  { id: 'logistics', name: 'Logistics & Transport', icon: '🚚' },
  { id: 'education', name: 'Education & Training', icon: '📚' },
  { id: 'creative', name: 'Creative & Design', icon: '🎨' },
];

export default function AISkillMatchingFlow({ language, onComplete, onBack }: AISkillMatchingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [name, setName] = useState('');
  
  const t = translations[language];
  const totalSteps = 5;

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleFinish = () => {
    onComplete({
      skills: selectedSkills,
      experience,
      educationLevel,
      interests: selectedInterests,
      preferredLanguage: language,
      name,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedSkills.length > 0;
      case 2: return experience !== '';
      case 3: return educationLevel !== '';
      case 4: return selectedInterests.length > 0;
      case 5: return name.trim() !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>{t.aiPowered}</span>
          </div>
          <h1 className="text-gray-900">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t.step} {currentStep} {t.of} {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[400px]">
          {/* Step 1: Skills */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-gray-900">{t.step1Title}</h2>
                <p className="text-gray-600">{t.step1Subtitle}</p>
              </div>
              
              {selectedSkills.length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 mb-2">Selected Skills ({selectedSkills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(skill => (
                      <div key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
                      selectedSkills.includes(skill)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Briefcase className="w-12 h-12 mx-auto text-blue-600" />
                <h2 className="text-gray-900">{t.step2Title}</h2>
                <p className="text-gray-600">{t.step2Subtitle}</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'none', label: t.noExperience },
                  { value: '<1', label: t.lessThan1Year },
                  { value: '1-3', label: t.oneToThreeYears },
                  { value: '3-5', label: t.threeToFiveYears },
                  { value: '5+', label: t.moreThan5Years },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setExperience(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all transform hover:scale-102 ${
                      experience === option.value
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{option.label}</span>
                      {experience === option.value && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <GraduationCap className="w-12 h-12 mx-auto text-purple-600" />
                <h2 className="text-gray-900">{t.step3Title}</h2>
                <p className="text-gray-600">{t.step3Subtitle}</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'primary', label: t.primarySchool },
                  { value: 'secondary', label: t.secondarySchool },
                  { value: 'high', label: t.highSchool },
                  { value: 'vocational', label: t.vocationalTraining },
                  { value: 'university', label: t.university },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setEducationLevel(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all transform hover:scale-102 ${
                      educationLevel === option.value
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{option.label}</span>
                      {educationLevel === option.value && (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Heart className="w-12 h-12 mx-auto text-pink-600" />
                <h2 className="text-gray-900">{t.step4Title}</h2>
                <p className="text-gray-600">{t.step4Subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {interests.map(interest => (
                  <button
                    key={interest.id}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      selectedInterests.includes(interest.id)
                        ? 'border-pink-600 bg-pink-50 shadow-md'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{interest.icon}</div>
                    <div className="text-sm text-gray-900">{interest.name}</div>
                    {selectedInterests.includes(interest.id) && (
                      <CheckCircle className="w-5 h-5 text-pink-600 mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Name */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Globe className="w-12 h-12 mx-auto text-green-600" />
                <h2 className="text-gray-900">What should we call you?</h2>
                <p className="text-gray-600">Enter your name to personalize your experience</p>
              </div>

              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none text-lg text-center"
                  autoFocus
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>AI Analysis Summary:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>✓ {selectedSkills.length} skills identified</li>
                      <li>✓ {experience === 'none' ? 'Entry-level' : 'Experienced'} candidate</li>
                      <li>✓ {educationLevel} education background</li>
                      <li>✓ Interested in {selectedInterests.length} career fields</li>
                    </ul>
                    <p className="mt-3 text-purple-700"><strong>Ready to find your perfect match!</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{t.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.finish}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
