import { Shield, Eye, Lock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { Language } from '../App';

interface AIEthicsInfoProps {
  language: Language;
}

const translations = {
  en: {
    title: 'AI & Data Privacy',
    subtitle: 'How we use AI to help you',
    aiUse: 'How We Use AI',
    aiUseDesc: 'Our AI helps match you with the best apprenticeships and training based on your skills and experience. It provides recommendations to guide your career journey.',
    fairness: 'Fairness & Transparency',
    fairnessDesc: 'AI provides suggestions, not final decisions. All job matches and recommendations are tools to help you—the final choice is always yours.',
    privacy: 'Your Data Privacy',
    privacyDesc: 'Your personal information is encrypted and securely stored. We never share your data without your explicit consent.',
    humanDecisions: 'Human-Centered Approach',
    humanDecisionsDesc: 'While AI assists in matching and recommendations, all application decisions are made by real people—employers review your complete profile.',
    principles: [
      'AI recommendations are based on skills and qualifications, not personal characteristics',
      'You can always review and modify AI-generated content',
      'Your profile data is used only to improve your job matches',
      'Employers see your full profile, not just AI-generated summaries',
    ],
    dataRights: 'Your Rights',
    dataRightsItems: [
      'Access your data at any time',
      'Request data deletion',
      'Opt out of AI features',
      'Download your profile information',
    ],
    contact: 'Questions about AI or privacy? Contact us at privacy@promatchai.org',
  },
  ar: {
    title: 'الذكاء الاصطناعي وخصوصية البيانات',
    subtitle: 'كيف نستخدم الذكاء الاصطناعي لمساعدتك',
    aiUse: 'كيف نستخدم الذكاء الاصطناعي',
    aiUseDesc: 'يساعد الذكاء الاصطناعي لدينا في مطابقتك مع أفضل فرص التدريب بناءً على مهاراتك وخبرتك. يقدم توصيات لتوجيه رحلتك المهنية.',
    fairness: 'العدالة والشفافية',
    fairnessDesc: 'يقدم الذكاء الاصطناعي اقتراحات، وليس قرارات نهائية. جميع المطابقات والتوصيات هي أدوات لمساعدتك—الاختيار النهائي دائمًا لك.',
    privacy: 'خصوصية بياناتك',
    privacyDesc: 'معلوماتك الشخصية مشفرة ومخزنة بشكل آمن. نحن لا نشارك بياناتك أبدًا دون موافقتك الصريحة.',
    humanDecisions: 'نهج محوره الإنسان',
    humanDecisionsDesc: 'بينما يساعد الذكاء الاصطناعي في المطابقة والتوصيات، يتم اتخاذ جميع قرارات التطبيق من قبل أشخاص حقيقيين—يراجع أصحاب العمل ملفك الشخصي الكامل.',
    principles: [
      'توصيات الذكاء الاصطناعي تستند إلى المهارات والمؤهلات، وليس الخصائص الشخصية',
      'يمكنك دائمًا مراجعة وتعديل المحتوى الذي تم إنشاؤه بواسطة الذكاء الاصطناعي',
      'يتم استخدام بيانات ملفك الشخصي فقط لتحسين مطابقات الوظائف',
      'يرى أصحاب العمل ملفك الشخصي الكامل، وليس فقط ملخصات الذكاء الاصطناعي',
    ],
    dataRights: 'حقوقك',
    dataRightsItems: [
      'الوصول إلى بياناتك في أي وقت',
      'طلب حذف البيانات',
      'إلغاء الاشتراك في ميزات الذكاء الاصطناعي',
      'تنزيل معلومات ملفك الشخصي',
    ],
    contact: 'أسئلة حول الذكاء الاصطناعي أو الخصوصية؟ اتصل بنا على privacy@promatchai.org',
  },
  fr: {
    title: 'IA et confidentialité des données',
    subtitle: 'Comment nous utilisons l\'IA pour vous aider',
    aiUse: 'Comment nous utilisons l\'IA',
    aiUseDesc: 'Notre IA vous aide à trouver les meilleurs apprentissages et formations en fonction de vos compétences et expérience. Elle fournit des recommandations pour guider votre parcours professionnel.',
    fairness: 'Équité et transparence',
    fairnessDesc: 'L\'IA fournit des suggestions, pas des décisions finales. Toutes les correspondances et recommandations sont des outils pour vous aider—le choix final vous appartient toujours.',
    privacy: 'Votre vie privée',
    privacyDesc: 'Vos informations personnelles sont cryptées et stockées en toute sécurité. Nous ne partageons jamais vos données sans votre consentement explicite.',
    humanDecisions: 'Approche centrée sur l\'humain',
    humanDecisionsDesc: 'Alors que l\'IA aide à la correspondance et aux recommandations, toutes les décisions d\'application sont prises par de vraies personnes—les employeurs examinent votre profil complet.',
    principles: [
      'Les recommandations de l\'IA sont basées sur les compétences et qualifications, pas sur les caractéristiques personnelles',
      'Vous pouvez toujours examiner et modifier le contenu généré par l\'IA',
      'Les données de votre profil sont utilisées uniquement pour améliorer vos correspondances d\'emploi',
      'Les employeurs voient votre profil complet, pas seulement les résumés générés par l\'IA',
    ],
    dataRights: 'Vos droits',
    dataRightsItems: [
      'Accéder à vos données à tout moment',
      'Demander la suppression des données',
      'Se désinscrire des fonctionnalités IA',
      'Télécharger vos informations de profil',
    ],
    contact: 'Questions sur l\'IA ou la confidentialité? Contactez-nous à privacy@promatchai.org',
  },
  de: {
    title: 'KI und Datenschutz',
    subtitle: 'Wie wir KI verwenden, um Ihnen zu helfen',
    aiUse: 'Wie wir KI verwenden',
    aiUseDesc: 'Unsere KI hilft Ihnen, die besten Ausbildungen und Schulungen basierend auf Ihren Fähigkeiten und Erfahrungen zu finden. Sie bietet Empfehlungen, um Ihre Karriere zu leiten.',
    fairness: 'Fairness und Transparenz',
    fairnessDesc: 'KI bietet Vorschläge, keine endgültigen Entscheidungen. Alle Übereinstimmungen und Empfehlungen sind Werkzeuge, um Ihnen zu helfen—die endgültige Wahl liegt immer bei Ihnen.',
    privacy: 'Ihr Datenschutz',
    privacyDesc: 'Ihre persönlichen Informationen sind verschlüsselt und sicher gespeichert. Wir teilen Ihre Daten niemals ohne Ihre ausdrückliche Zustimmung.',
    humanDecisions: 'Menschenzentrierter Ansatz',
    humanDecisionsDesc: 'Während KI bei der Übereinstimmung und Empfehlungen hilft, werden alle Bewerbungsentscheidungen von echten Menschen getroffen—Arbeitgeber prüfen Ihr vollständiges Profil.',
    principles: [
      'KI-Empfehlungen basieren auf Fähigkeiten und Qualifikationen, nicht auf persönlichen Merkmalen',
      'Sie können KI-generierte Inhalte jederzeit überprüfen und ändern',
      'Ihre Profildaten werden nur zur Verbesserung Ihrer Jobübereinstimmungen verwendet',
      'Arbeitgeber sehen Ihr vollständiges Profil, nicht nur KI-generierte Zusammenfassungen',
    ],
    dataRights: 'Ihre Rechte',
    dataRightsItems: [
      'Zugriff auf Ihre Daten jederzeit',
      'Datenlöschung anfordern',
      'KI-Funktionen deaktivieren',
      'Profilinformationen herunterladen',
    ],
    contact: 'Fragen zu KI oder Datenschutz? Kontaktieren Sie uns unter privacy@promatchai.org',
  },
  uk: {
    title: 'ШІ та конфіденційність даних',
    subtitle: 'Як ми використовуємо ШІ, щоб допомогти вам',
    aiUse: 'Як ми використовуємо ШІ',
    aiUseDesc: 'Наш ШІ допомагає підібрати найкращі учнівства та навчання на основі ваших навичок і досвіду. Він надає рекомендації для вашої кар\'єри.',
    fairness: 'Справедливість і прозорість',
    fairnessDesc: 'ШІ надає пропозиції, а не остаточні рішення. Всі збіги та рекомендації є інструментами, щоб допомогти вам—остаточний вибір завжди за вами.',
    privacy: 'Ваша конфіденційність',
    privacyDesc: 'Ваша особиста інформація зашифрована і безпечно зберігається. Ми ніколи не ділимося вашими даними без вашої явної згоди.',
    humanDecisions: 'Підхід, орієнтований на людину',
    humanDecisionsDesc: 'Хоча ШІ допомагає з підбором і рекомендаціями, всі рішення щодо заявок приймаються реальними людьми—роботодавці переглядають ваш повний профіль.',
    principles: [
      'Рекомендації ШІ базуються на навичках і кваліфікації, а не на особистих характеристиках',
      'Ви завжди можете переглянути і змінити контент, створений ШІ',
      'Дані вашого профілю використовуються лише для покращення збігів роботи',
      'Роботодавці бачать ваш повний профіль, а не лише резюме, створені ШІ',
    ],
    dataRights: 'Ваші права',
    dataRightsItems: [
      'Доступ до ваших даних у будь-який час',
      'Запит на видалення даних',
      'Відмова від функцій ШІ',
      'Завантаження інформації профілю',
    ],
    contact: 'Питання про ШІ або конфіденційність? Зв\'яжіться з нами за адресою privacy@promatchai.org',
  },
  es: {
    title: 'IA y privacidad de datos',
    subtitle: 'Cómo usamos la IA para ayudarte',
    aiUse: 'Cómo usamos la IA',
    aiUseDesc: 'Nuestra IA te ayuda a encontrar los mejores aprendizajes y capacitación según tus habilidades y experiencia. Proporciona recomendaciones para guiar tu carrera.',
    fairness: 'Equidad y transparencia',
    fairnessDesc: 'La IA proporciona sugerencias, no decisiones finales. Todas las coincidencias y recomendaciones son herramientas para ayudarte—la elección final siempre es tuya.',
    privacy: 'Tu privacidad',
    privacyDesc: 'Tu información personal está cifrada y almacenada de forma segura. Nunca compartimos tus datos sin tu consentimiento explícito.',
    humanDecisions: 'Enfoque centrado en el humano',
    humanDecisionsDesc: 'Si bien la IA ayuda con la coincidencia y las recomendaciones, todas las decisiones de solicitud son tomadas por personas reales—los empleadores revisan tu perfil completo.',
    principles: [
      'Las recomendaciones de IA se basan en habilidades y calificaciones, no en características personales',
      'Siempre puedes revisar y modificar el contenido generado por IA',
      'Los datos de tu perfil se usan solo para mejorar tus coincidencias de trabajo',
      'Los empleadores ven tu perfil completo, no solo resúmenes generados por IA',
    ],
    dataRights: 'Tus derechos',
    dataRightsItems: [
      'Acceder a tus datos en cualquier momento',
      'Solicitar eliminación de datos',
      'Optar por no usar funciones de IA',
      'Descargar información de perfil',
    ],
    contact: '¿Preguntas sobre IA o privacidad? Contáctanos en privacy@promatchai.org',
  },
};

export default function AIEthicsInfo({ language }: AIEthicsInfoProps) {
  const t = translations[language] || translations.en;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-gray-900">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* How We Use AI */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">{t.aiUse}</h3>
            <p className="text-gray-600 text-sm">{t.aiUseDesc}</p>
          </div>
        </div>
      </div>

      {/* Fairness */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">{t.fairness}</h3>
            <p className="text-gray-600 text-sm mb-4">{t.fairnessDesc}</p>
            <div className="space-y-2">
              {t.principles.map((principle, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{principle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">{t.privacy}</h3>
            <p className="text-gray-600 text-sm">{t.privacyDesc}</p>
          </div>
        </div>
      </div>

      {/* Human Decisions */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">{t.humanDecisions}</h3>
            <p className="text-gray-600 text-sm">{t.humanDecisionsDesc}</p>
          </div>
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-gray-900 mb-4">{t.dataRights}</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {t.dataRightsItems.map((right, index) => (
            <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{right}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">{t.contact}</p>
      </div>
    </div>
  );
}