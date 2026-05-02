import { useState } from 'react';
import { Globe, Briefcase, UserCircle, Handshake, Award, TrendingUp, Heart, Building2, GraduationCap, Users, Search, ExternalLink } from 'lucide-react';
import type { Language, UserType } from '../App';

interface OnboardingProps {
  onLanguageSelect: (language: Language, userType: UserType) => void;
}

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'uk' as Language, name: 'Українська', flag: '🇺🇦' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
];

const partnerOrganizations = [
  {
    id: 'unhcr',
    name: 'UNHCR',
    subtitle: 'UN Refugee Agency',
    description: 'The UN Refugee Agency protects people forced to flee their homes due to conflict and persecution. UNHCR provides life-saving assistance, including shelter, food, water, and medical care.',
    website: 'https://www.unhcr.org',
    icon: Building2,
    color: 'blue',
  },
  {
    id: 'uca',
    name: 'University of Central Asia',
    subtitle: 'Education & Training',
    description: 'A secular, not-for-profit university committed to serving Central Asia with cutting-edge education and research programs focused on mountain societies.',
    website: 'https://www.ucentralasia.org',
    icon: GraduationCap,
    color: 'green',
  },
  {
    id: 'can',
    name: 'Central Asia Network',
    subtitle: 'Regional Support',
    description: 'A regional network providing comprehensive support services for refugees and displaced persons across Central Asia, including job placement and skills training.',
    website: '#',
    icon: Users,
    color: 'purple',
  },
];

const translations = {
  en: {
    welcome: 'ProMatchAI',
    poweredBy: 'Powered by AI',
    subtitle: 'Bridging Refugees to Apprenticeship Opportunities',
    tagline: 'Your journey to a brighter future starts here',
    selectLanguage: 'Choose Your Language',
    jobSeeker: 'Find My Opportunity',
    employer: 'Post Opportunities',
    employerSubtitle: 'For Employers & Organizations',
    mission: 'Empowering refugees with skills and connecting them to meaningful careers',
    skillMatching: 'Skill Matching',
    careerGrowth: 'Career Growth',
    directConnection: 'Direct Connection',
    partnerOrganizations: 'Partner Organizations',
    searchPartners: 'Search organizations...',
    learnMore: 'Learn More',
    visitWebsite: 'Visit Website',
  },
  ar: {
    welcome: 'ProMatchAI',
    poweredBy: 'مدعوم بالذكاء الاصطناعي',
    subtitle: 'ربط اللاجئين بفرص التدريب المهني',
    tagline: 'رحلتك نحو مستقبل أفضل تبدأ هنا',
    selectLanguage: 'اختر لغتك',
    jobSeeker: 'ابحث عن فرصتي',
    employer: 'انشر الفرص',
    employerSubtitle: 'لأصحاب العمل والمنظمات',
    mission: 'تمكين اللاجئين بالمهارات وربطهم بوظائف ذات مغزى',
    skillMatching: 'مطابقة المهارات',
    careerGrowth: 'النمو المهني',
    directConnection: 'اتصال مباشر',
    partnerOrganizations: 'المنظمات الشريكة',
    searchPartners: 'البحث عن المنظمات...',
    learnMore: 'اعرف المزيد',
    visitWebsite: 'زيارة الموقع',
  },
  fr: {
    welcome: 'ProMatchAI',
    poweredBy: 'Propulsé par IA',
    subtitle: 'Relier les réfugiés aux opportunités d\'apprentissage',
    tagline: 'Votre voyage vers un avenir meilleur commence ici',
    selectLanguage: 'Choisissez votre langue',
    jobSeeker: 'Trouver mon opportunité',
    employer: 'Publier des opportunités',
    employerSubtitle: 'Pour les employeurs et organisations',
    mission: 'Autonomiser les réfugiés avec des compétences et les connecter à des carrières significatives',
    skillMatching: 'Correspondance',
    careerGrowth: 'Croissance',
    directConnection: 'Connexion',
    partnerOrganizations: 'Organisations partenaires',
    searchPartners: 'Rechercher des organisations...',
    learnMore: 'En savoir plus',
    visitWebsite: 'Visiter le site',
  },
  de: {
    welcome: 'ProMatchAI',
    poweredBy: 'Unterstützt durch KI',
    subtitle: 'Flüchtlinge mit Ausbildungsmöglichkeiten verbinden',
    tagline: 'Ihre Reise in eine bessere Zukunft beginnt hier',
    selectLanguage: 'Wählen Sie Ihre Sprache',
    jobSeeker: 'Meine Chance finden',
    employer: 'Chancen veröffentlichen',
    employerSubtitle: 'Für Arbeitgeber und Organisationen',
    mission: 'Flüchtlinge mit Fähigkeiten befähigen und sie mit sinnvollen Karrieren verbinden',
    skillMatching: 'Matching',
    careerGrowth: 'Wachstum',
    directConnection: 'Verbindung',
    partnerOrganizations: 'Partnerorganisationen',
    searchPartners: 'Organisationen suchen...',
    learnMore: 'Mehr erfahren',
    visitWebsite: 'Website besuchen',
  },
  uk: {
    welcome: 'ProMatchAI',
    poweredBy: 'На основі ШІ',
    subtitle: 'Поєднання біженців з можливостями навчання',
    tagline: 'Ваша подорож до кращого майбутнього починається тут',
    selectLanguage: 'Виберіть свою мову',
    jobSeeker: 'Знайти мою можливість',
    employer: 'Опублікувати можливості',
    employerSubtitle: 'Для роботодавців та організацій',
    mission: 'Надаємо біженцям навички та зв\'язуємо їх із значущою кар\'єрою',
    skillMatching: 'Збіг навичок',
    careerGrowth: 'Зростання',
    directConnection: 'Зв\'язок',
    partnerOrganizations: 'Організації-партнери',
    searchPartners: 'Шукати організації...',
    learnMore: 'Дізнатися більше',
    visitWebsite: 'Відвідати сайт',
  },
  es: {
    welcome: 'ProMatchAI',
    poweredBy: 'Impulsado por IA',
    subtitle: 'Conectando refugiados con oportunidades de aprendizaje',
    tagline: 'Tu viaje hacia un futuro mejor comienza aquí',
    selectLanguage: 'Elige tu idioma',
    jobSeeker: 'Encontrar mi oportunidad',
    employer: 'Publicar oportunidades',
    employerSubtitle: 'Para empleadores y organizaciones',
    mission: 'Empoderando a los refugiados con habilidades y conectándolos con carreras significativas',
    skillMatching: 'Coincidencia',
    careerGrowth: 'Crecimiento',
    directConnection: 'Conexión',
    partnerOrganizations: 'Organizaciones asociadas',
    searchPartners: 'Buscar organizaciones...',
    learnMore: 'Aprender más',
    visitWebsite: 'Visitar sitio web',
  },
};

