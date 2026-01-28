// Obligations data for client-side use
// Full data lives in uk_obligations.json; this mirrors the demo structure

export const obligations = [
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

export default obligations;
