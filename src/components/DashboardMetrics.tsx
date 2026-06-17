import React from "react";
import { Award, Briefcase, Skull, Users, Layers, AlertCircle } from "lucide-react";
import { EvaluationResult, HiringInsights } from "../types";

interface Props {
  evaluations: EvaluationResult[];
  insights: HiringInsights;
}

export const DashboardMetrics: React.FC<Props> = ({ evaluations, insights }) => {
  const keywordStuffers = evaluations.filter(e => e.keywordStuffingDetected).length;
  
  return (
    <div id="dashboard-metrics-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Average Candidate Score */}
      <div id="metric-avg-score" className="glass-panel p-5 rounded-2xl flex items-start justify-between transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">Avg Fit Score</span>
          <h3 className="text-3xl font-display font-medium text-white">
            {insights.averageCandidateScore}<span className="text-sm text-slate-400 font-normal">/100</span>
          </h3>
          <p className="text-xs text-slate-450 mt-2">
            Weighted system mean
          </p>
        </div>
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-405">
          <Award className="h-5 w-5" />
        </div>
      </div>

      {/* Top Sourced Skill */}
      <div id="metric-top-skill" className="glass-panel p-5 rounded-2xl flex items-start justify-between transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">Top Sourced Skill</span>
          <h3 className="text-3xl font-display font-medium text-emerald-400 truncate max-w-[160px]">
            {insights.topSkillFound || "None"}
          </h3>
          <p className="text-xs text-slate-455 mt-2">
            Most frequent candidate talent
          </p>
        </div>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <Briefcase className="h-5 w-5" />
        </div>
      </div>

      {/* Most Common Missing Skill */}
      <div id="metric-missing-skill" className="glass-panel p-5 rounded-2xl flex items-start justify-between transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">Common Missing</span>
          <h3 className="text-3xl font-display font-medium text-rose-450 truncate max-w-[160px]">
            {insights.mostCommonMissingSkill || "None"}
          </h3>
          <p className="text-xs text-slate-460 mt-2">
            Primary role skill-gap
          </p>
        </div>
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
          <AlertCircle className="h-5 w-5" />
        </div>
      </div>

      {/* Qualified / Total */}
      <div id="metric-qualified-total" className="glass-panel p-5 rounded-2xl flex items-start justify-between transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">Qualified Pool</span>
          <h3 className="text-3xl font-display font-medium text-white">
            {insights.totalQualifiedCandidates} <span className="text-sm text-slate-400 font-normal">/ {evaluations.length}</span>
          </h3>
          <p className="text-xs text-slate-465 mt-2">
            Score ≥ 70 rating (Recommended)
          </p>
        </div>
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
          <Users className="h-5 w-5" />
        </div>
      </div>

      {/* Keyword Stuffing Warning or Diversity / Extra KPI */}
      <div id="metric-diversity-kpi" className="glass-panel p-5 rounded-2xl flex items-start justify-between transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">Stuffing Audits</span>
          <h3 className={`text-3xl font-display font-medium ${keywordStuffers > 0 ? "text-amber-400" : "text-slate-300"}`}>
            {keywordStuffers} <span className="text-sm text-slate-400 font-normal">flags</span>
          </h3>
          <p className="text-xs text-slate-470 mt-2">
            Keyword-stuffed profiles docked
          </p>
        </div>
        <div className={`p-3 rounded-xl ${keywordStuffers > 0 ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "bg-white/5 border border-white/10 text-slate-400"}`}>
          <Skull className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
