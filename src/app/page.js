"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Building2,
  Shield,
  Scale,
  Eye,
  Users,
  BookOpen,
  ExternalLink,
  Info,
  Download,
  ArrowLeft,
  Upload,
  Globe,
  Loader2,
  FileUp,
  Link,
  Sparkles,
  FileDown,
} from "lucide-react";
import { jsPDF } from "jspdf";

import { regulatorySources } from "@/data/regulatorySources";
import { obligations } from "@/data/obligations";

// ===== HELPER FUNCTIONS =====
const getApplicableObligations = (profile) => {
  if (!profile) return [];
  return obligations.filter((obl) => {
    const useCaseMatch = obl.applies_when.use_cases.some((uc) =>
      profile.aiUseCases.includes(uc)
    );
    const riskMatch =
      !obl.applies_when.risk_level ||
      obl.applies_when.risk_level.includes(profile.riskLevel || "medium");
    return useCaseMatch && riskMatch;
  });
};

// Static icon map (used by ObligationCard)
const iconMap = { Shield, Scale, Eye, Users, Building2, FileText, BookOpen };

// ===== COMPONENTS =====

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    FULL: {
      bg: "bg-green-900/30",
      text: "text-green-400",
      icon: CheckCircle,
      label: "Compliant",
    },
    PARTIAL: {
      bg: "bg-amber-900/30",
      text: "text-amber-400",
      icon: AlertTriangle,
      label: "Partial",
    },
    NOT_MET: {
      bg: "bg-red-900/30",
      text: "text-red-400",
      icon: XCircle,
      label: "Gap",
    },
    PENDING: {
      bg: "bg-secondary",
      text: "text-muted",
      icon: Info,
      label: "Pending",
    },
  };
  const { bg, text, icon: Icon, label } = config[status] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${bg} ${text}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
};

