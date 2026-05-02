export interface RecommendationWeights {
  skills: number;
  language: number;
  experienceTraining: number;
  location: number;
  interestCategory: number;
  badges: number;
  text: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  languages: string[];
  skills: string[];
  learning: string[];
  experience: string[];
  location: string;
  badges: string[];
  interests: string[];
  preferredSectors: string[];
  preferredOpportunityTypes: string[];
  bio: string;
  summary: string;
  workModePreference: string;
}

export interface OpportunityProfile {
  id: string;
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredLanguages: string[];
  minimumExperience: number;
  trainingRequirements: string[];
  location: string;
  locationIsMandatory: boolean;
  companyDescription: string;
  jobDescription: string;
  category: string[];
  preferredBadges: string[];
  workMode: string;
  type: string;
  minimumRequiredSkillThreshold: number;
}

export interface HardFilterResult {
  passed: boolean;
  reasons: string[];
}

export interface ScoreBreakdown {
  structuredScore: number;
  textScore: number;
  candidateToJobScore: number;
  jobToCandidateScore: number;
  reciprocalScore: number;
  componentScores: {
    skills: number;
    language: number;
    experienceTraining: number;
    location: number;
    interestCategory: number;
    badges: number;
  };
  explanations: string[];
  hardFilterReasons: string[];
}

export interface RecommendationResult<TItem> {
  item: TItem;
  score: number;
  breakdown: ScoreBreakdown;
}

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  skills: 0.4,
  language: 0.15,
  experienceTraining: 0.15,
  location: 0.1,
  interestCategory: 0.1,
  badges: 0.05,
  text: 0.05,
};

// Shared normalization keeps the scoring engine portable between the frontend,
// the current edge-function backend, and a future ranker model.
const splitTokens = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);

const normalizeValue = (value: string) => value.trim().toLowerCase();

const uniqueNormalized = (values: Array<string | undefined | null>) => {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    if (!value) continue;
    const normalized = normalizeValue(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(value.trim());
  }

  return output;
};

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => (typeof entry === 'string' ? [entry] : []))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const overlapCount = (left: string[], right: string[]) => {
  if (left.length === 0 || right.length === 0) return 0;

  const normalizedRight = right.map(normalizeValue);
  return left.filter((leftValue) =>
    normalizedRight.some((rightValue) => {
      const normalizedLeft = normalizeValue(leftValue);
      return (
        normalizedLeft === rightValue ||
        normalizedLeft.includes(rightValue) ||
        rightValue.includes(normalizedLeft)
      );
    }),
  ).length;
};

const overlapRatio = (left: string[], right: string[]) => {
  if (right.length === 0) return left.length > 0 ? 1 : 0.5;
  return Math.min(1, overlapCount(left, right) / right.length);
};

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, current) => sum + current, 0) / values.length;
};

const buildText = (candidate: CandidateProfile, opportunity: OpportunityProfile) => ({
  candidateText: [
    candidate.bio,
    candidate.summary,
    candidate.skills.join(' '),
    candidate.learning.join(' '),
    candidate.experience.join(' '),
    candidate.interests.join(' '),
    candidate.preferredSectors.join(' '),
  ]
    .filter(Boolean)
    .join(' '),
  opportunityText: [
    opportunity.companyDescription,
    opportunity.jobDescription,
    opportunity.requiredSkills.join(' '),
    opportunity.preferredSkills.join(' '),
    opportunity.category.join(' '),
    opportunity.type,
  ]
    .filter(Boolean)
    .join(' '),
});

const computeTfIdfVector = (documents: string[]) => {
  const tokenized = documents.map(splitTokens);
  const vocabulary = Array.from(new Set(tokenized.flat()));
  const docFrequency = new Map<string, number>();

  for (const term of vocabulary) {
    const count = tokenized.filter((documentTokens) => documentTokens.includes(term)).length;
    docFrequency.set(term, count);
  }

  return tokenized.map((documentTokens) => {
    const vector = new Map<string, number>();
    const termCounts = new Map<string, number>();

    for (const token of documentTokens) {
      termCounts.set(token, (termCounts.get(token) || 0) + 1);
    }

    for (const term of vocabulary) {
      const tf = documentTokens.length === 0 ? 0 : (termCounts.get(term) || 0) / documentTokens.length;
      const df = docFrequency.get(term) || 1;
      const idf = Math.log((documents.length + 1) / (df + 1)) + 1;
      vector.set(term, tf * idf);
    }

    return vector;
  });
};

