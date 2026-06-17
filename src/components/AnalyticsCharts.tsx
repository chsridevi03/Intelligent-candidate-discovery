import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Cell
} from "recharts";
import { EvaluationResult, Candidate } from "../types";

interface Props {
  evaluations: EvaluationResult[];
  candidates: Candidate[];
  isDark: boolean;
}

export const AnalyticsCharts: React.FC<Props> = ({ evaluations, candidates, isDark }) => {
  const chartTextColor = "#94a3b8";
  const gridColor = "rgba(255, 255, 255, 0.05)";
  const tooltipStyle = {
    backgroundColor: "#050608",
    borderColor: "rgba(255, 255, 255, 0.1)",
    color: "#f8fafc",
    borderRadius: "12px",
    fontSize: "12px"
  };

  // 1. Candidate Scores Data (sorted by Rank)
  const scoresData = evaluations.map(e => ({
    name: e.candidateName,
    score: e.overallFitScore,
    skills: e.skillMatchPercentage,
    experience: e.experienceYears * 10, // scale for visual representation
  }));

  // 2. Experience vs Score (Scatter relationship)
  const experienceScatterData = evaluations.map(e => ({
    name: e.candidateName,
    experience: e.experienceYears,
    score: e.overallFitScore,
    recommendation: e.recommendation
  }));

  // 3. Top Skills Frequency Analysis
  const skillCount: Record<string, number> = {};
  candidates.forEach(c => {
    c.technicalSkills.forEach(s => {
      const normalized = s.trim();
      if (normalized) {
        skillCount[normalized] = (skillCount[normalized] || 0) + 1;
      }
    });
  });
  const skillFrequencyData = Object.entries(skillCount)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // top 8 skills

  // 4. Candidate Score Distribution Groups (Histogram ranges)
  const ranges = [
    { range: "< 50", count: 0 },
    { range: "50 - 69", count: 0 },
    { range: "70 - 84", count: 0 },
    { range: "85 - 100", count: 0 },
  ];
  evaluations.forEach(e => {
    if (e.overallFitScore < 50) ranges[0].count++;
    else if (e.overallFitScore < 70) ranges[1].count++;
    else if (e.overallFitScore < 85) ranges[2].count++;
    else ranges[3].count++;
  });

  return (
    <div id="analytics-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Chart 1: Candidate Score Comparison */}
      <div id="chart-score-comparison" className="glass-panel p-5 rounded-2xl shadow-xl">
        <h4 className="text-sm font-semibold text-white mb-4 font-display">
          Fit & Skill Match Comparison 
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="skillsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 10 }} />
              <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" name="Overall Fit Score" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
              <Area type="monotone" name="Skill Match %" dataKey="skills" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#skillsColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Top Skills In Sourced Pool */}
      <div id="chart-skills-frequency" className="glass-panel p-5 rounded-2xl shadow-xl">
        <h4 className="text-sm font-semibold text-white mb-4 font-display">
          Top Sourced Skills Frequency (Counts)
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillFrequencyData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={{ fill: chartTextColor, fontSize: 11 }} />
              <YAxis dataKey="skill" type="category" tick={{ fill: chartTextColor, fontSize: 10 }} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Candidate Count" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                {skillFrequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#2563eb" : "#06b6d4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Candidate Score Distribution Ranges */}
      <div id="chart-score-distribution" className="glass-panel p-5 rounded-2xl shadow-xl">
        <h4 className="text-sm font-semibold text-white mb-4 font-display">
          Applicant Score Distribution Groups
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranges} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="range" tick={{ fill: chartTextColor, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Candidates count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                {ranges.map((entry, index) => {
                  const colors = ["#ef4444", "#f59e0b", "#06b6d4", "#10b981"];
                  return <Cell key={`cell-${index}`} fill={colors[index]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Experience vs Fit Score (Scatter) */}
      <div id="chart-experience-distribution" className="glass-panel p-5 rounded-2xl shadow-xl">
        <h4 className="text-sm font-semibold text-white mb-4 font-display">
          Experience Tenure (Years) vs FIT Score Matrix
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" dataKey="experience" name="Experience" unit=" yrs" tick={{ fill: chartTextColor, fontSize: 11 }} />
              <YAxis type="number" dataKey="score" name="Fit Score" unit="%" tick={{ fill: chartTextColor, fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} />
              <Scatter name="Candidates" data={experienceScatterData} fill="#3b82f6" shape="circle" line={false}>
                {experienceScatterData.map((entry, index) => {
                  let cellColor = "#3b82f6";
                  if (entry.recommendation === "Highly Recommended") cellColor = "#10b981";
                  else if (entry.recommendation === "Recommended") cellColor = "#06b6d4";
                  else if (entry.recommendation === "Consider") cellColor = "#f59e0b";
                  else cellColor = "#ef4444";
                  return <Cell key={`cell-${index}`} fill={cellColor} r={7} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
