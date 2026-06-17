import express from "express";
import path from "path";
import multer from "multer";
import * as XLSX from "xlsx";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Candidate, EvaluationResult, HiringInsights, JobDescription } from "./src/types";

// Load environment variables (Vite or system injection)
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure Multer for resume uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. System will fall back to local scoring if required.");
}

// Global state in-memory database
let jobDescription: JobDescription = {
  roleTitle: "Senior Full-Stack Engineer",
  requiredSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"],
  preferredSkills: ["Docker", "AWS", "Tailwind CSS", "Redis"],
  minExperience: 5,
  education: "Bachelor's in Computer Science or equivalent",
  location: "San Francisco, CA",
  employmentType: "Remote",
  additionalRequirements: "Must have experience building scale APIs, robust databases, and modular frontends.",
};

const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: "CAN-001",
    name: "Emily Watson",
    email: "emily.watson@enterprise.io",
    location: "Seattle, WA",
    education: "Master of Science in Software Engineering, University of Washington",
    experienceYears: 6,
    technicalSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Tailwind CSS", "AWS", "GraphQL", "Jest", "Git"],
    projects: [
      {
        title: "Scale Fintech Transaction Dashboard",
        description: "Built high-performance financial graphing board integrating secure third-party billing APIs, with full transaction validation.",
        technologies: ["React", "TypeScript", "Tailwind CSS", "GraphQL"]
      },
      {
        title: "Real-time Operations Workflows",
        description: "Engineered scalable service management loops using Express WebSockets and PostgreSQL indexing for live queue updates.",
        technologies: ["Node.js", "Express", "PostgreSQL"]
      }
    ],
    certifications: ["AWS Solutions Architect - Associate", "Professional Scrum Master (PSM I)"],
    previousCompanies: ["Stripe", "Microsoft", "SeedCloud"],
    resumeSummary: "Highly analytical and performance-focused Senior Full-Stack Developer with 6 years of experience. Expert in designing structured React SPAs, designing fast database models, and provisioning secure server solutions.",
  },
  {
    id: "CAN-002",
    name: "David Chen",
    email: "d.chen@backendpro.net",
    location: "San Francisco, CA",
    experienceYears: 10,
    education: "Bachelor of Science in Electrical Engineering, UC Berkeley",
    technicalSkills: ["Node.js", "Express", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "Linux", "Python", "Go", "AWS", "Git"],
    projects: [
      {
        title: "Cloud Infrastructure Re-architecture",
        description: "Migrated a legacy storage cluster into optimized PostgreSQL databases with Redis cache caching, slashing latency by 45%.",
        technologies: ["PostgreSQL", "Redis", "Docker", "AWS"]
      },
      {
        title: "Microservices Messaging Gateway",
        description: "Designed a high-throughput event pub-sub pipeline dealing with millions of API transactions per hour in Go.",
        technologies: ["Go", "Kubernetes", "Linux"]
      }
    ],
    certifications: ["AWS Certified Cloud Practitioner"],
    previousCompanies: ["Uber", "HashiCorp", "Twilio"],
    resumeSummary: "Principal Software Engineer specializing in scalable server solutions, database optimization, and cloud operations. Over 10 years building resilient system architectures and continuous delivery tools.",
  },
  {
    id: "CAN-003",
    name: "Sarah Jenkins",
    email: "sarah.j@devnet.co",
    location: "San Francisco, CA",
    education: "Bachelor of Science in Computer Science, Stanford University",
    experienceYears: 7,
    technicalSkills: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "HTML5", "CSS3", "Node.js", "Express", "PostgreSQL", "Git", "Figma"],
    projects: [
      {
        title: "Modular Enterprise Design System",
        description: "Authored a component library in React/Tailwind used across 4 internal business units, increasing frontend velocity.",
        technologies: ["React", "TypeScript", "Tailwind CSS"]
      },
      {
        title: "Express Content Indexer API",
        description: "Configured API layers indexing complex media structures on top of PostgreSQL, with smart cache validations.",
        technologies: ["Node.js", "Express", "PostgreSQL"]
      }
    ],
    certifications: ["AWS Certified Developer - Associate"],
    previousCompanies: ["Salesforce", "Slack", "Webflow"],
    resumeSummary: "Lead Frontend Engineer with extensive backend competence. Dedicated to creating fluid user layouts, enforcing design-system guidelines, and building type-safe APIs using TypeScript.",
  },
  {
    id: "CAN-004",
    name: "Maria Rodriguez",
    email: "maria.rod@codespaces.org",
    location: "Austin, TX",
    education: "Bachelor of Science in Web Design & Development, University of Texas",
    experienceYears: 4,
    technicalSkills: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "Jest", "HTML5", "CSS3", "SASS", "Git", "UI/UX Design"],
    projects: [
      {
        title: "Interactive Client Scheduling Dashboard",
        description: "Crafted interactive calendaring software featuring drag-and-drop slots, real-time client indicators, and fluid responsiveness.",
        technologies: ["React", "TypeScript", "Tailwind CSS"]
      },
      {
        title: "Automated Checkout Flow Improvements",
        description: "Modernized checkout funnels, increasing end-converter checkouts by 12% across responsive screen formats.",
        technologies: ["React", "Jest"]
      }
    ],
    certifications: ["Certified UI/UX Designer Accredit", "Certified Scrum Developer (CSD)"],
    previousCompanies: ["HomeAway", "BigCommerce"],
    resumeSummary: "Highly motivated Mid-level Frontend Developer specializing in clean React components and modern CSS utilities. Passionate about beautiful state structures and delightful user interactions.",
  },
  {
    id: "CAN-005",
    name: "Raj Patel",
    email: "raj.patel@keywordstack.io",
    location: "New York, NY",
    education: "Bachelor of Computer Applications, IGNOU University",
    experienceYears: 8,
    technicalSkills: [
      "React", "React", "React", "ReactJS", "React.JS",
      "TypeScript", "TypeScript", "TypeScript", "TS",
      "Node.js", "Node.js", "Node", "Node JS",
      "Express", "Express", "Express.js",
      "PostgreSQL", "PostgreSQL", "Postgres", "SQL", "SQL Server",
      "AWS", "AWS Cloud", "Docker", "Docker Dev"
    ],
    projects: [
      {
        title: "React TypeScript Node Express PostgreSQL Project",
        description: "Developed React React React system with TypeScript TypeScript TypeScript using Express Node.js and PostgreSQL SQL SQL database layers.",
        technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"]
      }
    ],
    certifications: ["Certified React Master Badge"],
    previousCompanies: ["KeywordTech", "StandardDev"],
    resumeSummary: "Expert React developer focusing on React React React, TypeScript TypeScript TypeScript, Node Node Node, Express Express, PostgreSQL PostgreSQL, AWS AWS Cloud Docker Docker. Specializes in intensive React programming, React state setup, React grids, and React styling.",
  },
  {
    id: "CAN-006",
    name: "Alex Mercer",
    email: "alex.mercer@juniordev.net",
    location: "Boston, MA",
    education: "Self-trained Career Bootcamper, TechAcademy Graduate",
    experienceYears: 2,
    technicalSkills: ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Git", "GitHub", "Vercel"],
    projects: [
      {
        title: "Micro Task Organizer",
        description: "Assembled a basic client side Todo planner with task prioritization toggles and search capabilities on local storage.",
        technologies: ["React", "Tailwind CSS"]
      },
      {
        title: "Static Retail Store Showcase",
        description: "Created landing page structures for a dummy store promoting interactive search toggling.",
        technologies: ["JavaScript", "CSS3"]
      }
    ],
    certifications: ["freeCodeCamp Responsive CSS Certification"],
    previousCompanies: ["Local Agency Hub"],
    resumeSummary: "Creative entry-level web builder with 2 years of practical experience. Focuses on drafting clean UI, applying responsive grids, and deploying modular React codebases.",
  }
];