const cosineSimilarity = (left: Map<string, number>, right: Map<string, number>) => {
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (const [term, value] of left.entries()) {
    dotProduct += value * (right.get(term) || 0);
    leftMagnitude += value * value;
  }

  for (const value of right.values()) {
    rightMagnitude += value * value;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

export const normalizeCandidateProfile = (raw: any): CandidateProfile => {
  const explicitLanguages = toStringArray(raw.languages);
  const fallbackLanguage = typeof raw.language === 'string' ? [raw.language] : [];

  return {
    id: String(raw.id || raw.email || raw.name || `candidate-${Date.now()}`),
    name: raw.name || 'Candidate',
    languages: uniqueNormalized([...explicitLanguages, ...fallbackLanguage]),
    skills: uniqueNormalized(toStringArray(raw.skills)),
    learning: uniqueNormalized([
      ...toStringArray(raw.learning),
      ...toStringArray(raw.training),
      ...toStringArray(raw.completedTrainings),
    ]),
    experience: Array.isArray(raw.experience)
      ? raw.experience
          .map((item: any) => [item.position, item.company, item.description].filter(Boolean).join(' '))
          .filter(Boolean)
      : toStringArray(raw.experience),
    location: raw.location || '',
    badges: uniqueNormalized([
      ...toStringArray(raw.badges),
      ...toStringArray(raw.certificates),
      ...toStringArray(raw.certifications),
    ]),
    interests: uniqueNormalized(toStringArray(raw.interests)),
    preferredSectors: uniqueNormalized([
      ...toStringArray(raw.preferredSectors),
      ...toStringArray(raw.sectors),
    ]),
    preferredOpportunityTypes: uniqueNormalized([
      ...toStringArray(raw.preferredOpportunityTypes),
      ...toStringArray(raw.preferredJobTypes),
      ...toStringArray(raw.jobsOffered),
    ]),
    bio: raw.bio || '',
    summary: raw.summary || '',
    workModePreference: raw.workModePreference || raw.preferredWorkMode || 'flexible',
  };
};

export const normalizeOpportunityProfile = (raw: any): OpportunityProfile => ({
  id: String(raw.id || `${raw.company || 'company'}-${raw.title || 'opportunity'}`),
  title: raw.title || raw.jobTitle || 'Opportunity',
  company: raw.company || raw.organizationName || 'Company',
  requiredSkills: uniqueNormalized(toStringArray(raw.requiredSkills)),
  preferredSkills: uniqueNormalized(toStringArray(raw.preferredSkills)),
  requiredLanguages: uniqueNormalized([
    ...toStringArray(raw.requiredLanguages),
    ...toStringArray(raw.languageRequirements),
  ]),
  minimumExperience: Number(raw.minimumExperience || raw.minimumYearsExperience || 0),
  trainingRequirements: uniqueNormalized(toStringArray(raw.trainingRequirements)),
  location: raw.location || '',
  locationIsMandatory: Boolean(raw.locationIsMandatory || raw.location_is_mandatory),
  companyDescription: raw.companyDescription || raw.organizationDescription || '',
  jobDescription: raw.jobDescription || raw.description || '',
  category: uniqueNormalized([
    ...toStringArray(raw.category),
    ...toStringArray(raw.categories),
    ...toStringArray(raw.sector),
  ]),
  preferredBadges: uniqueNormalized([
    ...toStringArray(raw.preferredBadges),
    ...toStringArray(raw.preferredCertificates),
  ]),
  workMode: raw.workMode || raw.mode || 'onsite',
  type: raw.type || raw.apprenticeshipType || raw.jobType || '',
  minimumRequiredSkillThreshold: Number(raw.minimumRequiredSkillThreshold || (toStringArray(raw.requiredSkills).length > 0 ? 1 : 0)),
});

export const passesHardFilters = (candidate: CandidateProfile, opportunity: OpportunityProfile): HardFilterResult => {
  const reasons: string[] = [];

  if (
    opportunity.requiredLanguages.length > 0 &&
    overlapCount(candidate.languages, opportunity.requiredLanguages) < opportunity.requiredLanguages.length
  ) {
    reasons.push('Missing required language coverage');
  }

  if (
    opportunity.locationIsMandatory &&
    opportunity.location &&
    normalizeValue(candidate.location) !== normalizeValue(opportunity.location)
  ) {
    reasons.push('Mandatory location requirement not met');
  }

  if (
    overlapCount(candidate.skills, opportunity.requiredSkills) <
    opportunity.minimumRequiredSkillThreshold
  ) {
    reasons.push('Minimum required skills threshold not met');
  }

  return {
    passed: reasons.length === 0,
    reasons,
  };
};

// Structured scoring is intentionally feature-based so we can later swap the
// handcrafted weights for a learned ranking model without changing callers.
const experienceTrainingFit = (candidate: CandidateProfile, opportunity: OpportunityProfile) => {
  const experienceCount = candidate.experience.length;
  const experienceScore =
    opportunity.minimumExperience <= 0
      ? experienceCount > 0 ? 1 : 0.5
      : Math.min(1, experienceCount / opportunity.minimumExperience);

  const trainingScore = overlapRatio(candidate.learning, opportunity.trainingRequirements);
  if (opportunity.trainingRequirements.length === 0) return experienceScore;
  return average([experienceScore, trainingScore]);
};

const locationFit = (candidate: CandidateProfile, opportunity: OpportunityProfile) => {
  if (opportunity.workMode.toLowerCase() === 'remote') return 1;
  if (!candidate.location || !opportunity.location) return 0.5;

  const candidateLocation = normalizeValue(candidate.location);
  const opportunityLocation = normalizeValue(opportunity.location);
  if (candidateLocation === opportunityLocation) return 1;
  if (candidateLocation.includes(opportunityLocation) || opportunityLocation.includes(candidateLocation)) return 0.85;
  if (opportunity.workMode.toLowerCase() === 'hybrid') return 0.6;
  return 0;
};

const preferenceFit = (candidate: CandidateProfile, opportunity: OpportunityProfile) => {
  const sectorPool = uniqueNormalized([
    ...candidate.interests,
    ...candidate.preferredSectors,
    ...candidate.preferredOpportunityTypes,
  ]);
  const opportunityPool = uniqueNormalized([
    ...opportunity.category,
    opportunity.type,
  ]);

  return overlapRatio(sectorPool, opportunityPool);
};

export const computeStructuredScore = (
  candidate: CandidateProfile,
  opportunity: OpportunityProfile,
  weights: RecommendationWeights,
) => {
  const requiredSkillScore = overlapRatio(candidate.skills, opportunity.requiredSkills);
  const preferredSkillScore = opportunity.preferredSkills.length > 0
    ? overlapRatio(candidate.skills, opportunity.preferredSkills)
    : requiredSkillScore;
  const skillsScore = average([requiredSkillScore, preferredSkillScore]);
  const languageScore = overlapRatio(candidate.languages, opportunity.requiredLanguages);
  const experienceTrainingScore = experienceTrainingFit(candidate, opportunity);
  const locationScore = locationFit(candidate, opportunity);
  const interestCategoryScore = preferenceFit(candidate, opportunity);
  const badgesScore = overlapRatio(candidate.badges, opportunity.preferredBadges);

  const structuredScore =
    weights.skills * skillsScore +
    weights.language * languageScore +
    weights.experienceTraining * experienceTrainingScore +
    weights.location * locationScore +
    weights.interestCategory * interestCategoryScore +
    weights.badges * badgesScore;

  return {
    structuredScore,
    componentScores: {
      skills: skillsScore,
      language: languageScore,
      experienceTraining: experienceTrainingScore,
      location: locationScore,
      interestCategory: interestCategoryScore,
      badges: badgesScore,
    },
  };
};

export const computeTextSimilarity = (candidate: CandidateProfile, opportunity: OpportunityProfile) => {
  const { candidateText, opportunityText } = buildText(candidate, opportunity);
  const [candidateVector, opportunityVector] = computeTfIdfVector([candidateText, opportunityText]);
  return cosineSimilarity(candidateVector, opportunityVector);
};

export const computeCandidateToJobScore = (
  candidate: CandidateProfile,
  opportunity: OpportunityProfile,
  weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
) => {
  const hardFilter = passesHardFilters(candidate, opportunity);
  if (!hardFilter.passed) {
    return {
      score: 0,
      structuredScore: 0,
      textScore: 0,
      componentScores: {
        skills: 0,
        language: 0,
        experienceTraining: 0,
        location: 0,
        interestCategory: 0,
        badges: 0,
      },
      hardFilterReasons: hardFilter.reasons,
    };
  }

  const { structuredScore, componentScores } = computeStructuredScore(candidate, opportunity, weights);
  const textScore = computeTextSimilarity(candidate, opportunity);

  return {
    score: structuredScore + weights.text * textScore,
    structuredScore,
    textScore,
    componentScores,
    hardFilterReasons: [] as string[],
  };
};

export const computeJobToCandidateScore = (
  opportunity: OpportunityProfile,
  candidate: CandidateProfile,
  weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
) => computeCandidateToJobScore(candidate, opportunity, weights);

export const generateMatchExplanations = (
  candidate: CandidateProfile,
  opportunity: OpportunityProfile,
  componentScores: ScoreBreakdown['componentScores'],
) => {
  const explanations: string[] = [];

  if (componentScores.skills >= 0.7 && componentScores.language >= 0.7) {
    explanations.push('Matched on skills and language');
  }

  if (componentScores.experienceTraining >= 0.7) {
    const trainingHighlight = opportunity.trainingRequirements[0] || candidate.learning[0];
    explanations.push(
      trainingHighlight
        ? `Good fit based on ${trainingHighlight.toLowerCase()} experience and training`
        : 'Strong experience and training fit',
    );
  }

  if (componentScores.location >= 0.7 && componentScores.interestCategory >= 0.6) {
    explanations.push('Strong location and apprenticeship category fit');
  }

  if (componentScores.badges >= 0.6) {
    explanations.push('Relevant badges or certificates strengthen this match');
  }

  if (explanations.length === 0) {
    explanations.push(`Potential fit for ${opportunity.title} based on profile alignment`);
  }

  return explanations.slice(0, 3);
};

export const computeReciprocalMatchScore = (
  candidateInput: CandidateProfile | any,
  opportunityInput: OpportunityProfile | any,
  weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
) => {
  const candidate = 'skills' in candidateInput && 'languages' in candidateInput
    ? candidateInput as CandidateProfile
    : normalizeCandidateProfile(candidateInput);
  const opportunity = 'requiredSkills' in opportunityInput && 'requiredLanguages' in opportunityInput
    ? opportunityInput as OpportunityProfile
    : normalizeOpportunityProfile(opportunityInput);

  const candidateToJob = computeCandidateToJobScore(candidate, opportunity, weights);
  const jobToCandidate = computeJobToCandidateScore(opportunity, candidate, weights);

  // Reciprocal scoring rewards pairs that look strong from both sides.
  if (candidateToJob.score === 0 || jobToCandidate.score === 0) {
    return {
      score: 0,
      breakdown: {
        structuredScore: candidateToJob.structuredScore,
        textScore: candidateToJob.textScore,
        candidateToJobScore: candidateToJob.score,
        jobToCandidateScore: jobToCandidate.score,
        reciprocalScore: 0,
        componentScores: candidateToJob.componentScores,
        explanations: [],
        hardFilterReasons: candidateToJob.hardFilterReasons,
      } satisfies ScoreBreakdown,
    };
  }

  const reciprocalScore = Math.sqrt(candidateToJob.score * jobToCandidate.score);
  return {
    score: reciprocalScore,
    breakdown: {
      structuredScore: candidateToJob.structuredScore,
      textScore: candidateToJob.textScore,
      candidateToJobScore: candidateToJob.score,
      jobToCandidateScore: jobToCandidate.score,
      reciprocalScore,
      componentScores: candidateToJob.componentScores,
      explanations: generateMatchExplanations(candidate, opportunity, candidateToJob.componentScores),
      hardFilterReasons: [],
    } satisfies ScoreBreakdown,
  };
};

export const recommendOpportunitiesForCandidate = <TItem extends any>(
  candidateInput: CandidateProfile | any,
  allOpportunities: TItem[],
  weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
  topK = 5,
): RecommendationResult<TItem>[] => {
  const candidate = 'skills' in candidateInput && 'languages' in candidateInput
    ? candidateInput as CandidateProfile
    : normalizeCandidateProfile(candidateInput);

  return allOpportunities
    .map((opportunity) => {
      const normalizedOpportunity = normalizeOpportunityProfile(opportunity);
      const result = computeReciprocalMatchScore(candidate, normalizedOpportunity, weights);
      return {
        item: opportunity,
        score: result.score,
        breakdown: result.breakdown,
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
};

export const recommendCandidatesForOpportunity = <TItem extends any>(
  opportunityInput: OpportunityProfile | any,
  allCandidates: TItem[],
  weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
  topK = 5,
): RecommendationResult<TItem>[] => {
  const opportunity = 'requiredSkills' in opportunityInput && 'requiredLanguages' in opportunityInput
    ? opportunityInput as OpportunityProfile
    : normalizeOpportunityProfile(opportunityInput);

  return allCandidates
    .map((candidate) => {
      const normalizedCandidate = normalizeCandidateProfile(candidate);
      const result = computeReciprocalMatchScore(normalizedCandidate, opportunity, weights);
      return {
        item: candidate,
        score: result.score,
        breakdown: result.breakdown,
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
};

export const recommendationFeatureVector = (
  candidateInput: CandidateProfile | any,
  opportunityInput: OpportunityProfile | any,
) => {
  const candidate = 'skills' in candidateInput && 'languages' in candidateInput
    ? candidateInput as CandidateProfile
    : normalizeCandidateProfile(candidateInput);
  const opportunity = 'requiredSkills' in opportunityInput && 'requiredLanguages' in opportunityInput
    ? opportunityInput as OpportunityProfile
    : normalizeOpportunityProfile(opportunityInput);
  const { componentScores } = computeStructuredScore(candidate, opportunity, DEFAULT_RECOMMENDATION_WEIGHTS);
  const textScore = computeTextSimilarity(candidate, opportunity);

  return {
    candidateId: candidate.id,
    opportunityId: opportunity.id,
    ...componentScores,
    textScore,
  };
};
