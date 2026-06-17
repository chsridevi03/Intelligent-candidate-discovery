import React, { useState } from "react";
import { Plus, X, Briefcase, Star, MapPin, GraduationCap, Calendar, FileText } from "lucide-react";
import { JobDescription } from "../types";

interface Props {
  job: JobDescription;
  onUpdateJob: (updated: JobDescription) => void;
  isSaving: boolean;
}

export const JobPanel: React.FC<Props> = ({ job, onUpdateJob, isSaving }) => {
  const [roleTitle, setRoleTitle] = useState(job.roleTitle);
  const [minExperience, setMinExperience] = useState(job.minExperience);
  const [education, setEducation] = useState(job.education);
  const [location, setLocation] = useState(job.location);
  const [employmentType, setEmploymentType] = useState(job.employmentType);
  const [additionalRequirements, setAdditionalRequirements] = useState(job.additionalRequirements);

  // Skills tag fields
  const [requiredSkills, setRequiredSkills] = useState<string[]>(job.requiredSkills);
  const [newReqSkill, setNewReqSkill] = useState("");

  const [preferredSkills, setPreferredSkills] = useState<string[]>(job.preferredSkills);
  const [newPrefSkill, setNewPrefSkill] = useState("");

  const handleAddReqSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newReqSkill.trim();
    if (clean && !requiredSkills.includes(clean)) {
      setRequiredSkills([...requiredSkills, clean]);
      setNewReqSkill("");
    }
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddPrefSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPrefSkill.trim();
    if (clean && !preferredSkills.includes(clean)) {
      setPreferredSkills([...preferredSkills, clean]);
      setNewPrefSkill("");
    }
  };

  const handleRemovePrefSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleSaveAll = () => {
    onUpdateJob({
      roleTitle,
      requiredSkills,
      preferredSkills,
      minExperience,
      education,
      location,
      employmentType,
      additionalRequirements,
    });
  };

  return (
    <div id="job-panel-card" className="glass-panel rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white font-display">
            Active Job Profile & Sourcing Criteria
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Setting criteria executes semantic keyword and LLM evaluation comparisons.
          </p>
        </div>
        <button
          id="btn-save-job"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="mt-3 sm:mt-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wider uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-150 disabled:opacity-50"
        >
          {isSaving ? "Syncing Sourcing..." : "Apply & Save Sourcing"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Role Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Role Title</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Briefcase className="h-4 w-4 text-blue-400" />
            </span>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
            />
          </div>
        </div>

        {/* Min Experience */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Min Experience (Years)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Calendar className="h-4 w-4 text-blue-400" />
            </span>
            <input
              type="number"
              value={minExperience}
              onChange={(e) => setMinExperience(Number(e.target.value))}
              className="w-full pl-9 pr-3 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
            />
          </div>
        </div>

        {/* Employment Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Employment Type</label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
          >
            <option value="Full-time" className="bg-[#0b0e14]">Full-time</option>
            <option value="Part-time" className="bg-[#0b0e14]">Part-time</option>
            <option value="Remote" className="bg-[#0b0e14]">Remote</option>
            <option value="Hybrid" className="bg-[#0b0e14]">Hybrid</option>
          </select>
        </div>

        {/* Education Requirement */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Education Requirement</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <GraduationCap className="h-4 w-4 text-blue-400" />
            </span>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
            />
          </div>
        </div>

        {/* Location Target */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Location Target</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <MapPin className="h-4 w-4 text-blue-400" />
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
            />
          </div>
        </div>

        {/* Additional Workflow details */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Additional Sourcing Notes</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 pt-2.5 flex items-start text-slate-400">
              <FileText className="h-4 w-4 text-blue-400" />
            </span>
            <input
              type="text"
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Sourcing Skills Tag Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/10">
        
        {/* Required Skills Column */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-blue-400 fill-blue-500/20" />
            Required Skills (40% Match Weight)
          </label>
          <form onSubmit={handleAddReqSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. React, Docker, Kubernetes"
              value={newReqSkill}
              onChange={(e) => setNewReqSkill(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {requiredSkills.map((skill) => (
              <span
                key={`req-${skill}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveReqSkill(skill)}
                  className="hover:bg-blue-500/20 p-0.5 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {requiredSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No required competencies defined.</span>
            )}
          </div>
        </div>

        {/* Preferred Skills Column */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-cyan-400 fill-cyan-500/20" />
            Preferred Skills (Bonus Multipliers)
          </label>
          <form onSubmit={handleAddPrefSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. AWS, Redis, GraphQL"
              value={newPrefSkill}
              onChange={(e) => setNewPrefSkill(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white transition-all focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {preferredSkills.map((skill) => (
              <span
                key={`pref-${skill}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemovePrefSkill(skill)}
                  className="hover:bg-cyan-500/20 p-0.5 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {preferredSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No preferred milestones defined.</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
