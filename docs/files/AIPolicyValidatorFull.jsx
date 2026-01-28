import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, AlertTriangle, XCircle, FileText, Building2, Shield, Scale, Eye, Users, BookOpen, ExternalLink, Info, Download, ArrowLeft, Upload, Globe, Loader2, FileUp, Link, Sparkles, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

// ===== REGULATORY CANON DATA =====
const regulatorySources = {
  "ICO-AI-DP-2024": {
    source_id: "ICO-AI-DP-2024",
    title: "Guidance on AI and data protection",
    issuing_body: "ICO",
    url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
    binding_strength: "authoritative",
    description: "Comprehensive ICO guidance on applying data protection law to AI systems"
  },
  "ICO-RECRUIT-AI-2024": {
    source_id: "ICO-RECRUIT-AI-2024",
    title: "AI tools in recruitment: audits and recommendations",
    issuing_body: "ICO",
    url: "https://ico.org.uk/action-weve-taken/audits-and-overview-reports/2024/11/ai-tools-in-recruitment/",
    binding_strength: "authoritative",
    description: "ICO audit findings and recommendations for AI in recruitment"
  },
  "ICO-RECRUIT-QUESTIONS-2024": {
    source_id: "ICO-RECRUIT-QUESTIONS-2024",
    title: "Key data protection considerations for AI recruitment",
    issuing_body: "ICO",
    url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment-information/recruitment/key-data-protection-considerations-when-using-ai-in-recruitment/",
    binding_strength: "authoritative",
    description: "ICO checklist of data protection questions for recruitment AI"
  },
  "DSIT-HR-AI-2024": {
    source_id: "DSIT-HR-AI-2024",
    title: "Responsible AI in Recruitment",
    issuing_body: "DSIT",
    url: "https://www.gov.uk/government/publications/responsible-ai-in-recruitment-guide/responsible-ai-in-recruitment",
    binding_strength: "recommended",
    description: "Government guide for responsible use of AI in hiring"
  },
  "CDEI-ASSURANCE-2023": {
    source_id: "CDEI-ASSURANCE-2023",
    title: "Portfolio of AI Assurance Techniques",
    issuing_body: "CDEI",
    url: "https://www.gov.uk/guidance/portfolio-of-ai-assurance-techniques",
    binding_strength: "recommended",
    description: "CDEI framework for AI assurance and audit techniques"
  },
  "DSIT-PRINCIPLES-2024": {
    source_id: "DSIT-PRINCIPLES-2024",
    title: "UK AI Regulatory Principles",
    issuing_body: "DSIT",
    url: "https://www.gov.uk/government/publications/implementing-the-uks-ai-regulatory-principles-initial-guidance-for-regulators",
    binding_strength: "authoritative",
    description: "Cross-sector AI regulatory principles for UK organisations"
  },
  "ICO-INTERNAL-AI-2024": {
    source_id: "ICO-INTERNAL-AI-2024",
    title: "ICO's approach to using generative AI",
    issuing_body: "ICO",
    url: "https://ico.org.uk/about-the-ico/our-information/our-strategies-and-plans/icos-approach-to-using-generative-ai/",
    binding_strength: "model",
    description: "ICO's own AI policy - useful as a model for other organisations"
  }
};

