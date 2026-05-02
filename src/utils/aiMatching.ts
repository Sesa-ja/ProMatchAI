export type MatchConfidence = 'high' | 'medium' | 'low';

export interface AIMatchDetails {
  confidence: MatchConfidence;
  confidenceLabel: string;
  skillsMatched: number;
  skillsRequired: number;
  matchPercentage: number;
  reasons: string[];
}

export function calculateAIMatchScore(userSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 50;
  
  const matchingSkills = userSkills.filter(skill => 
    requiredSkills.some(reqSkill => 
      reqSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(reqSkill.toLowerCase())
    )
  );
  
  return Math.round((matchingSkills.length / requiredSkills.length) * 100);
}

export function getMatchConfidence(matchScore: number): MatchConfidence {
  if (matchScore >= 70) return 'high';
  if (matchScore >= 50) return 'medium';
  return 'low';
}

export function generateAIExplanation(
  matchingSkills: string[],
  missingSkills: string[],
  matchScore: number,
  language: 'en' | 'ar' | 'fr' | 'de' | 'uk' | 'es'
): string[] {
  const reasons: string[] = [];
  
  const explanations = {
    en: {
      skillMatch: (count: number) => `You have ${count} of the required skills for this position`,
      highOverlap: 'Your skill set closely aligns with the job requirements',
      mediumOverlap: 'You have relevant skills that match this position',
      experienceMatch: 'Your experience level matches the job requirements',
      growthPotential: 'This role offers good opportunities to learn missing skills',
      strongCandidate: 'You are a strong candidate based on your profile',
    },
    ar: {
      skillMatch: (count: number) => `لديك ${count} من المهارات المطلوبة لهذه الوظيفة`,
      highOverlap: 'مجموعة مهاراتك تتوافق بشكل وثيق مع متطلبات الوظيفة',
      mediumOverlap: 'لديك مهارات ذات صلة تتطابق مع هذه الوظيفة',
      experienceMatch: 'مستوى خبرتك يتطابق مع متطلبات الوظيفة',
      growthPotential: 'يوفر هذا الدور فرصًا جيدة لتعلم المهارات المفقودة',
      strongCandidate: 'أنت مرشح قوي بناءً على ملفك الشخصي',
    },
    fr: {
      skillMatch: (count: number) => `Vous avez ${count} des compétences requises pour ce poste`,
      highOverlap: 'Vos compétences correspondent étroitement aux exigences du poste',
      mediumOverlap: 'Vous avez des compétences pertinentes qui correspondent à ce poste',
      experienceMatch: 'Votre niveau d\'expérience correspond aux exigences du poste',
      growthPotential: 'Ce rôle offre de bonnes opportunités d\'apprendre les compétences manquantes',
      strongCandidate: 'Vous êtes un candidat solide d\'après votre profil',
    },
    de: {
      skillMatch: (count: number) => `Sie haben ${count} der erforderlichen Fähigkeiten für diese Position`,
      highOverlap: 'Ihre Fähigkeiten stimmen eng mit den Stellenanforderungen überein',
      mediumOverlap: 'Sie haben relevante Fähigkeiten, die zu dieser Position passen',
      experienceMatch: 'Ihr Erfahrungsniveau entspricht den Stellenanforderungen',
      growthPotential: 'Diese Rolle bietet gute Möglichkeiten, fehlende Fähigkeiten zu erlernen',
      strongCandidate: 'Sie sind ein starker Kandidat basierend auf Ihrem Profil',
    },
    uk: {
      skillMatch: (count: number) => `У вас є ${count} необхідних навичок для цієї позиції`,
      highOverlap: 'Ваші навички тісно відповідають вимогам до роботи',
      mediumOverlap: 'У вас є відповідні навички, які відповідають цій посаді',
      experienceMatch: 'Ваш рівень досвіду відповідає вимогам до роботи',
      growthPotential: 'Ця роль пропонує хороші можливості для вивчення відсутніх навичок',
      strongCandidate: 'Ви сильний кандидат на основі вашого профілю',
    },
    es: {
      skillMatch: (count: number) => `Tienes ${count} de las habilidades requeridas para este puesto`,
      highOverlap: 'Tus habilidades se alinean estrechamente con los requisitos del trabajo',
      mediumOverlap: 'Tienes habilidades relevantes que coinciden con este puesto',
      experienceMatch: 'Tu nivel de experiencia coincide con los requisitos del trabajo',
      growthPotential: 'Este rol ofrece buenas oportunidades para aprender habilidades faltantes',
      strongCandidate: 'Eres un candidato fuerte según tu perfil',
    },
  };

  const t = explanations[language] || explanations.en;

  if (matchingSkills.length > 0) {
    reasons.push(t.skillMatch(matchingSkills.length));
  }

  if (matchScore >= 80) {
    reasons.push(t.highOverlap);
    reasons.push(t.strongCandidate);
  } else if (matchScore >= 60) {
    reasons.push(t.mediumOverlap);
    reasons.push(t.experienceMatch);
  }

  if (missingSkills.length > 0 && missingSkills.length <= 2) {
    reasons.push(t.growthPotential);
  }

  return reasons;
}

export function calculateAIMatchDetails(
  userSkills: string[],
  requiredSkills: string[],
  language: 'en' | 'ar' | 'fr' | 'de' | 'uk' | 'es'
): AIMatchDetails {
  const matchScore = calculateAIMatchScore(userSkills, requiredSkills);
  const matchingSkills = userSkills.filter(skill => 
    requiredSkills.some(reqSkill => 
      reqSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(reqSkill.toLowerCase())
    )
  );
  const skillsMatched = matchingSkills.length;
  const skillsRequired = requiredSkills.length;
  const matchPercentage = skillsRequired > 0 
    ? Math.round((skillsMatched / skillsRequired) * 100)
    : 50;
  
  const confidence = getMatchConfidence(matchPercentage);
  
  const confidenceLabels = {
    en: { high: 'High Match', medium: 'Medium Match', low: 'Low Match' },
    ar: { high: 'تطابق عالي', medium: 'تطابق متوسط', low: 'تطابق منخفض' },
    fr: { high: 'Correspondance élevée', medium: 'Correspondance moyenne', low: 'Correspondance faible' },
    de: { high: 'Hohe Übereinstimmung', medium: 'Mittlere Übereinstimmung', low: 'Niedrige Übereinstimmung' },
    uk: { high: 'Висока відповідність', medium: 'Середня відповідність', low: 'Низька відповідність' },
    es: { high: 'Alta coincidencia', medium: 'Coincidencia media', low: 'Baja coincidencia' },
  };

  const confidenceLabel = (confidenceLabels[language] || confidenceLabels.en)[confidence];
  
  const missingSkills = requiredSkills.filter(skill => !matchingSkills.includes(skill));
  const reasons = generateAIExplanation(matchingSkills, missingSkills, matchPercentage, language);

  return {
    confidence,
    confidenceLabel,
    skillsMatched,
    skillsRequired,
    matchPercentage,
    reasons,
  };
}