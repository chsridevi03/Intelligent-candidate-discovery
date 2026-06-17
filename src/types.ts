export interface JobDescription {
  roleTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  education: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Remote' | 'Hybrid';
  additionalRequirements: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  location: string;
  education: string;
  experienceYears: number;
  technicalSkills: string[];
  projects: { title: string; description: string; technologies: string[] }[];
  certifications: string[];
  previousCompanies: string[];
  resumeSummary: string;
  isCustomUploaded?: boolean;
}

export interface EvaluationResult {
  rank: number;
  candidateId: string;
  candidateName: string;
  email: string;
  location: string;
  experienceYears: number;
  skillMatchPercentage: number;
  projectRelevanceScore: number;
  educationScore: number;
  certificationScore: number;
  locationScore: number;
  communicationScore: number;
  overallFitScore: number;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  keyStrengths: string;
  potentialGaps: string;
  
  // Explanation requirements
  topMatchingSkills: string[];
  missingSkills: string[];
  reasonForRanking: string;
  keyProjectHighlights: string;
  recruiterNotes: string;
  
  // Advanced features
  keywordStuffingDetected: boolean;
  transferableSkills: string[];
  leadershipPotential: boolean;
  fastLearningAbility: boolean;
  strongPortfolio: boolean;
  careerGrowthPrediction: string;
}

export interface HiringInsights {
  averageCandidateScore: number;
  topSkillFound: string;
  mostCommonMissingSkill: string;
  totalQualifiedCandidates: number;
  diversityOfSkillSets: number; // calculated as unique skills count / total candidates
}
