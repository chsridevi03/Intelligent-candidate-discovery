import React, { useState } from "react";
import { X, Award, AlertTriangle, ShieldCheck, Zap, Sparkles, BookOpen, Crown, ChevronRight } from "lucide-react";
import { EvaluationResult } from "../types";

interface Props {
  evaluations: EvaluationResult[];
  onTriggerEvaluate: () => void;
  isLoading: boolean;
}

export const RankingsTable: React.FC<Props> = ({ evaluations, onTriggerEvaluate, isLoading }) => {
  const [selectedEval, setSelectedEval] = useState<EvaluationResult | null>(null);

  const getRecBadgeClass = (rec: string) => {
    switch (rec) {
      case "Highly Recommended":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Recommended":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Consider":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Not Recommended":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  return (
    <div id="rankings-table-root" className="glass-panel rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white font-display">
            Global Talent Screening & Discovery rankings
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Sorts candidates from highest score to lowest score based on structural scoring weights.
          </p>
        </div>
        <button
          id="btn-run-evaluation"
          onClick={onTriggerEvaluate}
          disabled={isLoading}
          className="mt-3 sm:mt-0 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs tracking-wider uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-150 active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {isLoading && (
            <span className="w-3.5 h-3.5 rounded-full border border-t-transparent border-white animate-spin"></span>
          )}
          {isLoading ? "Running AI matching..." : "Run AI Sourcing Evaluation"}
        </button>
      </div>

      {evaluations.length === 0 ? (
        <div className="py-12 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
          <Sparkles className="h-8 w-8 text-blue-400 mx-auto mb-2 animate-pulse" />
          <h4 className="text-sm font-semibold text-white mb-1">Discover Rankings Awaiting Initialization</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Click &quot;Run AI Sourcing Evaluation&quot; to invoke structural semantic scoring matching on the dataset.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Candidate ID</th>
                <th className="py-3 px-3">Applicant Name</th>
                <th className="py-3 px-3">Exp</th>
                <th className="py-3 px-3">Skill Match</th>
                <th className="py-3 px-3">Overall fit</th>
                <th className="py-3 px-3">Recommendation</th>
                <th className="py-3 px-3">Gaps Highlight</th>
                <th className="py-3 px-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <tr
                  key={`eval-row-${ev.candidateId}`}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-3 text-xs font-mono font-semibold text-white">
                    #{ev.rank}
                  </td>
                  <td className="py-4 px-3 text-xs font-mono text-slate-450">
                    {ev.candidateId}
                  </td>
                  <td className="py-4 px-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {ev.candidateName}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{ev.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-xs text-slate-300">
                    {ev.experienceYears} Years
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">
                        {ev.skillMatchPercentage}%
                      </span>
                      {ev.keywordStuffingDetected && (
                        <span
                          className="px-1 text-[8px] bg-rose-500/10 text-rose-450 font-mono rounded border border-rose-500/20"
                          title="Skill Match reduced due to keyword repetitions"
                        >
                          STUFFED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        {ev.overallFitScore}/100
                      </span>
                      <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            ev.overallFitScore >= 80
                              ? "bg-emerald-500"
                              : ev.overallFitScore >= 65
                              ? "bg-cyan-500"
                              : ev.overallFitScore >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${ev.overallFitScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRecBadgeClass(
                        ev.recommendation
                      )}`}
                    >
                      {ev.recommendation}
                    </span>
                  </td>
                  <td className="py-4 px-3 max-w-[150px] truncate text-[11px] text-slate-400">
                    {ev.potentialGaps}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button
                      id={`btn-audit-${ev.candidateId}`}
                      onClick={() => setSelectedEval(ev)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-500/20"
                    >
                      Dossier
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit dossier modal details */}
      {selectedEval && (
        <div id="dossier-modal-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div
            id="dossier-modal-box"
            className="glass-panel rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-white/15"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#07090e] px-6 py-4 border-b border-white/15 flex items-center justify-between z-10 rounded-t-3xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white font-display">
                    Candidate Dossier Audit
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRecBadgeClass(selectedEval.recommendation)}`}>
                    {selectedEval.recommendation}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedEval.candidateId} • Name: {selectedEval.candidateName}
                </p>
              </div>
              <button
                id="btn-close-dossier"
                onClick={() => setSelectedEval(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6">
              
              {/* Keyword stuffing notification warning badge if applicable */}
              {selectedEval.keywordStuffingDetected && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-rose-400 block uppercase tracking-wider font-mono">
                      Keyword stuffing penalized (-35 Fit Points applied)
                    </span>
                    <span className="text-xs text-rose-300 block mt-1">
                      Our system detected repetitive software technology stuffing in this application (e.g. duplicating key competencies many times in tech stack categories). Overloaded listings have been discounted to protect meritocracy.
                    </span>
                  </div>
                </div>
              )}

              {/* Grid block metrics split */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block mb-1">Rank Position</span>
                  <span className="text-xl font-display font-bold text-blue-400">#{selectedEval.rank}</span>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block mb-1">Unified fit score</span>
                  <span className="text-xl font-display font-bold text-white">{selectedEval.overallFitScore}/100</span>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block mb-1">Skill Match %</span>
                  <span className="text-xl font-display font-bold text-emerald-400">{selectedEval.skillMatchPercentage}%</span>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block mb-1">Experience Years</span>
                  <span className="text-xl font-display font-bold text-white">{selectedEval.experienceYears} Years</span>
                </div>
              </div>

              {/* Advanced verified candidate badges highlighting */}
              <div className="flex flex-wrap gap-2 pt-2 border-b border-white/10 pb-4">
                {selectedEval.leadershipPotential && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/20">
                    <Crown className="h-3.5 w-3.5" />
                    High Leadership Potential
                  </span>
                )}
                {selectedEval.fastLearningAbility && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-405 text-xs font-semibold rounded-lg border border-cyan-500/20">
                    <Zap className="h-3.5 w-3.5" />
                    Fast Learning Ability
                  </span>
                )}
                {selectedEval.strongPortfolio && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-semibold rounded-lg border border-violet-500/20">
                    <BookOpen className="h-3.5 w-3.5" />
                    Strong Project Portfolio
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified candidate Experience
                </span>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Matching Criteria Met</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEval.topMatchingSkills.map(skill => (
                      <span key={`met-${skill}`} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {selectedEval.topMatchingSkills.length === 0 && (
                      <span className="text-xs text-slate-400">No strong matches.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Outstanding Required Gaps</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEval.missingSkills.map(skill => (
                      <span key={`miss-${skill}`} className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {selectedEval.missingSkills.length === 0 || (selectedEval.missingSkills.length === 1 && selectedEval.missingSkills[0] === "None") ? (
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">All Required Skills Met!</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Transferable Skills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Identified Transferable Competencies</span>
                <div className="flex flex-wrap gap-1">
                  {selectedEval.transferableSkills.map(skill => (
                    <span key={`tr-${skill}`} className="px-2.5 py-1 text-xs font-medium bg-white/5 text-slate-300 border border-white/10 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights & AI explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-450 block uppercase tracking-wider font-mono text-[10px] mb-1">
                      Reason For Sourcing Rank
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                      {selectedEval.reasonForRanking}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-450 block uppercase tracking-wider font-mono text-[10px] mb-1">
                      Recruiter Advisory Notes
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 border-l-4 border-l-blue-500">
                      {selectedEval.recruiterNotes}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-450 block uppercase tracking-wider font-mono text-[10px] mb-1">
                      Key projects & achievements
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                      {selectedEval.keyProjectHighlights}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-450 block uppercase tracking-wider font-mono text-[10px] mb-1">
                      Career Growth Prediction Model
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 border-l-4 border-l-emerald-500">
                      {selectedEval.careerGrowthPrediction}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/15 bg-[#07090e] text-right rounded-b-3xl">
              <button
                id="btn-close-dossier-footer"
                onClick={() => setSelectedEval(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 rounded-xl transition-all"
              >
                Close Audit Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
