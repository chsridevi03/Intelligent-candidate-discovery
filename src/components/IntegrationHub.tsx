import React, { useState } from "react";
import { Terminal, Copy, Check, Paperclip, Send, Key, RefreshCw } from "lucide-react";

interface Props {
  onSimulateWebhook: (payload: any) => Promise<boolean>;
  appUrl: string;
}

export const IntegrationHub: React.FC<Props> = ({ onSimulateWebhook, appUrl }) => {
  const [copied, setCopied] = useState(false);
  const [simulatedLoad, setSimulatedLoad] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [webhookPayload, setWebhookPayload] = useState(
    JSON.stringify({
      name: "Liam Hall",
      email: "liam.hall@cloudinfrastructure.co",
      location: "San Jose, CA",
      education: "BS Computer Science, Georgia Tech",
      experienceYears: 7,
      technicalSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Redis", "Docker"],
      projects: [
        {
          title: "Kubernetes Asset Scaling Layer",
          description: "Designed a multi-cluster asset load balanced service routing container metrics seamlessly.",
          technologies: ["Docker", "PostgreSQL"]
        }
      ],
      certifications: ["AWS Certified Security Specialist"],
      previousCompanies: ["Snyk", "DigitalOcean"],
      resumeSummary: "Dedicated cloud system builder with 7 years of industry background. Expertise in optimizing relational PostgreSQL metrics, React dashboards, and high-performance in-memory cache architectures with Redis."
    }, null, 2)
  );

  const mockToken = "ATS_SECURE_TOKEN_97FCEBA018";

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`POST ${appUrl || "https://ais-dev-url"}/api/external/candidate`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerMockWebhook = async () => {
    try {
      setSimulatedLoad(true);
      setStatusMsg("");
      const parsed = JSON.parse(webhookPayload);
      const ok = await onSimulateWebhook(parsed);
      if (ok) {
        setStatusMsg("✅ Candidate 'Liam Hall' imported successfully via webhook!");
      } else {
        setStatusMsg("❌ Webhook delivery rejected: Check payload structure.");
      }
    } catch (e: any) {
      setStatusMsg("❌ Invalid payload JSON: " + e.message);
    } finally {
      setSimulatedLoad(false);
    }
  };

  return (
    <div id="integration-hub-root" className="glass-panel rounded-2xl shadow-xl p-6 mb-8">
      <div className="border-b border-white/10 pb-4 mb-6">
        <h3 className="text-lg font-semibold text-white font-display flex items-center gap-2">
          <Terminal className="h-5 w-5 text-blue-400" />
          Secure ATM & ATS Integration Hub
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Hook external Applicant Tracking platforms (Workday, Greenhouse, Lever) directly into your discovery workflow utilizing secure REST APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* API Endpoint Documentation details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Sourcing REST endpoint specification
          </h4>

          {/* Core Target Endpoint */}
          <div className="bg-black/55 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold border border-blue-500/20">POST</span>
              <button
                onClick={handleCopyEndpoint}
                className="text-slate-450 hover:text-white transition-colors"
                title="Copy endpoint"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <code className="text-xs font-mono break-all text-slate-300 block">
              {appUrl || "https://ais-dev-url"}/api/external/candidate
            </code>
          </div>

          {/* Auth Keys */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Security Credentials Required</span>
            <div className="flex items-center gap-2 bg-black/55 p-3 rounded-xl border border-white/10">
              <Key className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-slate-450 block uppercase tracking-wider">HEADER KEY: X-ATS-Token</span>
                <span className="text-xs font-mono text-slate-300 truncate block">{mockToken}</span>
              </div>
            </div>
          </div>

          {/* Webhook JSON cargo instructions */}
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-1 text-xs text-slate-400">
            <span className="font-semibold text-white block">External Sync Rule</span>
            <p className="leading-relaxed">
              Every incoming API body gets verified on-receipt. Sourced candidates are parsed and cached instantly inside evaluations for real-time manager ranking analysis.
            </p>
          </div>
        </div>

        {/* Interactive Webhook Simulator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Live Webhook JSON Simulator
            </h4>
            <span className="text-[10px] text-[#06b6d4] font-mono flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin duration-3000" /> Sandbox Mode Active
            </span>
          </div>

          <div className="bg-black/60 rounded-xl overflow-hidden border border-white/10 flex flex-col">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-slate-405 font-mono">
              <span>payload.json</span>
              <span>Edit to modify fields</span>
            </div>
            <textarea
              value={webhookPayload}
              onChange={(e) => setWebhookPayload(e.target.value)}
              rows={8}
              className="px-4 py-3 bg-black/80 text-emerald-400 font-mono text-xs focus:outline-hidden resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-simulate-webhook"
              onClick={handleTriggerMockWebhook}
              disabled={simulatedLoad}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {simulatedLoad ? "Publishing payload..." : "Emit Mock ATS Webhook"}
            </button>
          </div>

          {statusMsg && (
            <div className="p-3 bg-black/60 border border-white/10 rounded-xl text-xs font-mono antialiased animate-fade-in text-slate-300">
              {statusMsg}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
