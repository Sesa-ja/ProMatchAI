import { useMemo, useState } from 'react';
import { Search, X, ArrowRight, ArrowLeft, Hammer, UtensilsCrossed, Code2, Languages, Briefcase, Truck, HeartHandshake, Palette } from 'lucide-react';
import type { Language } from '../App';

interface SkillProfilingProps {
  language: Language;
  onComplete: (skills: string[], name: string) => void;
  onBack: () => void;
}

type SkillCategory = {
  id: string;
  label: string;
  icon: typeof Hammer;
  colorClass: string;
  badgeClass: string;
  skills: string[];
};

const skillCategories: SkillCategory[] = [
  {
    id: 'construction',
    label: 'Construction',
    icon: Hammer,
    colorClass: 'from-amber-400 to-orange-400',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
    skills: ['Carpentry', 'Plumbing', 'Electrical Work', 'Construction', 'Painting', 'Welding', 'Metalwork', 'Maintenance'],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    icon: UtensilsCrossed,
    colorClass: 'from-emerald-400 to-teal-400',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    skills: ['Cooking', 'Baking', 'Food Service', 'Kitchen Management', 'Housekeeping', 'Cleaning'],
  },
  {
    id: 'digital',
    label: 'Programming',
    icon: Code2,
    colorClass: 'from-blue-500 to-indigo-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-100',
    skills: ['Python', 'JavaScript', 'HTML/CSS', 'Web Development', 'Data Entry', 'Microsoft Office', 'Excel', 'Typing'],
  },
  {
    id: 'languages',
    label: 'Languages',
    icon: Languages,
    colorClass: 'from-violet-400 to-fuchsia-400',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-100',
    skills: ['English A1', 'English A2', 'English B1', 'English B2', 'German A1', 'German A2', 'Arabic', 'French'],
  },
  {
    id: 'business',
    label: 'Customer Care',
    icon: Briefcase,
    colorClass: 'from-pink-400 to-rose-400',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-100',
    skills: ['Customer Service', 'Sales', 'Retail', 'Cashier'],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    icon: Truck,
    colorClass: 'from-cyan-400 to-sky-400',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    skills: ['Driving License', 'Forklift', 'Warehouse', 'Logistics', 'Mechanics', 'Auto Repair'],
  },
  {
    id: 'care',
    label: 'Care & Education',
    icon: HeartHandshake,
    colorClass: 'from-green-400 to-lime-400',
    badgeClass: 'bg-lime-50 text-lime-700 border-lime-100',
    skills: ['Nursing', 'Healthcare', 'First Aid', 'Elderly Care', 'Teaching', 'Childcare', 'Tutoring', 'Education'],
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: Palette,
    colorClass: 'from-purple-400 to-pink-400',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-100',
    skills: ['Graphic Design', 'Photography', 'Video Editing', 'Adobe Suite', 'Sewing', 'Tailoring', 'Fashion', 'Textiles'],
  },
];

const allSkills = skillCategories.flatMap((category) => category.skills);