let candidates: Candidate[] = JSON.parse(JSON.stringify(DEFAULT_CANDIDATES));
let latestEvaluations: EvaluationResult[] = [];

// Local Deterministic Scoring Fallback
function runLocalScoringMatch(job: JobDescription, candidate: Candidate, index: number): EvaluationResult {
  // Normalize skills
  const normalizedJobReqs = job.requiredSkills.map(s => s.toLowerCase());
  const normalizedJobPrefs = job.preferredSkills.map(s => s.toLowerCase());
  const normalizedCandSkills = candidate.technicalSkills.map(s => s.toLowerCase());

  // Check keyword stuffing (very primitive detection)
  // Check if any word is repeated more than 3 times in technicalSkills
  const originalSkillCount = technicalSkillsDuplicateCount(candidate.technicalSkills);
  const keywordStuffingDetected = originalSkillCount > 3 || candidate.resumeSummary.toLowerCase().match(/react/g)?.length! > 8;

  // 1. Skill Match (40%)
  const matchesRequired = normalizedJobReqs.filter(s => 
    normalizedCandSkills.some(cs => cs.includes(s) || s.includes(cs))
  );
  const matchesPreferred = normalizedJobPrefs.filter(s => 
    normalizedCandSkills.some(cs => cs.includes(s) || s.includes(cs))
  );

  const reqScore = matchesRequired.length / (normalizedJobReqs.length || 1);
  const prefScore = matchesPreferred.length / (normalizedJobPrefs.length || 1);
  let skillMatchPercentage = Math.round((reqScore * 0.8 + prefScore * 0.2) * 100);

  // Apply keyword stuffing penalty
  if (keywordStuffingDetected) {
    skillMatchPercentage = Math.max(0, skillMatchPercentage - 35);
  }

  // 2. Experience Match (20%)
  let experienceScore = 0;
  if (candidate.experienceYears >= job.minExperience) {
    experienceScore = 100;
    // Extra incentive for relevant longevity
    const delta = candidate.experienceYears - job.minExperience;
    experienceScore = Math.min(100, 100 + delta * 3);
  } else {
    experienceScore = Math.round((candidate.experienceYears / (job.minExperience || 1)) * 100);
  }

  // 3. Projects Relevance (15%)
  let projectRelevanceScore = 50; // base
  const projectTechCombined = candidate.projects.map(p => p.technologies.join(" ").toLowerCase()).join(" ");
  const matchProjCount = normalizedJobReqs.filter(s => projectTechCombined.includes(s)).length;
  projectRelevanceScore = Math.min(100, 50 + (matchProjCount * 12));

  // 4. Education Match (10%)
  let educationScore = 60; // baseline
  const candEdu = candidate.education.toLowerCase();
  const jobEdu = job.education.toLowerCase();
  if (candEdu.includes("master") || candEdu.includes("ms ") || candEdu.includes("m.s.")) {
    educationScore = 100;
  } else if (candEdu.includes("bachelor") || candEdu.includes("bs ") || candEdu.includes("b.s.") || candEdu.includes("degree")) {
    educationScore = 90;
  } else if (candEdu.includes("bootcamp") || candEdu.includes("academy") || candEdu.includes("self-taught")) {
    educationScore = 75;
  }

  // 5. Certifications (5%)
  let certificationScore = 50;
  if (candidate.certifications.length > 1) {
    certificationScore = 100;
  } else if (candidate.certifications.length === 1) {
    certificationScore = 85;
  } else {
    certificationScore = 40;
  }

  // 6. Location Compatibility (5%)
  let locationScore = 60;
  const candLoc = candidate.location.toLowerCase();
  const jobLoc = job.location.toLowerCase();
  if (job.employmentType.toLowerCase() === "remote") {
    locationScore = 100; // location doesn't matter for remote roles
  } else if (candLoc.includes(jobLoc) || jobLoc.includes(candLoc)) {
    locationScore = 100;
  } else {
    locationScore = 50; // virtual remote boundary
  }

  // 7. Communication Score / Resume Quality (5%)
  let communicationScore = 85;
  if (keywordStuffingDetected) {
    communicationScore = 40; // poor writing structure
  }

  // Overall Score Calculation (Weighted Total)
  const overallWeightTotal = 
    (skillMatchPercentage * 40 +
    experienceScore * 20 +
    projectRelevanceScore * 15 +
    educationScore * 10 +
    certificationScore * 5 +
    locationScore * 5 +
    communicationScore * 5) / 100;
    
  const overallFitScore = Math.round(overallWeightTotal);

  // Recommendations mapping
  let recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended' = 'Consider';
  if (overallFitScore >= 85) {
    recommendation = 'Highly Recommended';
  } else if (overallFitScore >= 70) {
    recommendation = 'Recommended';
  } else if (overallFitScore >= 50) {
    recommendation = 'Consider';
  } else {
    recommendation = 'Not Recommended';
  }

  // Gaps & Strengths definitions
  const missing = normalizedJobReqs.filter(s => !normalizedCandSkills.includes(s));
  const hasStrongPortfolio = candidate.projects.length >= 2;
  const hasLeadership = candidate.experienceYears >= 7 || candEdu.includes("master");

  let keyStrengths = `Strong background in engineering workflows.`;
  if (skillMatchPercentage > 80) keyStrengths = `Outstanding semantic skill alignment in critical technologies like ${matchesRequired.slice(0, 3).join(", ")}.`;
  else if (experienceScore >= 95) keyStrengths = `Extensive corporate industry pedigree spanning dev operations and system design.`;

  let potentialGaps = `No severe gaps identified.`;
  if (missing.length > 1) {
    potentialGaps = `Incomplete alignment. Outstanding technologies: ${missing.slice(0, 3).join(", ")}.`;
  } else if (experienceScore < 70) {
    potentialGaps = `Experience tenure is slightly under preferred enterprise threshold limits.`;
  }

  const transferableSkills = ["Agile cooperation", "Problem analytics", "System abstraction"];
  if (normalizedCandSkills.includes("figma") || normalizedCandSkills.includes("design")) {
    transferableSkills.push("Interactive systems styling");
  }

  return {
    rank: index + 1,
    candidateId: candidate.id,
    candidateName: candidate.name,
    email: candidate.email,
    location: candidate.location,
    experienceYears: candidate.experienceYears,
    skillMatchPercentage,
    projectRelevanceScore,
    educationScore,
    certificationScore,
    locationScore,
    communicationScore,
    overallFitScore,
    recommendation,
    keyStrengths,
    potentialGaps,
    topMatchingSkills: matchesRequired.length > 0 ? matchesRequired : [candidate.technicalSkills[0] || "None"],
    missingSkills: missing.length > 0 ? missing : ["None"],
    reasonForRanking: `Evaluated score of ${overallFitScore} based on technical analysis.`,
    keyProjectHighlights: candidate.projects.map(p => p.title).join(", "),
    recruiterNotes: `This candidate possesses interesting software history and provides solid fit patterns.`,
    keywordStuffingDetected,
    transferableSkills,
    leadershipPotential: hasLeadership,
    fastLearningAbility: overallFitScore > 75,
    strongPortfolio: hasStrongPortfolio,
    careerGrowthPrediction: candidate.experienceYears > 6 ? "Promotable to architect within his first year" : "Solid trajectory to senior engineer role."
  };
}