const obligations = [
  {
    obligation_id: "OBL-DPIA-RECRUIT-001",
    title: "DPIA for Recruitment AI",
    description: "Complete and maintain a Data Protection Impact Assessment (DPIA) before deployment of any AI system used to profile, score, or rank job applicants.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "risk_assessment",
    icon: "Shield",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must carry out a DPIA before you begin any type of processing that is likely to result in a high risk.", section: "Risk Assessment" },
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Employers must complete a DPIA before integrating AI in recruitment.", section: "Key Findings" },
      { source_id: "DSIT-HR-AI-2024", quote: "You must complete a DPIA for the AI system.", section: "Legal Requirements" }
    ],
    what_good_looks_like: [
      "DPIA completed before AI system deployment",
      "DPIA reviewed when processing changes",
      "ICO consultation where residual high risk identified",
      "DPIA documents specific AI risks (bias, accuracy, transparency)"
    ]
  },
  {
    obligation_id: "OBL-TRANSPARENCY-RECRUIT-001",
    title: "Transparency for Recruitment AI",
    description: "Inform candidates about the use of AI in recruitment processes, including meaningful information about the logic involved.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "transparency",
    icon: "Eye",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must provide meaningful information about the logic involved in automated decision-making.", section: "Transparency" },
      { source_id: "ICO-RECRUIT-QUESTIONS-2024", quote: "Are you being transparent with candidates about the AI tools being used?", section: "Checklist" }
    ],
    what_good_looks_like: [
      "Privacy notice explicitly mentions AI use in recruitment",
      "Candidates informed at point of application",
      "Explanation of what AI assesses and how",
      "Information about human oversight in process"
    ]
  },
  {
    obligation_id: "OBL-FAIRNESS-RECRUIT-001",
    title: "Fairness in Recruitment AI",
    description: "Ensure AI recruitment systems do not unfairly discriminate against protected groups. Test for bias and mitigate unfair outcomes.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "fairness",
    icon: "Scale",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must process personal data fairly. This includes avoiding unjustified adverse effects on individuals.", section: "Fairness" },
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Concerns about unfair exclusion, inference of protected characteristics, and lack of human review.", section: "Audit Findings" },
      { source_id: "DSIT-HR-AI-2024", quote: "Test for bias across protected characteristics before deployment.", section: "Fairness Testing" }
    ],
    what_good_looks_like: [
      "Bias testing conducted across protected characteristics",
      "Regular monitoring for discriminatory outcomes",
      "Documented mitigation measures for identified bias",
      "Human review of AI recommendations"
    ]
  },
  {
    obligation_id: "OBL-VENDOR-DD-001",
    title: "Vendor Due Diligence",
    description: "Conduct due diligence on AI vendors including clarifying data protection roles, requesting bias testing evidence, and confirming data minimisation.",
    requirement_type: "regulatory",
    obligation_strength: "should",
    category: "governance",
    icon: "Building2",
    applies_when: { use_cases: ["recruitment_ai", "customer_support", "content_generation"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Clarify controller/processor roles. Request bias testing results and accuracy metrics from vendors.", section: "Recommendations" },
      { source_id: "ICO-RECRUIT-QUESTIONS-2024", quote: "Have you conducted due diligence on your AI provider?", section: "Vendor Management" }
    ],
    what_good_looks_like: [
      "Written due diligence process for AI vendors",
      "Controller/processor roles clarified in contracts",
      "Bias testing evidence requested and reviewed",
      "Data minimisation confirmed with vendor"
    ]
  },
  {
    obligation_id: "OBL-LAWFUL-BASIS-001",
    title: "Lawful Basis for Processing",
    description: "Identify and document a lawful basis for processing personal data through AI systems before processing begins.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "legal_compliance",
    icon: "FileText",
    applies_when: { use_cases: ["recruitment_ai", "customer_support", "profiling", "content_generation"], risk_level: ["low", "medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must identify a lawful basis before you begin processing personal data.", section: "Lawful Basis" },
      { source_id: "ICO-RECRUIT-QUESTIONS-2024", quote: "What is your lawful basis for using AI to process candidate data?", section: "Legal Basis" }
    ],
    what_good_looks_like: [
      "Lawful basis documented for each AI processing activity",
      "Legitimate interests assessment where relying on LI",
      "Special category data processing justified",
      "Basis communicated in privacy notice"
    ]
  },
  {
    obligation_id: "OBL-GOVERNANCE-001",
    title: "AI Governance Structure",
    description: "Establish appropriate governance structures for AI oversight, including clear accountability and decision-making processes.",
    requirement_type: "best_practice",
    obligation_strength: "should",
    category: "governance",
    icon: "Users",
    applies_when: { use_cases: ["recruitment_ai", "customer_support", "profiling", "content_generation"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "CDEI-ASSURANCE-2023", quote: "Effective AI governance requires clear lines of accountability and regular review mechanisms.", section: "Governance Framework" },
      { source_id: "DSIT-PRINCIPLES-2024", quote: "Organisations should have appropriate governance measures in place for AI systems.", section: "Accountability" }
    ],
    what_good_looks_like: [
      "Named AI governance owner or committee",
      "Regular AI system reviews scheduled",
      "Clear escalation paths for AI issues",
      "Board-level awareness of AI risks"
    ]
  },
  {
    obligation_id: "OBL-HUMAN-OVERSIGHT-001",
    title: "Human Oversight of AI Decisions",
    description: "Ensure meaningful human oversight of AI-assisted decisions, particularly those with significant effects on individuals.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "accountability",
    icon: "Users",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "Where decisions have legal or similarly significant effects, you must ensure meaningful human involvement.", section: "Automated Decision-Making" },
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Human reviewers must be able to challenge and override AI recommendations.", section: "Human Oversight" }
    ],
    what_good_looks_like: [
      "Human review of AI recommendations before final decisions",
      "Reviewers trained to challenge AI outputs",
      "Override capability documented and used",
      "Records kept of human review decisions"
    ]
  },
  {
    obligation_id: "OBL-BIAS-TESTING-001",
    title: "Pre-deployment Bias Testing",
    description: "Test AI systems for bias across protected characteristics before deployment and on an ongoing basis.",
    requirement_type: "regulatory",
    obligation_strength: "should",
    category: "fairness",
    icon: "Scale",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Request bias testing results from vendors. Conduct your own testing where possible.", section: "Bias Testing" },
      { source_id: "DSIT-HR-AI-2024", quote: "Test the AI system for bias before deployment and monitor ongoing.", section: "Testing Requirements" },
      { source_id: "CDEI-ASSURANCE-2023", quote: "Bias audits should examine outcomes across protected characteristics.", section: "Assurance Techniques" }
    ],
    what_good_looks_like: [
      "Bias testing conducted before go-live",
      "Tests cover all relevant protected characteristics",
      "Results documented with mitigation actions",
      "Ongoing monitoring for bias drift"
    ]
  },
  {
    obligation_id: "OBL-DOCUMENTATION-001",
    title: "AI System Documentation",
    description: "Maintain comprehensive documentation of AI systems including purpose, data inputs, logic, and limitations.",
    requirement_type: "regulatory",
    obligation_strength: "should",
    category: "accountability",
    icon: "FileText",
    applies_when: { use_cases: ["recruitment_ai", "customer_support", "profiling", "content_generation"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "Document your AI systems, including their purpose, the data they use, and their limitations.", section: "Documentation" },
      { source_id: "CDEI-ASSURANCE-2023", quote: "Maintain records that enable audit and review of AI system behaviour.", section: "Audit Trail" }
    ],
    what_good_looks_like: [
      "AI system register maintained",
      "Purpose and scope documented",
      "Data inputs and outputs recorded",
      "Known limitations documented"
    ]
  },
  {
    obligation_id: "OBL-TRAINING-001",
    title: "Staff AI Training",
    description: "Ensure staff involved in AI deployment and oversight receive appropriate training on AI risks and responsibilities.",
    requirement_type: "best_practice",
    obligation_strength: "should",
    category: "governance",
    icon: "BookOpen",
    applies_when: { use_cases: ["recruitment_ai", "customer_support", "profiling", "content_generation"], risk_level: ["low", "medium", "high"] },
    source_citations: [
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Train HR staff to understand AI tool limitations and when to override recommendations.", section: "Training" },
      { source_id: "DSIT-PRINCIPLES-2024", quote: "Staff should understand the AI systems they work with and their limitations.", section: "Workforce" }
    ],
    what_good_looks_like: [
      "AI awareness training for relevant staff",
      "Role-specific training for AI users",
      "Training on when to override AI",
      "Regular refresher training"
    ]
  }
];

