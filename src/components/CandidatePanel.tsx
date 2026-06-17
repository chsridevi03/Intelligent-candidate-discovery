import React, { useState, useRef } from "react";
import { Upload, Plus, Trash2, RotateCcw, AlertTriangle, User, FileText, Check, Shield } from "lucide-react";
import { Candidate } from "../types";

interface Props {
  candidates: Candidate[];
  onAddCandidate: (cand: Partial<Candidate>) => void;
  onUploadResume: (file: File) => Promise<boolean>;
  onDeleteCandidate: (id: string) => void;
  onResetDatabase: () => void;
  isUploading: boolean;
  activeRole: string; // Recruiter Admin can reset / delete, Hiring Manager can only see.
}

export const CandidatePanel: React.FC<Props> = ({
  candidates,
  onAddCandidate,
  onUploadResume,
  onDeleteCandidate,
  onResetDatabase,
  isUploading,
  activeRole
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [education, setEducation] = useState("");
  const [technicalSkills, setTechnicalSkills] = useState("");
  const [certifications, setCertifications] = useState("");
  const [previousCompanies, setPreviousCompanies] = useState("");
  const [resumeSummary, setResumeSummary] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await onUploadResume(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onUploadResume(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Submit manual form
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    onAddCandidate({
      name,
      email,
      location,
      experienceYears: Number(experienceYears) || 0,
      education,
      technicalSkills: technicalSkills.split(",").map(s => s.trim()).filter(Boolean),
      certifications: certifications.split(",").map(s => s.trim()).filter(Boolean),
      previousCompanies: previousCompanies.split(",").map(s => s.trim()).filter(Boolean),
      resumeSummary,
    });

    // Reset Form
    setName("");
    setEmail("");
    setLocation("");
    setExperienceYears("");
    setEducation("");
    setTechnicalSkills("");
    setCertifications("");
    setPreviousCompanies("");
    setResumeSummary("");
    setShowAddForm(false);
  };

  return (
    <div id="candidate-panel-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Col 1: Resume Upload & Fast Sourcing */}
      <div id="panel-resume-ingest" className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5 font-display">
            <Upload className="h-4 w-4 text-blue-400" />
            AI Resume Analyzer (PDF / TXT)
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Upload resumes to parse education, skills, previous companies, and projects into standard attributes.
          </p>

          <div
            id="drag-drop-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[160px] ${
              dragActive
                ? "border-blue-500 bg-blue-500/10"
                : isUploading
                ? "border-[#06b6d4] bg-cyan-500/10 cursor-not-allowed"
                : "border-white/10 hover:border-white/20 bg-black/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-r-transparent border-white/20 animate-spin"></div>
                <span className="text-xs text-[#06b6d4] font-medium">Gemini parsing resume vectors...</span>
                <span className="text-[10px] text-slate-400">Performing Entity Extraction & Project Analytics</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-7 w-7 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-300">
                  Drag & Drop Resume, or <span className="text-blue-400">browse</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Supports PDF & Plain Text documents up to 10MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Database Controls (Available to Recruiter Admin only) */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            <Shield className="h-3 w-3 text-blue-400" />
            {activeRole === "recruiter" ? "Recruiter Access" : "Read-Only Dashboard"}
          </div>
          {activeRole === "recruiter" && (
            <button
              id="btn-reset-db"
              onClick={onResetDatabase}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors border border-rose-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Pool
            </button>
          )}
        </div>
      </div>

      {/* Col 2 & 3: Applicant Sourced Pool Explorer */}
      <div id="panel-candidates-explorer" className="glass-panel p-5 rounded-2xl shadow-xl lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5 font-display">
                <User className="h-4 w-4 text-blue-400" />
                Sourced Applicant Profiles ({candidates.length} profiles)
              </h4>
              <p className="text-xs text-slate-400">
                Manage candidate index pool. Uploaded candidates are persistent.
              </p>
            </div>
            <button
              id="btn-toggle-add-candidate"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-[#ffffff0a] hover:bg-[#ffffff15] border border-white/10 rounded-lg text-xs font-semibold text-blue-400 transition-all flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              {showAddForm ? "Hide Form" : "Add Profile"}
            </button>
          </div>

          {/* Form manual injection */}
          {showAddForm && (
            <form onSubmit={handleManualSubmit} className="bg-black/50 p-4 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-[300px] overflow-y-auto">
              <input
                type="text"
                placeholder="Applicant Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <input
                type="email"
                placeholder="Active Email Workspace *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <input
                type="text"
                placeholder="Location (e.g., Austin, TX)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <input
                type="number"
                placeholder="Experience Years (e.g. 5)"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <input
                type="text"
                placeholder="Education (e.g. MS Computer Science)"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="col-span-1 md:col-span-2 px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <input
                type="text"
                placeholder="Skills (comma separated, e.g. React, Docker)"
                value={technicalSkills}
                onChange={(e) => setTechnicalSkills(e.target.value)}
                className="col-span-1 md:col-span-2 px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <input
                type="text"
                placeholder="Certifications (comma separated, e.g. AWS Developer)"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                className="col-span-1 md:col-span-2 px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <input
                type="text"
                placeholder="Previous Companies (comma separated, e.g. Uber, Stripe)"
                value={previousCompanies}
                onChange={(e) => setPreviousCompanies(e.target.value)}
                className="col-span-1 md:col-span-2 px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all"
              />
              <textarea
                placeholder="Summary profile pitch..."
                rows={2}
                value={resumeSummary}
                onChange={(e) => setResumeSummary(e.target.value)}
                className="col-span-1 md:col-span-2 px-3 py-2 text-xs bg-black/40 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 text-white rounded-lg focus:outline-hidden transition-all resize-none"
              />
              <button
                type="submit"
                className="col-span-1 md:col-span-2 py-2 bg-blue-650 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Insert manually into Pool
              </button>
            </form>
          )}

          {/* Sourced Pool Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[190px] overflow-y-auto pr-1">
            {candidates.map((cand) => (
              <div
                key={`cand-list-${cand.id}`}
                className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/15 hover:bg-white/5 transition-all duration-155"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 text-xs font-semibold">
                    {cand.name ? cand.name.charAt(0) : "A"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-200 block truncate">
                      {cand.name}
                    </span>
                    <span className="text-[10px] text-slate-450 flex items-center gap-1 font-mono">
                      <span>{cand.id}</span>
                      <span>•</span>
                      <span>{cand.experienceYears} yrs exp</span>
                    </span>
                  </div>
                </div>
                {activeRole === "recruiter" ? (
                  <button
                    id={`btn-delete-${cand.id}`}
                    onClick={() => onDeleteCandidate(cand.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Check className="h-4 w-4 text-[#06b6d4] mr-2" />
                )}
              </div>
            ))}
            {candidates.length === 0 && (
              <div className="col-span-2 py-6 text-center text-xs text-slate-450 italic">
                Active candidate pool is empty. Reset or upload.
              </div>
            )}
          </div>
        </div>

        {/* Info label about algorithm model */}
        <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1.5 bg-blue-500/5 border border-blue-500/10 p-2 rounded-lg">
          <AlertTriangle className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
          <span>Semantic analyzer considers technologies as equivalent terms (e.g. AWS matching cloud, or Express matching web APIs).</span>
        </div>
      </div>

    </div>
  );
};