function technicalSkillsDuplicateCount(skills: string[]): number {
  const counts: Record<string, number> = {};
  let duplicates = 0;
  for (const s of skills) {
    const norm = s.toLowerCase().trim();
    counts[norm] = (counts[norm] || 0) + 1;
    if (counts[norm] > 2) duplicates++;
  }
  return duplicates;
}

// REST endpoints
app.get("/api/job-description", (req, res) => {
  res.json(jobDescription);
});

app.post("/api/job-description", (req, res) => {
  jobDescription = { ...jobDescription, ...req.body };
  res.json({ message: "Job Description updated successfully.", jobDescription });
});

app.get("/api/candidates", (req, res) => {
  res.json(candidates);
});

app.post("/api/candidates", (req, res) => {
  const newCandidate: Candidate = {
    id: `CAN-${String(candidates.length + 1).padStart(3, "0")}`,
    name: req.body.name || "Unnamed Candidate",
    email: req.body.email || "hello@talent.io",
    location: req.body.location || "San Francisco, CA",
    education: req.body.education || "Bachelor's in Applied Computing",
    experienceYears: Number(req.body.experienceYears) || 0,
    technicalSkills: Array.isArray(req.body.technicalSkills) ? req.body.technicalSkills : (req.body.technicalSkills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
    projects: req.body.projects || [],
    certifications: Array.isArray(req.body.certifications) ? req.body.certifications : (req.body.certifications || "").split(",").map((s: string) => s.trim()).filter(Boolean),
    previousCompanies: Array.isArray(req.body.previousCompanies) ? req.body.previousCompanies : (req.body.previousCompanies || "").split(",").map((s: string) => s.trim()).filter(Boolean),
    resumeSummary: req.body.resumeSummary || "",
    isCustomUploaded: true,
  };
  candidates.push(newCandidate);
  res.json({ message: "Candidate added manually.", candidate: newCandidate });
});

app.delete("/api/candidates/:id", (req, res) => {
  const idToDelete = req.params.id;
  candidates = candidates.filter(c => c.id !== idToDelete);
  latestEvaluations = latestEvaluations.filter(e => e.candidateId !== idToDelete);
  res.json({ message: "Candidate removed successfully.", candidates });
});

app.post("/api/candidates/reset", (req, res) => {
  candidates = JSON.parse(JSON.stringify(DEFAULT_CANDIDATES));
  latestEvaluations = [];
  res.json({ message: "Candidates and jobs reset to corporate defaults.", candidates });
});

app.post("/api/parse-resume", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No resume file uploaded." });
  }

  const mimeType = req.file.mimetype;
  const fileName = req.file.originalname;

  try {
    let parsedData: any = null;

    if (ai) {
      const fileBuffer = req.file.buffer;
      const base64Data = fileBuffer.toString("base64");

      // Set system instructions and schema
      const promptText = `
        You are an advanced AI resume parser. Parse this resume and return details in the matching JSON structure.
        Name of file is: ${fileName}.
        
        Ensure you extract fields carefully.
        Make sure you split technical skills into individual items in an array.
        Extract project titles, summaries, and tech keys correctly.
        Extract education details, experienceYears (as a number), and previous companies correctly.
      `;

      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: promptText },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                location: { type: Type.STRING },
                education: { type: Type.STRING },
                experienceYears: { type: Type.INTEGER },
                technicalSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      technologies: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["title", "description", "technologies"],
                  },
                },
                certifications: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                previousCompanies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                resumeSummary: { type: Type.STRING },
              },
              required: [
                "name",
                "email",
                "location",
                "education",
                "experienceYears",
                "technicalSkills",
                "projects",
                "certifications",
                "previousCompanies",
                "resumeSummary",
              ],
            },
          },
        });

        if (result.text) {
          parsedData = JSON.parse(result.text.trim());
        }
      } catch (geminiErr: any) {
        console.error("Gemini parse failed, falling back to basic text parsing.", geminiErr);
      }
    }

    // Basic fallbacks if AI fails or isn't enabled
    if (!parsedData) {
      const textContent = req.file.buffer.toString("utf-8");
      // Use regex/basic string extraction
      parsedData = parseResumeBasicText(textContent, fileName);
    }

    const newCandidate: Candidate = {
      id: `CAN-${String(candidates.length + 1).padStart(3, "0")}`,
      name: parsedData.name || "Parsed Candidate",
      email: parsedData.email || "applicant@talent.io",
      location: parsedData.location || "San Francisco, CA",
      education: parsedData.education || "Extracted Education Detail",
      experienceYears: Number(parsedData.experienceYears) || 3,
      technicalSkills: parsedData.technicalSkills || ["Docker", "Kubernetes", "TypeScript"],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      previousCompanies: parsedData.previousCompanies || [],
      resumeSummary: parsedData.resumeSummary || "Auto-parsed candidate resume detail.",
      isCustomUploaded: true,
    };

    candidates.push(newCandidate);
    res.json({ message: "Resume parsed and candidate added.", candidate: newCandidate });
  } catch (err: any) {
    console.error("Critical parsing error: ", err);
    res.status(500).json({ error: "Critical parsing failure: " + err.message });
  }
});

