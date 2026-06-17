import { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  LineChart,
  Download,
  Terminal,
  Settings,
  Sun,
  Moon,
  ShieldAlert,
  FileSpreadsheet,
  Copy,
  Check,
  RefreshCw,
  Trophy,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { Candidate, EvaluationResult, HiringInsights, JobDescription } from "./types";
import { DashboardMetrics } from "./components/DashboardMetrics";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { JobPanel } from "./components/JobPanel";
import { CandidatePanel } from "./components/CandidatePanel";
import { RankingsTable } from "./components/RankingsTable";
import { IntegrationHub } from "./components/IntegrationHub";

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);

  // States
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "rankings" | "criteria" | "candidates" | "export" | "integrations">("dashboard");
  const [activeRole, setActiveRole] = useState<"recruiter" | "manager">("recruiter"); // RBAC switcher

  const [copystate, setCopystate] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  // Load UTC time for enterprise logging
  useEffect(() => {
    const d = new Date();
    setTimeStr(d.toUTCString());
  }, []);

  // Fetch initial profile states from full-stack Express server on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [jobRes, candRes] = await Promise.all([
          fetch("/api/job-description"),
          fetch("/api/candidates"),
        ]);
        
        if (jobRes.ok && candRes.ok) {
          const jobData = await jobRes.json();
          const candData = await candRes.json();
          setJobDescription(jobData);
          setCandidates(candData);
          
          // Trigger first pass AI evaluations automatically!
          await triggerEvaluate(jobData);
        }
      } catch (err) {
        console.error("Failed to load initial server states:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Dark mode trigger
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Run AI matching evaluation against criteria
  const triggerEvaluate = async (activeJobOverride?: JobDescription) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeJobOverride || jobDescription),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluations(data.evaluations);
      }
    } catch (e) {
      console.error("Evaluation trigger errored:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply general Job configuration
  const handleUpdateJob = async (updated: JobDescription) => {
    try {
      setIsSavingJob(true);
      const res = await fetch("/api/job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setJobDescription(data.jobDescription);
        
        // Auto-refresh matching candidates instantly when sourcing goals shift!
        await triggerEvaluate(data.jobDescription);
      }
    } catch (err) {
      console.error("Failed to sync structural JD:", err);
    } finally {
      setIsSavingJob(false);
    }
  };

  // Add custom manuals
  const handleAddCandidate = async (partial: Partial<Candidate>) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates([...candidates, data.candidate]);
        // re-evaluate
        await triggerEvaluate();
      }
    } catch (e) {
      console.error("Failed to manually create profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Ingest PDF file via multer Express endpoint
  const handleUploadResume = async (file: File): Promise<boolean> => {
    try {
      setIsUploadingResume(true);
      const fd = new FormData();
      fd.append("resume", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setCandidates([...candidates, data.candidate]);
        // re-run calculations
        await triggerEvaluate();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Parsing resume upload failed:", err);
      return false;
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Delete profile
  const handleDeleteCandidate = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCandidates(candidates.filter(c => c.id !== id));
        setEvaluations(evaluations.filter(e => e.candidateId !== id));
      }
    } catch (err) {
      console.error("Pruning profile failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset database back
  const handleResetDatabase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/candidates/reset", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
        setEvaluations([]);
        // Re-calculate mock benchmarks
        const jobRes = await fetch("/api/job-description");
        if (jobRes.ok) {
          const jd = await jobRes.json();
          setJobDescription(jd);
          await triggerEvaluate(jd);
        }
      }
    } catch (err) {
      console.error("Failed to restore core db defaults:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate remote webhook delivery from external platforms
  const handleSimulateWebhook = async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/external/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ATS-Token": "ATS_SECURE_TOKEN_97FCEBA018"
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 21) { // 201 Sourced Created
        // fall through
      }
      const data = await res.json();
      if (data.candidate) {
        setCandidates([...candidates, data.candidate]);
        await triggerEvaluate();
        return true;
      }
      return false;
    } catch (e) {
      console.error("External simulation webhook fail:", e);
      return false;
    }
  };

  // Compute live Recruiting KPIs
  const getInsights = (): HiringInsights => {
    if (evaluations.length === 0) {
      return {
        averageCandidateScore: 0,
        topSkillFound: "None",
        mostCommonMissingSkill: "None",
        totalQualifiedCandidates: 0,
        diversityOfSkillSets: 0,
      };
    }

    const avg = Math.round(
      evaluations.reduce((acc, ev) => acc + ev.overallFitScore, 0) / evaluations.length
    );
    const qualified = evaluations.filter(ev => ev.overallFitScore >= 70).length;

    // Sourced skill frequencies
    const skillFreq: Record<string, number> = {};
    candidates.forEach(c => {
      c.technicalSkills.forEach(s => {
        const k = s.trim();
        if (k) skillFreq[k] = (skillFreq[k] || 0) + 1;
      });
    });
    const sortedSkills = Object.entries(skillFreq).sort((a,b) => b[1] - a[1]);
    const topSourcedSkill = sortedSkills[0]?.[0] || "TypeScript";

    // Trace common gaps (missing skills)
    const gapFreq: Record<string, number> = {};
    evaluations.forEach(ev => {
      ev.missingSkills.forEach(s => {
        const k = s.trim();
        if (k && k !== "None") gapFreq[k] = (gapFreq[k] || 0) + 1;
      });
    });
    const sortedGaps = Object.entries(gapFreq).sort((a,b) => b[1] - a[1]);
    const topMissingSkill = sortedGaps[0]?.[0] || "Redis";

    const totalUniqueSkills = sortedSkills.length;
    const diversity = evaluations.length > 0 ? Number((totalUniqueSkills / evaluations.length).toFixed(1)) : 0;

    return {
      averageCandidateScore: avg,
      topSkillFound: topSourcedSkill,
      mostCommonMissingSkill: topMissingSkill,
      totalQualifiedCandidates: qualified,
      diversityOfSkillSets: diversity,
    };
  };

  // Copy CSV mock to clipboard
  const generateCSVSnippet = () => {
    let csv = "Rank,Candidate_ID,Candidate_Name,Email,Location,Experience_Years,Skill_Match_Percentage,Overall_Fit_Score,Recommendation\n";
    evaluations.forEach((ev, idx) => {
      csv += `${idx + 1},"${ev.candidateId}","${ev.candidateName}","${ev.email}","${ev.location}",${ev.experienceYears},${ev.skillMatchPercentage}%,${ev.overallFitScore},"${ev.recommendation}"\n`;
    });
    return csv;
  };

  const handleCopyCSVSnippet = () => {
    navigator.clipboard.writeText(generateCSVSnippet());
    setCopystate(true);
    setTimeout(() => setCopystate(false), 2000);
  };

  const appInsights = getInsights();

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 transition-colors duration-200 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Immersive Background Ambient Blur Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-cyan-600/10 blur-[130px] rounded-full"></div>
      </div>

      {/* Top Banner & Active UTC Log */}
      <header id="app-top-header" className="bg-black/40 backdrop-blur-xl border-b border-white/10 py-3 px-6 sticky top-0 z-40 shadow-lg flex items-center justify-between">
        <div id="header-branding" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white font-display tracking-wider uppercase">
                Talent Intelligence
              </h1>
              <span className="w-1 h-1 rounded-full bg-blue-500/40"></span>
              <span className="text-[9px] font-mono font-semibold tracking-widest text-[#3b82f6] uppercase">Role ID: AI-2044-X</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">
              Global Recruitment Candidate Discovery System
            </span>
          </div>
        </div>

        {/* Global Controls: Time log, Toggle & Role selection */}
        <div id="header-controls" className="flex items-center gap-4">
          
          {/* UTC timestamp log */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-350 font-mono bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>UTC: {timeStr || "Loading..."}</span>
          </div>

          {/* Secure Role Switcher (Simulated RBAC) */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[11px] font-semibold">
            <button
              onClick={() => setActiveRole("recruiter")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeRole === "recruiter"
                  ? "bg-white/10 text-white border border-white/10 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Recruiter Admin
            </button>
            <button
              onClick={() => setActiveRole("manager")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeRole === "manager"
                  ? "bg-white/10 text-white border border-white/10 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Hiring Manager
            </button>
          </div>

          {/* Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl transition-all"
            title="Toggle theme visualizer"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Primary Dashboard layout */}
      <div id="main-dashboard-scroller" className="flex-1 max-w-[1380px] w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        
        {/* Navigation Sidebar Col */}
        <aside id="dashboard-sidebar" className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-2xl shadow-xl">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#3b82f6] mb-3 px-2">
              Discovery Workspace
            </h2>
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === "dashboard"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-md font-bold"
                    : "text-slate-400 hover:bg-white/5 border border-transparent"
                }`}
              >
                <LineChart className="h-4 w-4 text-cyan-400" />
                Hiring Analytics Board
              </button>
              <button
                onClick={() => setActiveTab("rankings")}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === "rankings"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-md font-bold"
                    : "text-slate-400 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Briefcase className="h-4 w-4 text-cyan-400" />
                Screening Rank Board
              </button>
              <button
                onClick={() => setActiveTab("criteria")}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === "criteria"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-md font-bold"
                    : "text-slate-400 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Settings className="h-4 w-4 text-cyan-400" />
                Job Profile & Criteria
              </button>
              <button
                onClick={() => setActiveTab("candidates")}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === "candidates"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-md font-bold"
                    : "text-slate-400 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Users className="h-4 w-4 text-cyan-400" />
                Candidate Database ({candidates.length})
              </button>
              <button
                onClick={() => setActiveTab("export")}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === "export"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-md font-bold"
                    : "text-slate-400 hover:bg-white/5 border border-transparent"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
                CSV/XLSX Export Hub
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === "integrations"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-md font-bold"
                    : "text-slate-400 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Terminal className="h-4 w-4 text-cyan-400" />
                ATS API Hub Simulation
              </button>
            </nav>
          </div>

          {/* Quick Active Sourcing Info Box */}
          {jobDescription && (
            <div className="glass-panel text-slate-200 rounded-2xl p-4 shadow-xl space-y-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400 fill-blue-500/20" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">Targeting Role</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold truncate leading-tight font-display text-white">
                  {jobDescription.roleTitle}
                </h4>
                <p className="text-[10px] text-[#06b6d4] mt-1 truncate">
                  Min {jobDescription.minExperience}y • {jobDescription.location}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-white/5 leading-relaxed max-h-[80px] overflow-hidden truncate">
                {jobDescription.requiredSkills.slice(0, 4).join(" | ")}
              </div>
            </div>
          )}
        </aside>

        {/* Primary workspace center panel */}
        <main id="dashboard-center-panel" className="lg:col-span-9 space-y-6">
          
          {/* Dashboard Metric Blocks (Always shown dynamically above center content) */}
          <DashboardMetrics evaluations={evaluations} insights={appInsights} />

          {/* Tab Content Renderer router */}
          {activeTab === "dashboard" && (
            <div id="tab-analytics-board" className="space-y-6">
              
              {/* Informative introductory row */}
              <div className="p-4 glass-panel rounded-2xl shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold tracking-wider">WORKSPACE OVERVIEW</span>
                    <h3 className="text-sm font-semibold text-white mt-1">Real-time Sourcing & Sizing Intelligence</h3>
                  </div>
                  <button
                    onClick={() => triggerEvaluate()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-350 rounded-lg border border-white/10 transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh metrics
                  </button>
                </div>
              </div>

              {/* Recharts Graphs */}
              <AnalyticsCharts evaluations={evaluations} candidates={candidates} isDark={isDark} />
            </div>
          )}

          {activeTab === "rankings" && (
            <RankingsTable
              evaluations={evaluations}
              onTriggerEvaluate={() => triggerEvaluate()}
              isLoading={isLoading}
            />
          )}

          {activeTab === "criteria" && jobDescription && (
            <JobPanel
              job={jobDescription}
              onUpdateJob={handleUpdateJob}
              isSaving={isSavingJob}
            />
          )}

          {activeTab === "candidates" && (
            <CandidatePanel
              candidates={candidates}
              onAddCandidate={handleAddAddCandidate => handleAddCandidate(handleAddAddCandidate)}
              onUploadResume={handleUploadResume}
              onDeleteCandidate={handleDeleteCandidate}
              onResetDatabase={handleResetDatabase}
              isUploading={isUploadingResume}
              activeRole={activeRole}
            />
          )}

          {activeTab === "export" && (
            <div id="tab-export-hub" className="glass-panel rounded-2xl shadow-xl p-6 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-lg font-semibold text-white font-display">
                  Corporate Export & Reporting Hub
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Download spreadsheet records suitable for candidate intake meetings or cross-platform loading.
                </p>
              </div>

              {/* Two Column Export Cards layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Excel Export Row card */}
                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-205 pt-2">recommended_candidates.xlsx</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Compiles complete 4-sheet reporting analytics (Ranked Candidates, Candidate Analytics, Skill Gap detail, and Recruiter Dashboard summaries with frequencies).
                    </p>
                  </div>
                  <a
                    id="btn-download-xlsx"
                    href="/api/export/xlsx"
                    target="_blank"
                    className="mt-6 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/10"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download XLSX Spreadsheet
                  </a>
                </div>

                {/* CSV Export Row card */}
                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="h-9 w-9 bg-blue-500/10 text-blue-405 rounded-lg flex items-center justify-center font-bold">
                      <Download className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-205 pt-2">recommended_candidates.csv</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Extracts quick candidate rankings containing name, email, match factors, the overall fit score, and candidate recommendations.
                    </p>
                  </div>
                  <a
                    id="btn-download-csv"
                    href="/api/export/csv"
                    target="_blank"
                    className="mt-6 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/10"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download raw CSV
                  </a>
                </div>

              </div>

              {/* Live copyable CSV Snippet section */}
              {evaluations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                      Intake Copier Panel (CSV output)
                    </span>
                    <button
                      id="btn-copy-csv-snippet"
                      onClick={handleCopyCSVSnippet}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-[11px] font-semibold rounded-lg text-slate-300 hover:bg-white/10 transition"
                    >
                      {copystate ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copystate ? "CSV Copied!" : "Copy CSV to Clipboard"}
                    </button>
                  </div>

                  <div className="bg-black/60 rounded-xl p-4 overflow-x-auto border border-white/5">
                    <pre className="text-[11px] font-mono text-cyan-400 whitespace-pre leading-relaxed">
                      {generateCSVSnippet()}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "integrations" && (
            <IntegrationHub onSimulateWebhook={handleSimulateWebhook} appUrl={window.location.origin} />
          )}

        </main>

      </div>

    </div>
  );
}
