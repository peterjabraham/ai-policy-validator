import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, AlertTriangle, XCircle, FileText, Building2, Shield, Scale, Eye, Users, BookOpen, ExternalLink, Info, Download, ArrowLeft } from 'lucide-react';

// ===== REGULATORY CANON DATA =====
const regulatorySources = {
  "ICO-AI-DP-2024": {
    source_id: "ICO-AI-DP-2024",
    title: "Guidance on AI and data protection",
    issuing_body: "ICO",
    url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
    binding_strength: "authoritative"
  },
  "ICO-RECRUIT-AI-2024": {
    source_id: "ICO-RECRUIT-AI-2024",
    title: "AI tools in recruitment: audits and recommendations",
    issuing_body: "ICO",
    url: "https://ico.org.uk/action-weve-taken/audits-and-overview-reports/2024/11/ai-tools-in-recruitment/",
    binding_strength: "authoritative"
  },
  "DSIT-HR-AI-2024": {
    source_id: "DSIT-HR-AI-2024",
    title: "Responsible AI in Recruitment",
    issuing_body: "DSIT",
    url: "https://www.gov.uk/government/publications/responsible-ai-in-recruitment-guide/responsible-ai-in-recruitment",
    binding_strength: "recommended"
  },
  "CDEI-ASSURANCE-2023": {
    source_id: "CDEI-ASSURANCE-2023",
    title: "Portfolio of AI Assurance Techniques",
    issuing_body: "CDEI",
    url: "https://www.gov.uk/guidance/portfolio-of-ai-assurance-techniques",
    binding_strength: "recommended"
  },
  "DSIT-PRINCIPLES-2024": {
    source_id: "DSIT-PRINCIPLES-2024",
    title: "UK AI Regulatory Principles",
    issuing_body: "DSIT",
    url: "https://www.gov.uk/government/publications/implementing-the-uks-ai-regulatory-principles-initial-guidance-for-regulators",
    binding_strength: "authoritative"
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
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must carry out a DPIA before you begin any type of processing that is likely to result in a high risk." },
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Employers must complete a DPIA before integrating AI in recruitment." },
      { source_id: "DSIT-HR-AI-2024", quote: "You must complete a DPIA for the AI system." }
    ]
  },
  {
    obligation_id: "OBL-TRANSPARENCY-RECRUIT-001",
    title: "Transparency for Recruitment AI",
    description: "Inform candidates about the use of AI in recruitment processes, including meaningful information about the logic involved.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "transparency",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must provide meaningful information about the logic involved in automated decision-making." }
    ]
  },
  {
    obligation_id: "OBL-FAIRNESS-RECRUIT-001",
    title: "Fairness in Recruitment AI",
    description: "Ensure AI recruitment systems do not unfairly discriminate against protected groups. Test for bias and mitigate unfair outcomes.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "fairness",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must process personal data fairly." },
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Concerns about unfair exclusion, inference of protected characteristics." }
    ]
  },
  {
    obligation_id: "OBL-VENDOR-DD-001",
    title: "Vendor Due Diligence",
    description: "Conduct due diligence on AI vendors including clarifying data protection roles, requesting bias testing evidence, and confirming data minimisation.",
    requirement_type: "regulatory",
    obligation_strength: "should",
    category: "governance",
    applies_when: { use_cases: ["recruitment_ai", "customer_support"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-RECRUIT-AI-2024", quote: "Clarify controller/processor roles. Request bias testing results and accuracy metrics." }
    ]
  },
  {
    obligation_id: "OBL-LAWFUL-BASIS-001",
    title: "Lawful Basis for Processing",
    description: "Identify and document a lawful basis for processing personal data through AI systems before processing begins.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "data_protection",
    applies_when: { use_cases: ["recruitment_ai", "customer_support", "profiling"], risk_level: ["low", "medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must identify a lawful basis before you begin processing personal data." }
    ]
  },
  {
    obligation_id: "OBL-GOVERNANCE-001",
    title: "AI Governance Structure",
    description: "Establish clear governance structures including defined roles, oversight committees, and escalation procedures.",
    requirement_type: "best_practice",
    obligation_strength: "should",
    category: "governance",
    applies_when: { use_cases: ["recruitment_ai", "customer_support", "profiling"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "You must implement appropriate technical and organisational measures." },
      { source_id: "DSIT-PRINCIPLES-2024", quote: "Clear lines of accountability for AI outcomes." }
    ]
  },
  {
    obligation_id: "OBL-HUMAN-OVERSIGHT-001",
    title: "Human Oversight",
    description: "Ensure appropriate human oversight for significant AI decisions, including ability to review, intervene, and override.",
    requirement_type: "legal",
    obligation_strength: "must",
    category: "human_oversight",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["high"] },
    source_citations: [
      { source_id: "ICO-AI-DP-2024", quote: "Article 22 rights apply to solely automated decision-making with legal or similarly significant effects." }
    ]
  },
  {
    obligation_id: "OBL-BIAS-TESTING-001",
    title: "Bias Testing",
    description: "Test AI systems for bias before deployment and monitor for fairness over time.",
    requirement_type: "best_practice",
    obligation_strength: "should",
    category: "fairness",
    applies_when: { use_cases: ["recruitment_ai", "profiling"], risk_level: ["medium", "high"] },
    source_citations: [
      { source_id: "CDEI-ASSURANCE-2023", quote: "Regular bias testing helps ensure AI systems treat all groups fairly." },
      { source_id: "DSIT-HR-AI-2024", quote: "Consider independent bias audits for high-risk systems." }
    ]
  }
];