function parseResumeBasicText(text: string, fileName: string): any {
  // A clean, simple fallback parser that reads lines to extract basic parts
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const nameLine = lines[0] || fileName.replace(/\.[^/.]+$/, "");
  
  let email = "parsed.candidate@recruitment.com";
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const matchEmail = text.match(emailRegex);
  if (matchEmail) email = matchEmail[0];

  let skills = ["React", "TypeScript", "Node.js"];
  if (text.toLowerCase().includes("python")) skills.push("Python");
  if (text.toLowerCase().includes("database") || text.toLowerCase().includes("postgres")) skills.push("PostgreSQL");

  return {
    name: nameLine.length < 40 ? nameLine : "Resume Candidate Profile",
    email,
    location: "USA (Remote Ready)",
    education: "Bachelor's Degree in Science",
    experienceYears: 4,
    technicalSkills: skills,
    projects: [
      {
        title: "Disclosed Resume Project",
        description: "Assigned project details as indexed from raw document parse.",
        technologies: skills.slice(0, 2),
      },
    ],
    certifications: ["Professional Accredit"],
    previousCompanies: ["External Vendor Service"],
    resumeSummary: text.slice(0, 300) + "...",
  };
}

// Running Evaluation
app.post("/api/evaluate", async (req, res) => {
  try {
    const evaluations: EvaluationResult[] = [];
    
    if (ai) {
      console.log("Running matching evaluation using Gemini...");
      const promises = candidates.map(async (candidate) => {
        const prompt = `
          You are an elite enterprise-level Recruitment Intelligent system.
          Evaluate candidate "${candidate.name}" against Job Description "${jobDescription.roleTitle}".

          Job Description:
          - Title: ${jobDescription.roleTitle}
          - Required Skills: ${jobDescription.requiredSkills.join(", ")}
          - Preferred Skills: ${jobDescription.preferredSkills.join(", ")}
          - Min Experience: ${jobDescription.minExperience} years
          - Education: ${jobDescription.education}
          - Location: ${jobDescription.location}
          - Type: ${jobDescription.employmentType}
          - Additional Required Workflows: ${jobDescription.additionalRequirements}

          Candidate Profile:
          - Name: ${candidate.name}
          - Skills: ${candidate.technicalSkills.join(", ")}
          - Exp Years: ${candidate.experienceYears}
          - Education: ${candidate.education}
          - Location: ${candidate.location}
          - Certs: ${candidate.certifications.join(", ")}
          - Summary: ${candidate.resumeSummary}
          - Projects: ${JSON.stringify(candidate.projects)}

          Calculate precise ratings 0-100 for each index based on strict corporate recruitment values:
          1. Skill Match = 40% (Assess required/preferred skills. Check if their skills semantically fit.)
          2. Experience Match = 20% (Compare candidate's experienceYears with minExperience. Reward higher relevant years.)
          3. Projects Relevance = 15% (Are they working on similar tech stack/projects described?)
          4. Education Match = 10% (Does it align with requested education?)
          5. Certifications = 5% (Check cloud certs or agile training.)
          6. Location Compatibility = 5% (Alignment for geography/remote requirements.)
          7. Communication/Resume Quality = 5% (Evaluate wording structure, details.)

          CRITICAL keyword stuffing check: Does technicalSkills duplicate equivalent entries excessively to trick filters? (e.g., repeating "React" or "TypeScript" multiple times, like candidate CAN-005 Raj Patel). If yes, flag "keywordStuffingDetected" as true and immediately dock overall score and skill match score significantly.

          Provide output in JSON format with the following exact keys:
          {
            "skillMatchPercentage": number,
            "projectRelevanceScore": number,
            "educationScore": number,
            "certificationScore": number,
            "locationScore": number,
            "communicationScore": number,
            "overallFitScore": number,
            "recommendation": "Highly Recommended" | "Recommended" | "Consider" | "Not Recommended",
            "keyStrengths": "string description",
            "potentialGaps": "string description",
            "topMatchingSkills": ["array"],
            "missingSkills": ["array"],
            "reasonForRanking": "string",
            "keyProjectHighlights": "string",
            "recruiterNotes": "string",
            "keywordStuffingDetected": boolean,
            "transferableSkills": ["array"],
            "leadershipPotential": boolean,
            "fastLearningAbility": boolean,
            "strongPortfolio": boolean,
            "careerGrowthPrediction": "string"
          }
        `;

        try {
          const response = await ai!.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1, // low temperature for consistent evaluation scores
            },
          });

          if (response.text) {
            const result = JSON.parse(response.text.trim());
            return {
              ...result,
              candidateId: candidate.id,
              candidateName: candidate.name,
              email: candidate.email,
              location: candidate.location,
              experienceYears: candidate.experienceYears,
            };
          }
        } catch (itemErr) {
          console.error(`Gemini matched eval failed for ${candidate.name}, using local fallback:`, itemErr);
        }
        
        // Items fallback inside Gemini map loop
        return runLocalScoringMatch(jobDescription, candidate, 1);
      });

      const resolved = await Promise.all(promises);
      // Sort and assign Rank
      resolved.sort((a, b) => b.overallFitScore - a.overallFitScore);
      latestEvaluations = resolved.map((e, index) => ({
        ...e,
        rank: index + 1,
      }));
    } else {
      // Deterministic offline algorithm
      console.log("No Gemini API connection, executing deterministic scoring engine...");
      const scores = candidates.map((candidate, i) => runLocalScoringMatch(jobDescription, candidate, i));
      scores.sort((a, b) => b.overallFitScore - a.overallFitScore);
      latestEvaluations = scores.map((e, index) => ({
        ...e,
        rank: index + 1,
      }));
    }

    res.json({ message: "Analysis completed successfully.", evaluations: latestEvaluations });
  } catch (err: any) {
    console.error("Evaluation runtime fail:", err);
    res.status(500).json({ error: "Failed to perform valuation: " + err.message });
  }
});