const translations = {
  en: {
    title: 'What are you good at?',
    subtitle: 'Choose a category first, then select the skills you already have.',
    search: 'Search skills...',
    categories: 'Categories',
    mySkills: 'Selected skills',
    step: 'Step 1 of 3',
    findMatches: 'Find Matches',
    namePrompt: 'What should we call you?',
    namePlaceholder: 'Enter your name',
    pickCategory: 'Pick a category to explore skills',
    selectedCount: 'skills selected',
    stepTwo: 'Step 2 of 3',
  },
  ar: {
    title: 'Ù…Ø§ Ø§Ù„Ø°ÙŠ ØªØ¬ÙŠØ¯Ù‡ØŸ',
    subtitle: 'Ø§Ø®ØªØ± ÙØ¦Ø© Ø£ÙˆÙ„Ø§Ù‹ Ø«Ù… Ø­Ø¯Ø¯ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„ØªÙŠ ØªÙ…ØªÙ„ÙƒÙ‡Ø§.',
    search: 'Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª...',
    categories: 'Ø§Ù„ÙØ¦Ø§Øª',
    mySkills: 'Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©',
    step: 'Ø§Ù„Ø®Ø·ÙˆØ© 1 Ù…Ù† 3',
    findMatches: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„ØªØ·Ø§Ø¨Ù‚Ø§Øª',
    namePrompt: 'Ù…Ø§Ø°Ø§ ÙŠØ¬Ø¨ Ø£Ù† Ù†Ø³Ù…ÙŠÙƒØŸ',
    namePlaceholder: 'Ø£Ø¯Ø®Ù„ Ø§Ø³Ù…Ùƒ',
    pickCategory: 'Ø§Ø®ØªØ± ÙØ¦Ø© Ù„Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª',
    selectedCount: 'Ù…Ù‡Ø§Ø±Ø§Øª Ù…Ø®ØªØ§Ø±Ø©',
    stepTwo: 'Ø§Ù„Ø®Ø·ÙˆØ© 2 Ù…Ù† 3',
  },
  fr: {
    title: 'Dans quoi etes-vous bon?',
    subtitle: 'Choisissez d abord une categorie, puis selectionnez vos competences.',
    search: 'Rechercher des competences...',
    categories: 'Categories',
    mySkills: 'Competences selectionnees',
    step: 'Etape 1 sur 3',
    findMatches: 'Trouver des correspondances',
    namePrompt: 'Comment devons-nous vous appeler?',
    namePlaceholder: 'Entrez votre nom',
    pickCategory: 'Choisissez une categorie pour voir les competences',
    selectedCount: 'competences selectionnees',
    stepTwo: 'Etape 2 sur 3',
  },
  de: {
    title: 'Worin sind Sie gut?',
    subtitle: 'Wahlen Sie zuerst eine Kategorie und dann Ihre Fahigkeiten aus.',
    search: 'Fahigkeiten suchen...',
    categories: 'Kategorien',
    mySkills: 'Ausgewahlte Fahigkeiten',
    step: 'Schritt 1 von 3',
    findMatches: 'Ubereinstimmungen finden',
    namePrompt: 'Wie sollen wir Sie nennen?',
    namePlaceholder: 'Geben Sie Ihren Namen ein',
    pickCategory: 'Wahlen Sie eine Kategorie, um Fahigkeiten zu sehen',
    selectedCount: 'Fahigkeiten ausgewahlt',
    stepTwo: 'Schritt 2 von 3',
  },
  uk: {
    title: 'U chomu vy dobre rozbyraietes?',
    subtitle: 'Spershu vyberit katehoriiu, a potim navychky, yaki u vas vzhe ie.',
    search: 'Poshuk navychok...',
    categories: 'Katehorii',
    mySkills: 'Vybrani navychky',
    step: 'Krok 1 z 3',
    findMatches: 'Znayty zbihy',
    namePrompt: 'Yak nam vas nazyvaty?',
    namePlaceholder: 'Vvedit svoie imia',
    pickCategory: 'Vyberit katehoriiu, shchob pobachyty navychky',
    selectedCount: 'navychok vybrano',
    stepTwo: 'Krok 2 z 3',
  },
  es: {
    title: 'En que eres bueno?',
    subtitle: 'Elige primero una categoria y luego selecciona tus habilidades.',
    search: 'Buscar habilidades...',
    categories: 'Categorias',
    mySkills: 'Habilidades seleccionadas',
    step: 'Paso 1 de 3',
    findMatches: 'Encontrar coincidencias',
    namePrompt: 'Como debemos llamarte?',
    namePlaceholder: 'Ingresa tu nombre',
    pickCategory: 'Elige una categoria para explorar habilidades',
    selectedCount: 'habilidades seleccionadas',
    stepTwo: 'Paso 2 de 3',
  },
  it: {
    title: 'In cosa sei bravo?',
    subtitle: 'Scegli prima una categoria e poi le competenze che hai gia.',
    search: 'Cerca competenze...',
    categories: 'Categorie',
    mySkills: 'Competenze selezionate',
    step: 'Passo 1 di 3',
    findMatches: 'Trova corrispondenze',
    namePrompt: 'Come dobbiamo chiamarti?',
    namePlaceholder: 'Inserisci il tuo nome',
    pickCategory: 'Scegli una categoria per vedere le competenze',
    selectedCount: 'competenze selezionate',
    stepTwo: 'Passo 2 di 3',
  },
  tr: {
    title: 'Nelerde iyisin?',
    subtitle: 'Once bir kategori sec, sonra sahip oldugun becerileri isaretle.',
    search: 'Beceri ara...',
    categories: 'Kategoriler',
    mySkills: 'Secilen beceriler',
    step: 'Adim 1 / 3',
    findMatches: 'Eslesmeleri Bul',
    namePrompt: 'Size nasil hitap edelim?',
    namePlaceholder: 'Adinizi girin',
    pickCategory: 'Becerileri gormek icin bir kategori secin',
    selectedCount: 'beceri secildi',
    stepTwo: 'Adim 2 / 3',
  },
  fa: {
    title: 'Dar che chizi maharat darid?',
    subtitle: 'Avval yek daste ra entekhab konid, bad maharatha ra barghozinid.',
    search: 'Jostojoye maharat...',
    categories: 'Dasteha',
    mySkills: 'Maharat-haye entekhab shode',
    step: 'Marhale 1 az 3',
    findMatches: 'Peyda kardan tatabogh',
    namePrompt: 'Che nam shoma ra seda konim?',
    namePlaceholder: 'Nam khod ra vared konid',
    pickCategory: 'Baraye didan maharatha yek daste entekhab konid',
    selectedCount: 'maharat entekhab shod',
    stepTwo: 'Marhale 2 az 3',
  },
  ru: {
    title: 'V chem vy horosho razbiraetes?',
    subtitle: 'Snachala vyberite kategoriyu, zatem navyki, kotorye u vas uzhe est.',
    search: 'Poisk navykov...',
    categories: 'Kategorii',
    mySkills: 'Vybrannye navyki',
    step: 'Shag 1 iz 3',
    findMatches: 'Nayti sovpadeniya',
    namePrompt: 'Kak nam vas nazyvat?',
    namePlaceholder: 'Vvedite vashe imya',
    pickCategory: 'Vyberite kategoriyu, chtoby posmotret navyki',
    selectedCount: 'navykov vybrano',
    stepTwo: 'Shag 2 iz 3',
  },
};