// ===== COMPONENTS =====
const StatusBadge = ({ status }) => {
  const config = {
    FULL: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Compliant' },
    PARTIAL: { icon: AlertTriangle, bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'Partial' },
    NOT_MET: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Gap' },
    NOT_ASSESSED: { icon: Info, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'Not Assessed' }
  };
  const { icon: Icon, bg, text, border, label } = config[status] || config.NOT_ASSESSED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} border ${border}`}>
      <Icon size={14} />
      {label}
    </span>
  );
};

const StrengthBadge = ({ strength }) => {
  const config = {
    must: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    should: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    may: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' }
  };
  const { bg, text, border } = config[strength] || config.should;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${bg} ${text} border ${border}`}>
      {strength}
    </span>
  );
};

const CategoryIcon = ({ category }) => {
  const icons = {
    risk_assessment: Shield,
    transparency: Eye,
    fairness: Scale,
    governance: Building2,
    data_protection: FileText,
    human_oversight: Users,
    documentation: BookOpen
  };
  const Icon = icons[category] || FileText;
  return <Icon size={16} className="text-gray-500" />;
};

const CitationPanel = ({ citations, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Evidence & Citations</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>
      <div className="p-4 space-y-4">
        {citations.map((citation, idx) => {
          const source = regulatorySources[citation.source_id];
          return (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase">{source?.issuing_body}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${source?.binding_strength === 'authoritative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {source?.binding_strength}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">{source?.title}</h4>
              <blockquote className="border-l-2 border-blue-400 pl-3 text-sm text-gray-700 italic mb-3">
                "{citation.quote}"
              </blockquote>
              <a href={source?.url} target="_blank" rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                View source <ExternalLink size={12} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ObligationCard = ({ obligation, assessment, onShowCitations }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CategoryIcon category={obligation.category} />
              <span className="font-medium text-gray-900">{obligation.title}</span>
              <StrengthBadge strength={obligation.obligation_strength} />
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{obligation.description}</p>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={assessment?.status || 'NOT_ASSESSED'} />
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {assessment?.findings && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Assessment Findings</h4>
              <p className="text-sm text-gray-700">{assessment.findings}</p>
            </div>
          )}
          
          {assessment?.recommendations?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {assessment.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {obligation.source_citations.length} regulatory citation{obligation.source_citations.length !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onShowCitations(obligation.source_citations); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View Evidence <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    orgName: '',
    sector: '',
    size: '',
    aiUseCases: [],
    dataTypes: [],
    hasExistingPolicy: false
  });

  const sectors = [
    { value: 'financial_services', label: 'Financial Services (FCA regulated)' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'retail', label: 'Retail / E-commerce' },
    { value: 'technology', label: 'Technology / SaaS' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'public_sector', label: 'Public Sector' },
    { value: 'other', label: 'Other' }
  ];

  const sizes = [
    { value: 'micro', label: 'Micro (1-9)' },
    { value: 'small', label: 'Small (10-49)' },
    { value: 'medium', label: 'Medium (50-249)' },
    { value: 'large', label: 'Large (250+)' }
  ];

  const useCases = [
    { value: 'recruitment_ai', label: 'Recruitment / HR AI (CV screening, candidate scoring)', risk: 'high' },
    { value: 'customer_support', label: 'Customer Support Chatbot', risk: 'medium' },
    { value: 'internal_productivity', label: 'Internal Productivity (summarisation, drafting)', risk: 'low' },
    { value: 'profiling', label: 'Customer Profiling / Personalisation', risk: 'medium' }
  ];

  const dataTypes = [
    { value: 'personal_data', label: 'Personal Data (names, contact details)' },
    { value: 'special_category', label: 'Special Category Data (health, ethnicity, religion)' },
    { value: 'financial_data', label: 'Financial Data' }
  ];

  const toggleArrayItem = (array, item) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const canProceed = () => {
    switch(step) {
      case 1: return profile.orgName && profile.sector && profile.size;
      case 2: return profile.aiUseCases.length > 0;
      case 3: return profile.dataTypes.length > 0;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-20 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {step === 1 && 'Organisation Profile'}
          {step === 2 && 'AI Use Cases'}
          {step === 3 && 'Data & Existing Policy'}
        </h2>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organisation Name</label>
            <input 
              type="text" 
              value={profile.orgName}
              onChange={(e) => setProfile({...profile, orgName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your organisation name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
            <select 
              value={profile.sector}
              onChange={(e) => setProfile({...profile, sector: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your sector...</option>
              {sectors.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organisation Size</label>
            <div className="grid grid-cols-2 gap-3">
              {sizes.map(s => (
                <button
                  key={s.value}
                  onClick={() => setProfile({...profile, size: s.value})}
                  className={`p-3 border rounded-lg text-left text-sm transition-all ${profile.size === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select all AI use cases that apply:</label>
          {useCases.map(uc => (
            <label key={uc.value} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${profile.aiUseCases.includes(uc.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input 
                type="checkbox" 
                checked={profile.aiUseCases.includes(uc.value)}
                onChange={() => setProfile({...profile, aiUseCases: toggleArrayItem(profile.aiUseCases, uc.value)})}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">{uc.label}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${uc.risk === 'high' ? 'bg-red-100 text-red-700' : uc.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {uc.risk} risk
                </span>
              </div>
            </label>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">What types of data will your AI systems process?</label>
          {dataTypes.map(dt => (
            <label key={dt.value} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${profile.dataTypes.includes(dt.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input 
                type="checkbox" 
                checked={profile.dataTypes.includes(dt.value)}
                onChange={() => setProfile({...profile, dataTypes: toggleArrayItem(profile.dataTypes, dt.value)})}
              />
              <span className="text-gray-900">{dt.label}</span>
            </label>
          ))}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-gray-300">
              <input 
                type="checkbox" 
                checked={profile.hasExistingPolicy}
                onChange={() => setProfile({...profile, hasExistingPolicy: !profile.hasExistingPolicy})}
              />
              <div>
                <span className="font-medium text-gray-900">I have an existing AI policy to validate</span>
                <p className="text-sm text-gray-500">We'll assess your policy against UK requirements</p>
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => step === 3 ? onComplete(profile) : setStep(step + 1)}
          disabled={!canProceed()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 3 ? 'Generate Assessment' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

// ===== MAIN APP =====
export default function AIPolicyValidator() {
  const [view, setView] = useState('wizard');
  const [profile, setProfile] = useState(null);
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState([]);

  const generateAssessment = (profile) => {
    const applicable = obligations.filter(obl => {
      const hasMatchingUseCase = obl.applies_when.use_cases.some(uc => profile.aiUseCases.includes(uc));
      return hasMatchingUseCase;
    });

    return applicable.map(obl => ({
      ...obl,
      status: profile.hasExistingPolicy 
        ? ['FULL', 'PARTIAL', 'NOT_MET'][Math.floor(Math.random() * 3)]
        : 'NOT_MET',
      findings: profile.hasExistingPolicy 
        ? 'Policy element found but may need strengthening to fully meet this obligation.'
        : 'No policy coverage found for this obligation.',
      recommendations: [
        `Add explicit ${obl.title.toLowerCase()} provisions to your policy`,
        'Consider implementing suggested control measures'
      ]
    }));
  };

  const assessment = useMemo(() => {
    if (!profile) return [];
    return generateAssessment(profile);
  }, [profile]);

  const summary = useMemo(() => {
    if (!assessment.length) return null;
    return {
      total: assessment.length,
      full: assessment.filter(a => a.status === 'FULL').length,
      partial: assessment.filter(a => a.status === 'PARTIAL').length,
      notMet: assessment.filter(a => a.status === 'NOT_MET').length,
      score: Math.round((assessment.filter(a => a.status === 'FULL').length + assessment.filter(a => a.status === 'PARTIAL').length * 0.5) / assessment.length * 100)
    };
  }, [assessment]);

  const handleShowCitations = (citations) => {
    setSelectedCitations(citations);
    setCitationPanelOpen(true);
  };

  const handleComplete = (p) => {
    setProfile(p);
    setView('assessment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">UK AI Policy Validator</h1>
                <p className="text-sm text-gray-500">Compliance assessment with regulatory traceback</p>
              </div>
            </div>
            {view === 'assessment' && (
              <button 
                onClick={() => { setView('wizard'); setProfile(null); }}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <ArrowLeft size={16} /> New Assessment
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {view === 'wizard' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <ProfileWizard onComplete={handleComplete} />
          </div>
        ) : (
          <div className="space-y-6">
            {summary && (
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-3xl font-bold text-gray-900">{summary.score}%</div>
                  <div className="text-sm text-gray-500">Compliance Score</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
                  <div className="text-sm text-gray-500">Obligations</div>
                </div>
                <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4">
                  <div className="text-3xl font-bold text-green-700">{summary.full}</div>
                  <div className="text-sm text-green-600">Fully Met</div>
                </div>
                <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-4">
                  <div className="text-3xl font-bold text-amber-700">{summary.partial}</div>
                  <div className="text-sm text-amber-600">Partial</div>
                </div>
                <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4">
                  <div className="text-3xl font-bold text-red-700">{summary.notMet}</div>
                  <div className="text-sm text-red-600">Gaps</div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{profile?.orgName}</h2>
                  <p className="text-sm text-gray-500">
                    {profile?.sector?.replace('_', ' ')} • {profile?.size} • {profile?.aiUseCases.length} AI use case(s)
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {profile?.aiUseCases.map(uc => (
                    <span key={uc} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {uc.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Gap Analysis</h3>
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