// Strength Badge
const StrengthBadge = ({ strength }) => {
  const config = {
    must: { bg: "bg-red-900/30", text: "text-red-400", border: "border-red-800" },
    should: {
      bg: "bg-amber-900/30",
      text: "text-amber-400",
      border: "border-amber-800",
    },
    may: { bg: "bg-accent/20", text: "text-accent", border: "border-accent/50" },
  };
  const { bg, text, border } = config[strength] || config.should;

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${bg} ${text} ${border}`}
    >
      {strength.toUpperCase()}
    </span>
  );
};

// Citation Panel (slide-out)
const CitationPanel = ({ citations, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card shadow-2xl border-l border-border z-50 overflow-y-auto">
      <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <h3 className="font-black text-foreground">Regulatory Evidence</h3>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        {citations.map((citation, idx) => {
          const source = regulatorySources[citation.source_id];
          return (
            <div key={idx} className="bg-secondary rounded-lg p-4 border border-border">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {source?.title}
                  </div>
                  <div className="text-xs text-muted">
                    {source?.issuing_body} • {citation.section}
                  </div>
                </div>
              </div>
              <blockquote className="text-sm text-muted italic border-l-2 border-accent pl-3 mb-3">
                &ldquo;{citation.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    source?.binding_strength === "authoritative"
                      ? "bg-red-900/30 text-red-400"
                      : source?.binding_strength === "recommended"
                      ? "bg-amber-900/30 text-amber-400"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {source?.binding_strength}
                </span>
                <a
                  href={source?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  View source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Obligation Card Component
const ObligationCard = ({ obligation, assessment, onShowCitations }) => {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = iconMap[obligation.icon] || Shield;

  const iconColorClass =
    assessment?.status === "FULL"
      ? "text-green-400"
      : assessment?.status === "PARTIAL"
      ? "text-amber-400"
      : assessment?.status === "NOT_MET"
      ? "text-red-400"
      : "text-muted";

  const iconBgClass =
    assessment?.status === "FULL"
      ? "bg-green-900/30"
      : assessment?.status === "PARTIAL"
      ? "bg-amber-900/30"
      : assessment?.status === "NOT_MET"
      ? "bg-red-900/30"
      : "bg-secondary";

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        assessment?.status === "FULL"
          ? "border-green-800 bg-green-900/10"
          : assessment?.status === "PARTIAL"
          ? "border-amber-800 bg-amber-900/10"
          : assessment?.status === "NOT_MET"
          ? "border-red-800 bg-red-900/10"
          : "border-border"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-card/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          <IconComponent className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">{obligation.title}</span>
            <StrengthBadge strength={obligation.obligation_strength} />
          </div>
          <p className="text-sm text-muted truncate">{obligation.description}</p>
        </div>
        <StatusBadge status={assessment?.status || "PENDING"} />
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-muted" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border bg-card">
          {assessment?.findings && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted mb-2">Findings</h4>
              <p className="text-sm text-foreground bg-secondary rounded p-3">
                {assessment.findings}
              </p>
            </div>
          )}

          {assessment?.policy_match && (
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">
                Matched Policy Text
              </h4>
              <blockquote className="text-sm text-foreground bg-accent/10 rounded p-3 border-l-2 border-accent italic">
                &ldquo;{assessment.policy_match}&rdquo;
              </blockquote>
            </div>
          )}

          {assessment?.gaps && assessment.gaps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">
                Gaps Identified
              </h4>
              <ul className="text-sm text-foreground space-y-1">
                {assessment.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {assessment?.recommendation && (
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">
                Recommendation
              </h4>
              <p className="text-sm text-foreground bg-amber-900/20 rounded p-3">
                {assessment.recommendation}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-muted mb-2">
              Regulatory Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {obligation.source_citations.map((citation, idx) => (
                <button
                  key={idx}
                  onClick={() => onShowCitations(obligation.source_citations)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded text-xs hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <BookOpen className="w-3 h-3" />
                  {regulatorySources[citation.source_id]?.issuing_body}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted mb-2">
              What Good Looks Like
            </h4>
            <ul className="text-sm text-foreground space-y-1">
              {obligation.what_good_looks_like.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Policy Input Component
const PolicyInput = ({ onPolicyLoaded, isLoading }) => {
  const [inputMode, setInputMode] = useState("url");
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    onPolicyLoaded({ type: "url", url: url.trim() });
  };

  const handleFileSelect = (f) => {
    if (!f) return;
    setFileName(f.name);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleFileSubmit = () => {
    if (!file) return;
    onPolicyLoaded({ type: "file", file, source: fileName });
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    onPolicyLoaded({ type: "paste", text: pastedText.trim() });
  };

  const tabClass = (mode) =>
    `flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
      inputMode === mode
        ? "bg-card text-foreground shadow-sm"
        : "text-muted hover:text-foreground"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-secondary rounded-lg">
        <button onClick={() => setInputMode("url")} className={tabClass("url")}>
          <Globe className="w-4 h-4" />
          URL
        </button>
        <button
          onClick={() => setInputMode("upload")}
          className={tabClass("upload")}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={() => setInputMode("paste")}
          className={tabClass("paste")}
        >
          <FileText className="w-4 h-4" />
          Paste
        </button>
      </div>

      {inputMode === "url" && (
        <div className="space-y-4">
          <div>
            <label className="label">AI Policy URL</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/ai-policy"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={!url.trim() || isLoading}
                className="btn btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Fetch &amp; Analyse
              </button>
            </div>
          </div>
          <p className="text-sm text-muted">
            Enter the URL of your organisation&apos;s AI policy document.
            We&apos;ll fetch and analyse it against UK regulatory requirements.
          </p>
        </div>
      )}

      {inputMode === "upload" && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-accent bg-accent/10"
                : "border-border hover:border-muted"
            }`}
          >
            <FileUp className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-foreground mb-2">
              {fileName ? (
                <span className="font-medium text-accent">{fileName}</span>
              ) : (
                "Drag and drop your AI policy document here"
              )}
            </p>
            <p className="text-sm text-muted mb-4">
              Supports PDF, DOCX, TXT, MD files
            </p>
            <label className="btn cursor-pointer">
              <Upload className="w-4 h-4" />
              Browse files
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          {fileName && (
            <button
              onClick={handleFileSubmit}
              disabled={isLoading}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Analyse Policy
            </button>
          )}
        </div>
      )}

      {inputMode === "paste" && (
        <div className="space-y-4">
          <div>
            <label className="label">Paste your AI policy text</label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your AI policy document text here..."
              rows={10}
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted font-mono text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <button
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim() || isLoading}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Analyse Policy
          </button>
        </div>
      )}
    </div>
  );
};

// Profile Wizard Component
const ProfileWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    orgName: "",
    sector: "",
    size: "",
    aiUseCases: [],
    riskLevel: "medium",
  });

  const sectors = [
    { id: "financial_services", label: "Financial Services" },
    { id: "healthcare", label: "Healthcare" },
    { id: "retail", label: "Retail & E-commerce" },
    { id: "technology", label: "Technology" },
    { id: "manufacturing", label: "Manufacturing" },
    { id: "public_sector", label: "Public Sector" },
    { id: "professional_services", label: "Professional Services" },
    { id: "other", label: "Other" },
  ];

  const aiUseCases = [
    {
      id: "recruitment_ai",
      label: "Recruitment & HR",
      description: "CV screening, candidate scoring, interview scheduling",
    },
    {
      id: "customer_support",
      label: "Customer Support",
      description: "Chatbots, automated responses, sentiment analysis",
    },
    {
      id: "content_generation",
      label: "Content Generation",
      description: "Marketing copy, reports, documentation",
    },
    {
      id: "profiling",
      label: "Profiling & Decisioning",
      description: "Credit scoring, risk assessment, recommendations",
    },
    {
      id: "internal_tools",
      label: "Internal Productivity",
      description: "Code assistants, document summarisation",
    },
  ];

  const handleUseCaseToggle = (id) => {
    setProfile((prev) => ({
      ...prev,
      aiUseCases: prev.aiUseCases.includes(id)
        ? prev.aiUseCases.filter((uc) => uc !== id)
        : [...prev.aiUseCases, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s === step
                  ? "bg-accent text-black"
                  : s < step
                  ? "bg-green-600 text-white"
                  : "bg-secondary text-muted"
              }`}
            >
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 rounded ${
                  s < step ? "bg-green-600" : "bg-secondary"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-foreground mb-1">
              Organisation Details
            </h3>
            <p className="text-sm text-muted">
              Tell us about your organisation
            </p>
          </div>
          <div>
            <label className="label">Organisation Name</label>
            <input
              type="text"
              value={profile.orgName}
              onChange={(e) =>
                setProfile({ ...profile, orgName: e.target.value })
              }
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Enter organisation name"
            />
          </div>
          <div>
            <label className="label">Sector</label>
            <div className="grid grid-cols-2 gap-2">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => setProfile({ ...profile, sector: sector.id })}
                  className={`px-4 py-3 rounded-lg border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                    profile.sector === sector.id
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-border hover:border-muted text-foreground"
                  }`}
                >
                  {sector.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Organisation Size</label>
            <div className="grid grid-cols-3 gap-2">
              {["1-50", "51-250", "250+"].map((size) => (
                <button
                  key={size}
                  onClick={() => setProfile({ ...profile, size })}
                  className={`px-4 py-3 rounded-lg border text-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                    profile.size === size
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-border hover:border-muted text-foreground"
                  }`}
                >
                  {size} employees
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!profile.orgName || !profile.sector || !profile.size}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-foreground mb-1">
              AI Use Cases
            </h3>
            <p className="text-sm text-muted">
              Select all AI applications your organisation uses or plans to use
            </p>
          </div>
          <div className="space-y-3">
            {aiUseCases.map((uc) => (
              <button
                key={uc.id}
                onClick={() => handleUseCaseToggle(uc.id)}
                className={`w-full px-4 py-4 rounded-lg border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                  profile.aiUseCases.includes(uc.id)
                    ? "border-accent bg-accent/20"
                    : "border-border hover:border-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{uc.label}</div>
                    <div className="text-sm text-muted">{uc.description}</div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      profile.aiUseCases.includes(uc.id)
                        ? "border-accent bg-accent"
                        : "border-muted"
                    }`}
                  >
                    {profile.aiUseCases.includes(uc.id) && (
                      <CheckCircle className="w-4 h-4 text-black" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={profile.aiUseCases.length === 0}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-foreground mb-1">
              Risk Assessment
            </h3>
            <p className="text-sm text-muted">
              What level of risk do your AI systems pose?
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                id: "low",
                label: "Low Risk",
                description:
                  "Internal productivity tools, no significant decisions about individuals",
              },
              {
                id: "medium",
                label: "Medium Risk",
                description:
                  "Customer-facing AI, some automated decisions with human oversight",
              },
              {
                id: "high",
                label: "High Risk",
                description:
                  "Decisions significantly affecting individuals (hiring, credit, healthcare)",
              },
            ].map((risk) => (
              <button
                key={risk.id}
                onClick={() => setProfile({ ...profile, riskLevel: risk.id })}
                className={`w-full px-4 py-4 rounded-lg border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                  profile.riskLevel === risk.id
                    ? "border-accent bg-accent/20"
                    : "border-border hover:border-muted"
                }`}
              >
                <div className="font-medium text-foreground">{risk.label}</div>
                <div className="text-sm text-muted">{risk.description}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn">
              Back
            </button>
            <button
              onClick={() => onComplete(profile)}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Application
export default function AIPolicyValidator() {
  const [stage, setStage] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [policySource, setPolicySource] = useState("");
  const [assessment, setAssessment] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState([]);

  const applicableObligations = useMemo(
    () => (profile ? getApplicableObligations(profile) : []),
    [profile]
  );

  const handleProfileComplete = (profileData) => {
    setProfile(profileData);
    setStage("policy");
  };

  const handlePolicyLoaded = async (policy) => {
    setIsAnalysing(true);
    setStage("analysing");

    try {
      const progressSteps = [
        "Fetching policy document...",
        "Extracting policy statements...",
        "Matching against regulatory obligations...",
        "Identifying compliance gaps...",
        "Generating recommendations...",
      ];

      // Ingest step
      setAnalysisProgress(progressSteps[0]);
      let content = "";
      let source = "";

      if (policy.type === "url") {
        const res = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: policy.url }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ingest failed");
        content = data.content;
        source = data.source;
      } else if (policy.type === "paste") {
        const res = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: policy.text }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ingest failed");
        content = data.content;
        source = data.source;
      } else if (policy.type === "file") {
        const formData = new FormData();
        formData.append("file", policy.file);
        const res = await fetch("/api/ingest", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ingest failed");
        content = data.content;
        source = data.source;
      }

      setPolicySource(source);

      // Progress simulation while calling AI
      for (let i = 1; i < progressSteps.length; i++) {
        setAnalysisProgress(progressSteps[i]);
        await new Promise((r) => setTimeout(r, 600));
      }

      // Analyze step
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyContent: content,
          obligations: applicableObligations,
        }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      setAssessment(analyzeData.results);
      setStage("results");
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisProgress(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleShowCitations = (citations) => {
    setSelectedCitations(citations);
    setCitationPanelOpen(true);
  };

  const handleReset = () => {
    setStage("profile");
    setProfile(null);
    setPolicySource("");
    setAssessment(null);
  };

  const complianceStats = useMemo(() => {
    if (!assessment) return null;
    const total = assessment.length;
    const full = assessment.filter((a) => a.status === "FULL").length;
    const partial = assessment.filter((a) => a.status === "PARTIAL").length;
    const notMet = assessment.filter((a) => a.status === "NOT_MET").length;
    return {
      total,
      full,
      partial,
      notMet,
      score: Math.round(((full + partial * 0.5) / total) * 100),
    };
  }, [assessment]);

  const exportCSV = () => {
    if (!assessment) return;
    const headers = [
      "Obligation ID",
      "Title",
      "Strength",
      "Status",
      "Findings",
      "Gaps",
      "Recommendation",
      "Sources",
    ];
    const rows = assessment.map((a) => [
      a.obligation_id,
      a.title,
      a.obligation_strength,
      a.status,
      `"${(a.findings || "").replace(/"/g, '""')}"`,
      `"${(a.gaps || []).join("; ").replace(/"/g, '""')}"`,
      `"${(a.recommendation || "").replace(/"/g, '""')}"`,
      a.source_citations.map((c) => c.source_id).join("; "),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile?.orgName || "policy"}-compliance-assessment.csv`;
    a.click();
  };

  const exportPDF = () => {
    if (!assessment || !complianceStats) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const checkPageBreak = (neededSpace = 30) => {
      if (yPos + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    const addWrappedText = (text, maxWidth, lineHeight = 6) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach(() => {
        checkPageBreak(lineHeight);
        doc.text(lines.shift(), margin, yPos);
        yPos += lineHeight;
      });
      return yPos;
    };

    // Header
    doc.setFillColor(91, 141, 239);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("UK AI Policy Compliance Report", margin, 28);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("ICO - DSIT - CDEI Regulatory Assessment", margin, 38);

    yPos = 65;
    doc.setTextColor(230, 240, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(profile?.orgName || "Organisation", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(169, 182, 203);
    doc.text(
      `${profile?.sector?.replace(/_/g, " ") || "Sector"} - ${
        profile?.size || ""
      } employees`,
      margin,
      yPos
    );
    yPos += 6;
    doc.text(`Policy Source: ${policySource || "Not specified"}`, margin, yPos);
    yPos += 6;
    doc.text(
      `Assessment Date: ${new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      margin,
      yPos
    );

    // Score box
    yPos += 20;
    doc.setFillColor(27, 36, 50);
    doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, "F");
    const scoreColor =
      complianceStats.score >= 70
        ? [34, 197, 94]
        : complianceStats.score >= 40
        ? [245, 158, 11]
        : [239, 68, 68];
    doc.setFillColor(...scoreColor);
    doc.circle(margin + 30, yPos + 25, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${complianceStats.score}%`, margin + 30, yPos + 28, {
      align: "center",
    });
    doc.setTextColor(230, 240, 255);
    doc.setFontSize(12);
    doc.text("Compliance Score", margin + 60, yPos + 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(169, 182, 203);
    doc.text(`${complianceStats.total} obligations assessed`, margin + 60, yPos + 25);
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text(`${complianceStats.full} Compliant`, margin + 60, yPos + 38);
    doc.setTextColor(245, 158, 11);
    doc.text(`${complianceStats.partial} Partial`, margin + 110, yPos + 38);
    doc.setTextColor(239, 68, 68);
    doc.text(`${complianceStats.notMet} Gaps`, margin + 155, yPos + 38);

    // Detailed findings pages
    doc.addPage();
    yPos = margin;
    doc.setFillColor(91, 141, 239);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Assessment Findings", margin, 17);
    yPos = 40;

    const statusOrder = ["NOT_MET", "PARTIAL", "FULL"];
    const statusLabels = {
      NOT_MET: "Gaps Identified",
      PARTIAL: "Partially Compliant",
      FULL: "Fully Compliant",
    };
    const statusColors = {
      NOT_MET: [239, 68, 68],
      PARTIAL: [245, 158, 11],
      FULL: [34, 197, 94],
    };

    statusOrder.forEach((status) => {
      const items = assessment.filter((a) => a.status === status);
      if (items.length === 0) return;
      checkPageBreak(40);
      doc.setFillColor(...statusColors[status]);
      doc.rect(margin, yPos, 4, 8, "F");
      doc.setTextColor(230, 240, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${statusLabels[status]} (${items.length})`, margin + 8, yPos + 6);
      yPos += 15;

      items.forEach((item) => {
        checkPageBreak(50);
        doc.setFillColor(27, 36, 50);
        doc.roundedRect(margin, yPos, contentWidth, 8, 1, 1, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(230, 240, 255);
        doc.text(item.title, margin + 3, yPos + 5.5);
        yPos += 12;

        if (item.findings) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(169, 182, 203);
          doc.text("Findings:", margin, yPos);
          yPos += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(230, 240, 255);
          addWrappedText(item.findings, contentWidth, 5);
        }

        if (item.gaps && item.gaps.length > 0 && item.status !== "FULL") {
          checkPageBreak(15);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(239, 68, 68);
          doc.text("Gaps:", margin, yPos);
          yPos += 5;
          doc.setFont("helvetica", "normal");
          item.gaps.slice(0, 3).forEach((gap) => {
            checkPageBreak(6);
            doc.setTextColor(169, 182, 203);
            doc.text(`- ${gap}`, margin + 3, yPos);
            yPos += 5;
          });
        }

        if (item.recommendation && item.status !== "FULL") {
          checkPageBreak(15);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(34, 197, 94);
          doc.text("Recommendation:", margin, yPos);
          yPos += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(230, 240, 255);
          addWrappedText(item.recommendation, contentWidth, 5);
        }

        yPos += 10;
      });
      yPos += 5;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(169, 182, 203);
      doc.text(
        `UK AI Policy Validator - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    doc.save(`${profile?.orgName || "policy"}-compliance-report.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-blue-400 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">
                UK AI Policy Validator
              </h1>
              <p className="text-sm text-muted">ICO - DSIT - CDEI Compliance</p>
            </div>
          </div>
          {stage !== "profile" && (
            <button
              onClick={handleReset}
              className="text-sm text-muted hover:text-foreground flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent rounded"
            >
              <ArrowLeft className="w-4 h-4" /> Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Stage */}
        {stage === "profile" && (
          <div className="max-w-xl mx-auto">
            <div className="card">
              <ProfileWizard onComplete={handleProfileComplete} />
            </div>
          </div>
        )}

        {/* Policy Input Stage */}
        {stage === "policy" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    Load Your AI Policy
                  </h2>
                  <p className="text-sm text-muted">
                    {applicableObligations.length} obligations apply based on
                    your profile
                  </p>
                </div>
              </div>
              <PolicyInput
                onPolicyLoaded={handlePolicyLoaded}
                isLoading={isAnalysing}
              />
            </div>

            <div className="bg-accent/10 rounded-xl border border-accent/30 p-6">
              <h3 className="font-medium text-accent mb-3">
                What we&apos;ll check for {profile?.orgName}:
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {applicableObligations.slice(0, 6).map((obl) => (
                  <div
                    key={obl.obligation_id}
                    className="flex items-center gap-2 text-sm text-accent"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {obl.title}
                  </div>
                ))}
                {applicableObligations.length > 6 && (
                  <div className="text-sm text-accent">
                    +{applicableObligations.length - 6} more...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysing Stage */}
        {stage === "analysing" && (
          <div className="max-w-xl mx-auto">
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
              <h2 className="text-xl font-black text-foreground mb-2">
                Analysing Your Policy
              </h2>
              <p className="text-muted mb-6">{analysisProgress}</p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-500 animate-pulse-subtle"
                  style={{ width: "60%" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Stage */}
        {stage === "results" && assessment && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="card text-center">
                <div className="text-3xl font-black text-foreground tabular">
                  {complianceStats?.score}%
                </div>
                <div className="text-sm text-muted">Compliance Score</div>
              </div>
              <div className="bg-green-900/20 rounded-xl border border-green-800 p-6 text-center">
                <div className="text-3xl font-black text-green-400 tabular">
                  {complianceStats?.full}
                </div>
                <div className="text-sm text-green-400">Compliant</div>
              </div>
              <div className="bg-amber-900/20 rounded-xl border border-amber-800 p-6 text-center">
                <div className="text-3xl font-black text-amber-400 tabular">
                  {complianceStats?.partial}
                </div>
                <div className="text-sm text-amber-400">Partial</div>
              </div>
              <div className="bg-red-900/20 rounded-xl border border-red-800 p-6 text-center">
                <div className="text-3xl font-black text-red-400 tabular">
                  {complianceStats?.notMet}
                </div>
                <div className="text-sm text-red-400">Gaps</div>
              </div>
            </div>

            {/* Org & Policy Info */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    {profile?.orgName}
                  </h2>
                  <p className="text-sm text-muted">
                    {profile?.sector?.replace("_", " ")} - {profile?.size}{" "}
                    employees - Policy: {policySource}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportPDF}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={exportCSV}
                    className="btn flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="card">
              <div className="border-b border-border px-6 py-4 -mx-4 -mt-4 mb-4">
                <h3 className="font-black text-foreground">
                  Compliance Assessment
                </h3>
                <p className="text-sm text-muted">
                  Click each obligation to see details and evidence
                </p>
              </div>
              <div className="space-y-4">
                {assessment.map((obl) => (
                  <ObligationCard
                    key={obl.obligation_id}
                    obligation={obl}
                    assessment={obl}
                    onShowCitations={handleShowCitations}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-muted">
          <p>
            This tool provides automated compliance analysis and is not legal
            advice. Consult qualified professionals for regulatory decisions.
          </p>
        </div>
      </footer>

      <CitationPanel
        citations={selectedCitations}
        isOpen={citationPanelOpen}
        onClose={() => setCitationPanelOpen(false)}
      />
    </div>
  );
}