export default function SkillProfiling({ language, onComplete, onBack }: SkillProfilingProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [name, setName] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(skillCategories[0].id);

  const t = translations[language as keyof typeof translations] || translations.en;

  const activeCategory = skillCategories.find((category) => category.id === activeCategoryId) ?? skillCategories[0];

  const filteredSkills = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const sourceSkills = query ? allSkills : activeCategory.skills;

    return sourceSkills.filter(
      (skill) =>
        skill.toLowerCase().includes(query) &&
        !selectedSkills.includes(skill)
    );
  }, [activeCategory.skills, searchQuery, selectedSkills]);

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
      return;
    }

    setSelectedSkills([...selectedSkills, skill]);
  };

  const handleContinue = () => {
    if (selectedSkills.length > 0) {
      setShowNamePrompt(true);
    }
  };

  const handleFinish = () => {
    if (name.trim()) {
      onComplete(selectedSkills, name.trim());
    }
  };

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#ffffff_100%)] p-6">
        <div className="mx-auto max-w-md space-y-6">
          <button
            onClick={() => setShowNamePrompt(false)}
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)] text-white">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Back
          </button>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-slate-700">{t.namePrompt}</h2>
            <p className="text-sm text-slate-500">{t.stepTwo}</p>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(148,163,184,0.16)]">
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-300"
                autoFocus
              />

              <button
                onClick={handleFinish}
                disabled={!name.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ef5b2f_0%,#db2777_100%)] py-3 text-white shadow-[0_16px_30px_rgba(219,39,119,0.24)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{t.findMatches}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#ffffff_100%)] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)] text-white">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Back
          </button>
          <div className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
            {t.step}
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <h1 className="text-[1.7rem] font-medium tracking-tight text-slate-700">{t.title}</h1>
          <p className="mx-auto max-w-xl text-sm leading-6 text-slate-500">{t.subtitle}</p>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-700">{t.categories}</h3>
            <span className="text-sm text-slate-500">{selectedSkills.length} {t.selectedCount}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {skillCategories.map((category) => {
              const Icon = category.icon;
              const isActive = category.id === activeCategoryId;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategoryId(category.id);
                    setSearchQuery('');
                  }}
                  className={`rounded-[24px] border p-4 text-left transition-all ${
                    isActive
                      ? 'border-blue-200 bg-white shadow-md'
                      : 'border-slate-100 bg-white/90 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.colorClass} text-white shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-700">{category.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedSkills.length > 0 && (
          <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_48px_rgba(148,163,184,0.12)]">
            <h3 className="mb-3 text-lg font-semibold text-slate-700">{t.mySkills}</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
                >
                  <span>{skill}</span>
                  <button onClick={() => handleSkillToggle(skill)} className="rounded-full p-0.5 hover:bg-emerald-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_48px_rgba(148,163,184,0.16)]">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-700">{activeCategory.label}</div>
              <div className="text-sm text-slate-500">{t.pickCategory}</div>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${activeCategory.badgeClass}`}>
              {activeCategory.skills.length} skills
            </span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-700 outline-none focus:border-blue-300"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {skill}
              </button>
            ))}

            {filteredSkills.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No skills found for this search.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_48px_rgba(148,163,184,0.16)]">
          <div className="mb-3 flex justify-between text-sm text-slate-500">
            <span>{t.step}</span>
            <span>{selectedSkills.length} {t.selectedCount}</span>
          </div>
          <div className="mb-4 h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)]" style={{ width: '33%' }} />
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedSkills.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ef5b2f_0%,#db2777_100%)] py-3 text-white shadow-[0_16px_30px_rgba(219,39,119,0.24)] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{t.findMatches}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