// CSV Exports
app.get("/api/export/csv", (req, res) => {
  const evaluations = latestEvaluations.length > 0 ? latestEvaluations : candidates.map((c, idx) => runLocalScoringMatch(jobDescription, c, idx));
  evaluations.sort((a, b) => b.overallFitScore - a.overallFitScore);

  let csvContent = "Rank,Candidate_ID,Candidate_Name,Email,Location,Experience_Years,Skill_Match_Percentage,Overall_Fit_Score,Recommendation\n";
  
  evaluations.forEach((ev, idx) => {
    csvContent += `${idx + 1},"${ev.candidateId}","${ev.candidateName}","${ev.email}","${ev.location}",${ev.experienceYears},${ev.skillMatchPercentage}%,${ev.overallFitScore},"${ev.recommendation}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=recommended_candidates.csv");
  res.status(200).send(csvContent);
});

// Excel Workbook Sheet Exports
app.get("/api/export/xlsx", (req, res) => {
  const evaluations = latestEvaluations.length > 0 ? latestEvaluations : candidates.map((c, idx) => runLocalScoringMatch(jobDescription, c, idx));
  evaluations.sort((a, b) => b.overallFitScore - a.overallFitScore);

  // 1. Ranked Candidates sheet
  const sheet1Data = evaluations.map((ev, index) => ({
    Rank: index + 1,
    Candidate_ID: ev.candidateId,
    Candidate_Name: ev.candidateName,
    Email: ev.email,
    Location: ev.location,
    Experience_Years: ev.experienceYears,
    Skill_Match_Percentage: `${ev.skillMatchPercentage}%`,
    Project_Relevance_Score: ev.projectRelevanceScore,
    Education_Score: ev.educationScore,
    Certification_Score: ev.certificationScore,
    Location_Score: ev.locationScore,
    Overall_Fit_Score: ev.overallFitScore,
    Recommendation: ev.recommendation,
    Key_Strengths: ev.keyStrengths,
    Potential_Gaps: ev.potentialGaps,
  }));

  // 2. Candidate Analytics
  const sheet2Data = evaluations.map(ev => ({
    Candidate_ID: ev.candidateId,
    Candidate_Name: ev.candidateName,
    Overall_Fit_Score: ev.overallFitScore,
    Experience_Years: ev.experienceYears,
    Keyword_Stuffing_Detected: ev.keywordStuffingDetected ? "YES" : "NO",
    Leadership_Potential: ev.leadershipPotential ? "YES" : "NO",
    Fast_Learning_Ability: ev.fastLearningAbility ? "YES" : "NO",
    Strong_Portfolio: ev.strongPortfolio ? "YES" : "NO",
    Career_Prediction: ev.careerGrowthPrediction,
  }));

  // 3. Skill Gap Report
  const sheet3Data = evaluations.map(ev => ({
    Candidate_Name: ev.candidateName,
    Skill_Match_Percentage: `${ev.skillMatchPercentage}%`,
    Top_Matching_Skills: ev.topMatchingSkills.join(", "),
    Missing_Skills: ev.missingSkills.join(", "),
    Transferable_Skills: ev.transferableSkills.join(", "),
  }));

  // 4. Recruiter Dashboard
  const avgScore = Math.round(evaluations.reduce((acc, ev) => acc + ev.overallFitScore, 0) / (evaluations.length || 1));
  const qualifiedCount = evaluations.filter(ev => ev.overallFitScore >= 70).length;
  
  // Find top skills frequency
  const allSkills: string[] = [];
  candidates.forEach(c => allSkills.push(...c.technicalSkills));
  const skillCount: Record<string, number> = {};
  allSkills.forEach(s => {
    const key = s.trim();
    if (key) {
      skillCount[key] = (skillCount[key] || 0) + 1;
    }
  });
  const sortedFreq = Object.entries(skillCount).sort((a, b) => b[1] - a[1]);
  const primeSkill = sortedFreq[0]?.[0] || "TypeScript";

  const sheet4Data = [
    { Metric: "Average Candidate Overall Score", Value: `${avgScore} / 100` },
    { Metric: "Top Sourced Technical Skill", Value: primeSkill },
    { Metric: "Total Highly Recommended/Rec", Value: `${qualifiedCount} Candidate(s)` },
    { Metric: "Applicant Pool Volatility (Keyword Stuffed Detected)", Value: `${evaluations.filter(e => e.keywordStuffingDetected).length} Sourced` },
    { Metric: "Diversity of Skillset Indexes", Value: `${sortedFreq.length} unique skills distributed` },
    { Metric: "Active Role", Value: jobDescription.roleTitle },
    { Metric: "Active Requirements Sourced", Value: jobDescription.requiredSkills.join(", ") }
  ];

  const wb = XLSX.utils.book_new();
  
  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
  const ws4 = XLSX.utils.json_to_sheet(sheet4Data);

  XLSX.utils.book_append_sheet(wb, ws1, "Ranked Candidates");
  XLSX.utils.book_append_sheet(wb, ws2, "Candidate Analytics");
  XLSX.utils.book_append_sheet(wb, ws3, "Skill Gap Report");
  XLSX.utils.book_append_sheet(wb, ws4, "Recruiter Dashboard");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=recommended_candidates.xlsx");
  res.status(200).send(buffer);
});

// Secure API Hub Simulator mock POST endpoint
app.post("/api/external/candidate", (req, res) => {
  const token = req.headers["x-ats-token"] || req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Access Denied: Missing unique X-ATS-Token verification." });
  }

  const { name, email, location, experienceYears, technicalSkills } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Candidate Schema requires at least 'name' and 'email' fields." });
  }

  const newCand: Candidate = {
    id: `ATS-${String(candidates.length + 1).padStart(3, "0")}`,
    name,
    email,
    location: location || "Remote Sourced",
    education: req.body.education || "Bachelor of Science",
    experienceYears: Number(experienceYears) || 3,
    technicalSkills: Array.isArray(technicalSkills) ? technicalSkills : [],
    projects: req.body.projects || [],
    certifications: req.body.certifications || [],
    previousCompanies: req.body.previousCompanies || [],
    resumeSummary: req.body.resumeSummary || "ATS secure incoming payload profile.",
    isCustomUploaded: true,
  };

  candidates.push(newCand);
  res.status(201).json({ message: "Successfully imported cand via external integration.", candidate: newCand });
});

// Mount Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
    console.log(`AI Talent Intelligence is active.`);
  });
}

startServer();