// ===== HELPER FUNCTIONS =====
const getApplicableObligations = (profile) => {
  if (!profile) return [];
  return obligations.filter(obl => {
    const useCaseMatch = obl.applies_when.use_cases.some(uc => 
      profile.aiUseCases.includes(uc)
    );
    const riskMatch = !obl.applies_when.risk_level || 
      obl.applies_when.risk_level.includes(profile.riskLevel || 'medium');
    return useCaseMatch && riskMatch;
  });
};

const getIconComponent = (iconName) => {
  const icons = { Shield, Scale, Eye, Users, Building2, FileText, BookOpen };
  return icons[iconName] || Shield;
};

// ===== COMPONENTS =====

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    FULL: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Compliant' },
    PARTIAL: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle, label: 'Partial' },
    NOT_MET: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Gap' },
    PENDING: { bg: 'bg-gray-100', text: 'text-gray-500', icon: Info, label: 'Pending' }
  };
  const { bg, text, icon: Icon, label } = config[status] || config.PENDING;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
};

// Strength Badge
const StrengthBadge = ({ strength }) => {
  const config = {
    must: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    should: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    may: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  };
  const { bg, text, border } = config[strength] || config.should;
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${bg} ${text} ${border}`}>
      {strength.toUpperCase()}
    </span>
  );
};

// Citation Panel (slide-out)
const CitationPanel = ({ citations, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Regulatory Evidence</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        {citations.map((citation, idx) => {
          const source = regulatorySources[citation.source_id];
          return (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{source?.title}</div>
                  <div className="text-xs text-gray-500">{source?.issuing_body} • {citation.section}</div>
                </div>
              </div>
              <blockquote className="text-sm text-gray-700 italic border-l-2 border-blue-300 pl-3 mb-3">
                "{citation.quote}"
              </blockquote>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  source?.binding_strength === 'authoritative' ? 'bg-red-100 text-red-700' :
                  source?.binding_strength === 'recommended' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {source?.binding_strength}
                </span>
                <a href={source?.url} target="_blank" rel="noopener noreferrer" 
                   className="text-xs text-blue-600 hover:underline flex items-center gap-1">
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
  const IconComponent = getIconComponent(obligation.icon);
  
  return (
    <div className={`border rounded-lg overflow-hidden ${
      assessment?.status === 'FULL' ? 'border-green-200 bg-green-50/30' :
      assessment?.status === 'PARTIAL' ? 'border-amber-200 bg-amber-50/30' :
      assessment?.status === 'NOT_MET' ? 'border-red-200 bg-red-50/30' :
      'border-gray-200'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          assessment?.status === 'FULL' ? 'bg-green-100' :
          assessment?.status === 'PARTIAL' ? 'bg-amber-100' :
          assessment?.status === 'NOT_MET' ? 'bg-red-100' :
          'bg-gray-100'
        }`}>
          <IconComponent className={`w-5 h-5 ${
            assessment?.status === 'FULL' ? 'text-green-600' :
            assessment?.status === 'PARTIAL' ? 'text-amber-600' :
            assessment?.status === 'NOT_MET' ? 'text-red-600' :
            'text-gray-600'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{obligation.title}</span>
            <StrengthBadge strength={obligation.obligation_strength} />
          </div>
          <p className="text-sm text-gray-500 truncate">{obligation.description}</p>
        </div>
        <StatusBadge status={assessment?.status || 'PENDING'} />
        {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 bg-white">
          {assessment?.findings && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Findings</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{assessment.findings}</p>
            </div>
          )}
          
          {assessment?.policy_match && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Matched Policy Text</h4>
              <blockquote className="text-sm text-gray-600 bg-blue-50 rounded p-3 border-l-2 border-blue-300 italic">
                "{assessment.policy_match}"
              </blockquote>
            </div>
          )}
          
          {assessment?.gaps && assessment.gaps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Gaps Identified</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {assessment.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {assessment?.recommendation && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendation</h4>
              <p className="text-sm text-gray-600 bg-amber-50 rounded p-3">{assessment.recommendation}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Regulatory Sources</h4>
            <div className="flex flex-wrap gap-2">
              {obligation.source_citations.map((citation, idx) => (
                <button
                  key={idx}
                  onClick={() => onShowCitations(obligation.source_citations)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                >
                  <BookOpen className="w-3 h-3" />
                  {regulatorySources[citation.source_id]?.issuing_body}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">What Good Looks Like</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {obligation.what_good_looks_like.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
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
  const [inputMode, setInputMode] = useState('url'); // 'url' or 'upload' or 'paste'
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    onPolicyLoaded({ type: 'url', content: url, source: url });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
      onPolicyLoaded({ type: 'file', content, source: file.name, fileName: file.name });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    onPolicyLoaded({ type: 'paste', content: pastedText, source: 'Pasted text' });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setInputMode('url')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          URL
        </button>
        <button
          onClick={() => setInputMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={() => setInputMode('paste')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'paste' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste
        </button>
      </div>

      {inputMode === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Policy URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/ai-policy"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={!url.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Fetch & Analyse
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Enter the URL of your organisation's AI policy document. We'll fetch and analyse it against UK regulatory requirements.
          </p>
        </div>
      )}

      {inputMode === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {fileName ? (
                <span className="font-medium text-blue-600">{fileName}</span>
              ) : (
                'Drag and drop your AI policy document here'
              )}
            </p>
            <p className="text-sm text-gray-500 mb-4">Supports PDF, DOCX, TXT, MD files</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Upload className="w-4 h-4" />
              Browse files
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          {fileName && (
            <button
              onClick={() => onPolicyLoaded({ type: 'file', content: fileContent, source: fileName, fileName })}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Analyse Policy
            </button>
          )}
        </div>
      )}

      {inputMode === 'paste' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your AI policy text
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your AI policy document text here..."
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
          <button
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim() || isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
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
    orgName: '',
    sector: '',
    size: '',
    aiUseCases: [],
    dataTypes: [],
    riskLevel: 'medium'
  });

  const sectors = [
    { id: 'financial_services', label: 'Financial Services' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'retail', label: 'Retail & E-commerce' },
    { id: 'technology', label: 'Technology' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'public_sector', label: 'Public Sector' },
    { id: 'professional_services', label: 'Professional Services' },
    { id: 'other', label: 'Other' }
  ];

  const aiUseCases = [
    { id: 'recruitment_ai', label: 'Recruitment & HR', description: 'CV screening, candidate scoring, interview scheduling' },
    { id: 'customer_support', label: 'Customer Support', description: 'Chatbots, automated responses, sentiment analysis' },
    { id: 'content_generation', label: 'Content Generation', description: 'Marketing copy, reports, documentation' },
    { id: 'profiling', label: 'Profiling & Decisioning', description: 'Credit scoring, risk assessment, recommendations' },
    { id: 'internal_tools', label: 'Internal Productivity', description: 'Code assistants, document summarisation' }
  ];

  const handleUseCaseToggle = (id) => {
    setProfile(prev => ({
      ...prev,
      aiUseCases: prev.aiUseCases.includes(id)
        ? prev.aiUseCases.filter(uc => uc !== id)
        : [...prev.aiUseCases, id]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Organisation Details</h3>
            <p className="text-sm text-gray-500">Tell us about your organisation</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organisation Name</label>
            <input
              type="text"
              value={profile.orgName}
              onChange={(e) => setProfile({ ...profile, orgName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organisation name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
            <div className="grid grid-cols-2 gap-2">
              {sectors.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => setProfile({ ...profile, sector: sector.id })}
                  className={`px-4 py-3 rounded-lg border text-left transition-colors ${
                    profile.sector === sector.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {sector.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organisation Size</label>
            <div className="grid grid-cols-3 gap-2">
              {['1-50', '51-250', '250+'].map(size => (
                <button
                  key={size}
                  onClick={() => setProfile({ ...profile, size })}
                  className={`px-4 py-3 rounded-lg border text-center transition-colors ${
                    profile.size === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
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
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Use Cases</h3>
            <p className="text-sm text-gray-500">Select all AI applications your organisation uses or plans to use</p>
          </div>
          <div className="space-y-3">
            {aiUseCases.map(uc => (
              <button
                key={uc.id}
                onClick={() => handleUseCaseToggle(uc.id)}
                className={`w-full px-4 py-4 rounded-lg border text-left transition-colors ${
                  profile.aiUseCases.includes(uc.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{uc.label}</div>
                    <div className="text-sm text-gray-500">{uc.description}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    profile.aiUseCases.includes(uc.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {profile.aiUseCases.includes(uc.id) && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={profile.aiUseCases.length === 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Risk Assessment</h3>
            <p className="text-sm text-gray-500">What level of risk do your AI systems pose?</p>
          </div>
          <div className="space-y-3">
            {[
              { id: 'low', label: 'Low Risk', description: 'Internal productivity tools, no significant decisions about individuals' },
              { id: 'medium', label: 'Medium Risk', description: 'Customer-facing AI, some automated decisions with human oversight' },
              { id: 'high', label: 'High Risk', description: 'Decisions significantly affecting individuals (hiring, credit, healthcare)' }
            ].map(risk => (
              <button
                key={risk.id}
                onClick={() => setProfile({ ...profile, riskLevel: risk.id })}
                className={`w-full px-4 py-4 rounded-lg border text-left transition-colors ${
                  profile.riskLevel === risk.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{risk.label}</div>
                <div className="text-sm text-gray-500">{risk.description}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              Back
            </button>
            <button
              onClick={() => onComplete(profile)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
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
  const [stage, setStage] = useState('profile'); // profile -> policy -> analysing -> results
  const [profile, setProfile] = useState(null);
  const [policyData, setPolicyData] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState([]);

  const applicableObligations = useMemo(() => 
    profile ? getApplicableObligations(profile) : []
  , [profile]);

  const handleProfileComplete = (profileData) => {
    setProfile(profileData);
    setStage('policy');
  };

  const handlePolicyLoaded = async (policy) => {
    setPolicyData(policy);
    setIsAnalysing(true);
    setStage('analysing');
    
    try {
      // Simulate AI analysis with progress updates
      const progressSteps = [
        'Fetching policy document...',
        'Extracting policy statements...',
        'Matching against regulatory obligations...',
        'Identifying compliance gaps...',
        'Generating recommendations...'
      ];
      
      for (let i = 0; i < progressSteps.length; i++) {
        setAnalysisProgress(progressSteps[i]);
        await new Promise(r => setTimeout(r, 800));
      }

      // Call the AI to analyse the policy
      const analysisResult = await analysePolicy(policy.content, applicableObligations);
      setAssessment(analysisResult);
      setStage('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisProgress('Analysis failed. Please try again.');
    } finally {
      setIsAnalysing(false);
    }
  };

  // AI-powered policy analysis using Anthropic API
  const analysePolicy = async (policyContent, obligations) => {
    const systemPrompt = `You are a UK AI regulatory compliance expert. Analyse the provided AI policy against the given regulatory obligations.

For each obligation, determine:
1. status: "FULL" (fully addressed), "PARTIAL" (partially addressed), or "NOT_MET" (not addressed)
2. findings: What the policy says (or doesn't say) about this requirement
3. policy_match: Direct quote from the policy that addresses this (if any)
4. gaps: List of specific gaps or missing elements
5. recommendation: Specific action to achieve compliance

Be precise and cite specific policy text where possible. If the policy doesn't mention something, mark it as NOT_MET.

Respond ONLY with a JSON array of assessment objects, no other text.`;

    const userPrompt = `POLICY DOCUMENT:
${policyContent}

OBLIGATIONS TO ASSESS:
${JSON.stringify(obligations.map(o => ({
  id: o.obligation_id,
  title: o.title,
  description: o.description,
  strength: o.obligation_strength,
  what_good_looks_like: o.what_good_looks_like
})), null, 2)}

Analyse this policy against each obligation and return a JSON array.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            { role: "user", content: systemPrompt + "\n\n" + userPrompt }
          ]
        })
      });

      const data = await response.json();
      const text = data.content?.map(item => item.text || "").join("") || "";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      // Merge AI results with obligation data
      return obligations.map(obl => {
        const aiResult = parsed.find(r => r.id === obl.obligation_id || r.obligation_id === obl.obligation_id) || {};
        return {
          ...obl,
          status: aiResult.status || 'NOT_MET',
          findings: aiResult.findings || 'Not addressed in policy',
          policy_match: aiResult.policy_match || null,
          gaps: aiResult.gaps || ['No coverage found'],
          recommendation: aiResult.recommendation || 'Add policy provisions for this requirement'
        };
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to mock analysis
      return obligations.map(obl => ({
        ...obl,
        status: 'PENDING',
        findings: 'Unable to analyse - please review manually',
        policy_match: null,
        gaps: ['Analysis unavailable'],
        recommendation: 'Manual review required'
      }));
    }
  };

  const handleShowCitations = (citations) => {
    setSelectedCitations(citations);
    setCitationPanelOpen(true);
  };

  const handleReset = () => {
    setStage('profile');
    setProfile(null);
    setPolicyData(null);
    setAssessment(null);
  };

  const complianceStats = useMemo(() => {
    if (!assessment) return null;
    const total = assessment.length;
    const full = assessment.filter(a => a.status === 'FULL').length;
    const partial = assessment.filter(a => a.status === 'PARTIAL').length;
    const notMet = assessment.filter(a => a.status === 'NOT_MET').length;
    return { total, full, partial, notMet, score: Math.round((full + partial * 0.5) / total * 100) };
  }, [assessment]);

  const exportCSV = () => {
    if (!assessment) return;
    const headers = ['Obligation ID', 'Title', 'Strength', 'Status', 'Findings', 'Gaps', 'Recommendation', 'Sources'];
    const rows = assessment.map(a => [
      a.obligation_id,
      a.title,
      a.obligation_strength,
      a.status,
      `"${(a.findings || '').replace(/"/g, '""')}"`,
      `"${(a.gaps || []).join('; ').replace(/"/g, '""')}"`,
      `"${(a.recommendation || '').replace(/"/g, '""')}"`,
      a.source_citations.map(c => c.source_id).join('; ')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile?.orgName || 'policy'}-compliance-assessment.csv`;
    a.click();
  };

  const exportPDF = () => {
    if (!assessment || !complianceStats) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    // Helper function to add new page if needed
    const checkPageBreak = (neededSpace = 30) => {
      if (yPos + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };
    
    // Helper function to wrap text
    const addWrappedText = (text, x, y, maxWidth, lineHeight = 6) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line, i) => {
        checkPageBreak(lineHeight);
        doc.text(line, x, yPos);
        yPos += lineHeight;
      });
      return yPos;
    };
    
    // === TITLE PAGE ===
    // Header bar
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('UK AI Policy Compliance Report', margin, 28);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('ICO • DSIT • CDEI Regulatory Assessment', margin, 38);
    
    // Organisation info
    yPos = 65;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(profile?.orgName || 'Organisation', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const sectorLabel = profile?.sector?.replace(/_/g, ' ') || 'Sector';
    doc.text(`${sectorLabel} • ${profile?.size || ''} employees`, margin, yPos);
    
    yPos += 6;
    doc.text(`Policy Source: ${policyData?.source || 'Not specified'}`, margin, yPos);
    
    yPos += 6;
    doc.text(`Assessment Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, yPos);
    
    // Compliance Score Box
    yPos += 20;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
    
    // Score circle
    const scoreColor = complianceStats.score >= 70 ? [34, 197, 94] : complianceStats.score >= 40 ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(...scoreColor);
    doc.circle(margin + 30, yPos + 25, 18, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${complianceStats.score}%`, margin + 30, yPos + 28, { align: 'center' });
    
    // Score breakdown
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Compliance Score', margin + 60, yPos + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${complianceStats.total} obligations assessed`, margin + 60, yPos + 25);
    
    // Status counts
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text(`● ${complianceStats.full} Compliant`, margin + 60, yPos + 38);
    
    doc.setTextColor(245, 158, 11);
    doc.text(`● ${complianceStats.partial} Partial`, margin + 110, yPos + 38);
    
    doc.setTextColor(239, 68, 68);
    doc.text(`● ${complianceStats.notMet} Gaps`, margin + 155, yPos + 38);
    
    // === EXECUTIVE SUMMARY ===
    yPos += 70;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    const summaryText = `This assessment evaluates ${profile?.orgName || 'the organisation'}'s AI policy against ${complianceStats.total} applicable UK regulatory obligations from the ICO, DSIT, and CDEI. The overall compliance score is ${complianceStats.score}%, with ${complianceStats.full} requirements fully met, ${complianceStats.partial} partially addressed, and ${complianceStats.notMet} gaps requiring attention.`;
    addWrappedText(summaryText, margin, yPos, contentWidth);
    
    // Priority actions
    const criticalGaps = assessment.filter(a => a.status === 'NOT_MET' && a.obligation_strength === 'must');
    if (criticalGaps.length > 0) {
      yPos += 10;
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text('Critical Gaps (MUST requirements):', margin, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      criticalGaps.slice(0, 3).forEach((gap, i) => {
        yPos += 7;
        checkPageBreak();
        doc.text(`• ${gap.title}`, margin + 5, yPos);
      });
    }
    
    // === DETAILED FINDINGS ===
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Assessment Findings', margin, 17);
    
    yPos = 40;
    
    // Group by status
    const statusOrder = ['NOT_MET', 'PARTIAL', 'FULL'];
    const statusLabels = { NOT_MET: 'Gaps Identified', PARTIAL: 'Partially Compliant', FULL: 'Fully Compliant' };
    const statusColors = { NOT_MET: [239, 68, 68], PARTIAL: [245, 158, 11], FULL: [34, 197, 94] };
    
    statusOrder.forEach(status => {
      const items = assessment.filter(a => a.status === status);
      if (items.length === 0) return;
      
      checkPageBreak(40);
      
      // Section header
      doc.setFillColor(...statusColors[status]);
      doc.rect(margin, yPos, 4, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${statusLabels[status]} (${items.length})`, margin + 8, yPos + 6);
      yPos += 15;
      
      items.forEach((item, index) => {
        checkPageBreak(50);
        
        // Obligation box
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(margin, yPos, contentWidth, 8, 1, 1, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(item.title, margin + 3, yPos + 5.5);
        
        // Strength badge
        const strengthX = pageWidth - margin - 25;
        const strengthColor = item.obligation_strength === 'must' ? [239, 68, 68] : item.obligation_strength === 'should' ? [245, 158, 11] : [59, 130, 246];
        doc.setFillColor(...strengthColor);
        doc.roundedRect(strengthX, yPos + 1, 22, 5, 1, 1, 'F');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(item.obligation_strength.toUpperCase(), strengthX + 11, yPos + 4.5, { align: 'center' });
        
        yPos += 12;
        
        // Findings
        if (item.findings) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(80, 80, 80);
          doc.text('Findings:', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          addWrappedText(item.findings, margin, yPos, contentWidth, 5);
        }
        
        // Policy match quote
        if (item.policy_match) {
          checkPageBreak(20);
          doc.setFillColor(239, 246, 255);
          const quoteLines = doc.splitTextToSize(`"${item.policy_match}"`, contentWidth - 10);
          const quoteHeight = quoteLines.length * 5 + 6;
          doc.roundedRect(margin, yPos, contentWidth, quoteHeight, 1, 1, 'F');
          doc.setDrawColor(59, 130, 246);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, margin, yPos + quoteHeight);
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(30, 64, 175);
          yPos += 4;
          quoteLines.forEach(line => {
            doc.text(line, margin + 5, yPos);
            yPos += 5;
          });
          yPos += 3;
        }
        
        // Gaps
        if (item.gaps && item.gaps.length > 0 && item.status !== 'FULL') {
          checkPageBreak(15);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(239, 68, 68);
          doc.text('Gaps:', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          item.gaps.slice(0, 3).forEach(gap => {
            checkPageBreak(6);
            doc.setTextColor(100, 100, 100);
            doc.text(`• ${gap}`, margin + 3, yPos);
            yPos += 5;
          });
        }
        
        // Recommendation
        if (item.recommendation && item.status !== 'FULL') {
          checkPageBreak(15);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 197, 94);
          doc.text('Recommendation:', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          addWrappedText(item.recommendation, margin, yPos, contentWidth, 5);
        }
        
        // Sources
        const sources = item.source_citations.map(c => regulatorySources[c.source_id]?.issuing_body).filter(Boolean);
        if (sources.length > 0) {
          checkPageBreak(10);
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Sources: ${[...new Set(sources)].join(', ')}`, margin, yPos);
          yPos += 5;
        }
        
        yPos += 10;
      });
      
      yPos += 5;
    });
    
    // === REGULATORY SOURCES ===
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Regulatory Sources Referenced', margin, 17);
    
    yPos = 40;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This assessment references the following UK regulatory guidance:', margin, yPos);
    
    yPos += 15;
    
    Object.values(regulatorySources).forEach(source => {
      checkPageBreak(25);
      
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(source.title, margin + 5, yPos + 7);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${source.issuing_body} • ${source.binding_strength}`, margin + 5, yPos + 14);
      
      yPos += 25;
    });
    
    // Footer on each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`UK AI Policy Validator • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Generated ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`${profile?.orgName || 'policy'}-compliance-report.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">UK AI Policy Validator</h1>
              <p className="text-sm text-gray-500">ICO • DSIT • CDEI Compliance</p>
            </div>
          </div>
          {stage !== 'profile' && (
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Stage */}
        {stage === 'profile' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <ProfileWizard onComplete={handleProfileComplete} />
            </div>
          </div>
        )}

        {/* Policy Input Stage */}
        {stage === 'policy' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Load Your AI Policy</h2>
                  <p className="text-sm text-gray-500">
                    {applicableObligations.length} obligations apply based on your profile
                  </p>
                </div>
              </div>
              <PolicyInput onPolicyLoaded={handlePolicyLoaded} isLoading={isAnalysing} />
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-medium text-blue-900 mb-3">What we'll check for {profile?.orgName}:</h3>
              <div className="grid grid-cols-2 gap-2">
                {applicableObligations.slice(0, 6).map(obl => (
                  <div key={obl.obligation_id} className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle className="w-4 h-4" />
                    {obl.title}
                  </div>
                ))}
                {applicableObligations.length > 6 && (
                  <div className="text-sm text-blue-600">+{applicableObligations.length - 6} more...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysing Stage */}
        {stage === 'analysing' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysing Your Policy</h2>
              <p className="text-gray-500 mb-6">{analysisProgress}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Results Stage */}
        {stage === 'results' && assessment && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">{complianceStats?.score}%</div>
                <div className="text-sm text-gray-500">Compliance Score</div>
              </div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{complianceStats?.full}</div>
                <div className="text-sm text-green-600">Compliant</div>
              </div>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 text-center">
                <div className="text-3xl font-bold text-amber-600">{complianceStats?.partial}</div>
                <div className="text-sm text-amber-600">Partial</div>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
                <div className="text-3xl font-bold text-red-600">{complianceStats?.notMet}</div>
                <div className="text-sm text-red-600">Gaps</div>
              </div>
            </div>

            {/* Org & Policy Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{profile?.orgName}</h2>
                  <p className="text-sm text-gray-500">
                    {profile?.sector?.replace('_', ' ')} • {profile?.size} employees • 
                    Policy: {policyData?.source}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileDown className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Compliance Assessment</h3>
                <p className="text-sm text-gray-500">Click each obligation to see details and evidence</p>
              </div>
              <div className="p-6 space-y-4">
                {assessment.map(obl => (
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

      <CitationPanel 
        citations={selectedCitations}
        isOpen={citationPanelOpen}
        onClose={() => setCitationPanelOpen(false)}
      />
    </div>
  );
}