export default function Onboarding({ onLanguageSelect }: OnboardingProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const t = translations[selectedLanguage];

  const filteredOrganizations = partnerOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Logo Header - Matching screenshot */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-center gap-3">
            <Handshake className="w-10 h-10 text-blue-600" />
            <div className="text-left">
              <h1 className="text-2xl font-semibold text-blue-600">{t.welcome}</h1>
              <p className="text-xs text-gray-500 italic">{t.poweredBy}</p>
            </div>
          </div>
        </div>

        {/* Main Title - Not in a card, matching screenshot */}
        <div className="text-center px-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 leading-tight">
            {t.subtitle}
          </h2>
          <p className="text-gray-600 text-sm">
            {t.tagline}
          </p>
        </div>

        {/* Mission Statement - White card with heart, matching screenshot */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-center">
          <Heart className="w-6 h-6 text-pink-500 mx-auto mb-3" />
          <p className="text-gray-800 text-sm leading-relaxed">{t.mission}</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 shadow-md hover:shadow-lg transition-all text-center">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-gray-900 text-xs font-medium">{t.skillMatching}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-all text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-gray-900 text-xs font-medium">{t.careerGrowth}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all text-center">
            <Handshake className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-900 text-xs font-medium">{t.directConnection}</p>
          </div>
        </div>

        {/* Partner Organizations */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-4">
            {t.partnerOrganizations}
          </h3>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPartners}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrganizations.map((org) => {
              const Icon = org.icon;
              const isExpanded = selectedOrg === org.id;
              
              return (
                <div key={org.id}>
                  <div 
                    className={`flex items-center gap-3 p-3 bg-${org.color}-50 rounded-xl border border-${org.color}-100 cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => setSelectedOrg(isExpanded ? null : org.id)}
                  >
                    <div className={`w-12 h-12 bg-${org.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">{org.name}</h4>
                      <p className="text-xs text-gray-600">{org.subtitle}</p>
                    </div>
                    {isExpanded ? (
                      <span className="text-xs text-gray-500">▼</span>
                    ) : (
                      <span className="text-xs text-gray-500">▶</span>
                    )}
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-2 ml-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 mb-3">{org.description}</p>
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t.visitWebsite}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredOrganizations.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No organizations found</p>
            )}
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-center gap-2 text-gray-800 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="text-base font-semibold">{t.selectLanguage}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-blue-600 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-1">{lang.flag}</div>
                <div className={`text-xs font-medium ${
                  selectedLanguage === lang.code ? 'text-white' : 'text-gray-700'
                }`}>
                  {lang.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Action Button */}
        <button
          onClick={() => onLanguageSelect(selectedLanguage, 'refugee')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center gap-2">
            <UserCircle className="w-8 h-8" />
            <span className="text-lg font-semibold">{t.jobSeeker}</span>
          </div>
        </button>

        {/* Employer Link - Now a prominent button */}
        <button
          onClick={() => onLanguageSelect(selectedLanguage, 'employer')}
          className="w-full bg-white text-gray-800 py-4 px-6 rounded-3xl shadow-md hover:shadow-lg border-2 border-gray-200 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center gap-2">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <span className="text-base font-semibold">{t.employer}</span>
            <span className="text-xs text-gray-600">{t.employerSubtitle}</span>
          </div>
        </button>

        {/* Footer */}
        <div className="text-gray-600 text-xs text-center mt-4">
          <p>© 2024 ProMatchAI - Building bridges, creating futures</p>
        </div>
      </div>
    </div>
  );
}