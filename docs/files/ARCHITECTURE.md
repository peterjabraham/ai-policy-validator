# UK AI Policy Validator & Library: Architecture Specification

## 1. Executive Summary

A web-based tool that enables UK organisations to validate their AI policies against regulatory requirements, generate compliant policy content, and maintain audit-ready evidence trails with full citation traceback.

**Core Value Proposition**: Transform the fragmented UK AI regulatory landscape (DSIT, ICO, CDEI, sector regulators) into a normalised, machine-readable compliance framework that organisations can use to assess, generate, and evidence their AI governance.

---

## 2. Design Philosophy

### 2.1 Mirroring the Case Library Structure

Drawing from the AI case study library pattern, we adopt a parallel file structure:

| Case Library | Policy Validator | Purpose |
|-------------|------------------|---------|
| `casefile.md` | `profile.md` | Organisation overview, sector, AI use cases |
| `sources.json` | `applicable_sources.json` | Regulatory sources that apply to this org |
| `claims.json` | `policy_elements.json` | Extracted policy statements/declarations |
| `audit.json` | `assessment.json` | Compliance validation results |
| — | `recommendations.md` | Generated suggestions and gap remediation |
| — | `compliance_matrix.csv` | Exportable compliance matrix |

### 2.2 Evidence Chain Architecture

```
REGULATORY SOURCE → OBLIGATION → POLICY CLAUSE/CONTROL → EVIDENCE
     ↓                  ↓               ↓                    ↓
 ICO guidance    "Must do DPIA"   "Section 4.2 of     Assessment shows
 para 3.2.1                        our policy"        PARTIAL compliance
```

Every claim in the system traces back through this chain, enabling:
- Regulator defence: "Here's the ICO paragraph this implements"
- Board reporting: "Here's our compliance posture with evidence"
- Gap analysis: "Here's what's missing and why it matters"

---

## 3. Data Model

### 3.1 Regulatory Canon (Pre-loaded Reference Data)

#### 3.1.1 Regulatory Sources
```json
{
  "source_id": "ICO-AI-DP-2024",
  "title": "ICO Guidance on AI and Data Protection",
  "issuing_body": "ICO",
  "jurisdiction": "UK",
  "doc_type": "guidance",
  "binding_strength": "authoritative",
  "url": "https://ico.org.uk/for-organisations/...",
  "version": "2024-11",
  "effective_date": "2024-11-01",
  "last_checked": "2025-01-27",
  "sections": [
    {
      "section_id": "ICO-AI-DP-2024-S3.2",
      "title": "How do we ensure lawfulness in AI?",
      "path": "Part 1 > The basics > Lawfulness",
      "content_hash": "abc123...",
      "obligation_strength": "must"
    }
  ]
}
```

#### 3.1.2 Obligations Register
```json
{
  "obligation_id": "OBL-DPIA-RECRUIT-001",
  "title": "DPIA for Recruitment AI",
  "description": "For any AI system used to profile, score, or rank job applicants in a way that may significantly affect their opportunities, the organisation must complete and maintain a Data Protection Impact Assessment (DPIA) before deployment and throughout the lifecycle.",
  "requirement_type": "legal",
  "obligation_strength": "must",
  "applies_when": {
    "sectors": ["all"],
    "use_cases": ["recruitment_ai", "profiling", "automated_decision_making"],
    "data_types": ["personal_data", "special_category"],
    "risk_level": ["high"]
  },
  "source_citations": [
    {
      "source_id": "ICO-AI-DP-2024",
      "section_id": "ICO-AI-DP-2024-S3.2",
      "quote": "You must carry out a DPIA before you begin any type of processing that is likely to result in a high risk.",
      "relevance": "primary"
    },
    {
      "source_id": "DSIT-HR-AI-2024",
      "section_id": "DSIT-HR-AI-2024-S4.1",
      "quote": "You must complete a DPIA for the AI system.",
      "relevance": "reinforcing"
    }
  ],
  "related_obligations": ["OBL-TRANSPARENCY-001", "OBL-FAIRNESS-001"],
  "control_suggestions": ["CTRL-DPIA-WORKFLOW", "CTRL-VENDOR-CHECK"]
}
```

#### 3.1.3 Policy Clause Templates
```json
{
  "clause_id": "CLS-DPIA-RECRUIT-001",
  "title": "Data Protection Impact Assessments for Recruitment AI",
  "satisfies_obligations": ["OBL-DPIA-RECRUIT-001"],
  "clause_text": "Before procuring or deploying any AI system that profiles, scores, or ranks job applicants, we will complete a Data Protection Impact Assessment (DPIA) to identify and mitigate privacy and fairness risks. The DPIA will be completed at the earliest possible stage (typically during procurement), updated when the system, data, or use changes, and retained as part of our accountability records. Where the DPIA identifies high risks that cannot be mitigated, we will not deploy the system until we have consulted the ICO or an alternative solution is found.",
  "customisation_points": {
    "timing": "earliest possible stage (typically during procurement)",
    "approval_authority": "DPO",
    "escalation_threshold": "high risks that cannot be mitigated"
  },
  "evidence_requirements": [
    "Completed DPIA documentation",
    "Approval records from DPO",
    "ICO consultation records (if applicable)"
  ],
  "maturity_levels": {
    "baseline": "DPIA completed before deployment",
    "enhanced": "DPIA at procurement stage with regular reviews",
    "advanced": "Continuous DPIA with automated risk monitoring"
  }
}
```

### 3.2 Organisation-Specific Data

#### 3.2.1 Organisation Profile (`profile.md`)
```yaml
---
org_id: "acme-corp-2025"
org_name: "ACME Corporation"
date_assessed: "2025-01-27"
assessment_version: "1.0"
---

## Organisation Profile

**Sector**: Financial Services (FCA regulated)
**Size**: SME (50-249 employees)
**Jurisdictions**: UK only

## AI Use Cases

1. **Recruitment AI** (High Risk)
   - CV screening and ranking
   - Video interview analysis
   - Candidate scoring

2. **Customer Support Chatbot** (Medium Risk)
   - FAQ automation
   - Ticket routing
   - Sentiment analysis

## Data Types Processed

- Personal data: Yes
- Special category data: Yes (recruitment)
- Criminal records: No
- Children's data: No

## Current Governance

- Data Protection Officer: Yes (named)
- AI Steering Committee: No
- Existing Policies: Data Protection Policy, IT Acceptable Use Policy
```

#### 3.2.2 Policy Elements (`policy_elements.json`)
```json
{
  "policy_id": "POL-ACME-2025-001",
  "org_id": "acme-corp-2025",
  "source_document": "ACME_AI_Policy_v1.2.docx",
  "extraction_date": "2025-01-27",
  "policy_elements": [
    {
      "element_id": "PE-001",
      "element_type": "dpia_commitment",
      "extracted_text": "We conduct impact assessments for new AI systems.",
      "source_location": "Section 4.2, paragraph 3, page 8",
      "confidence": 0.85,
      "matched_obligations": ["OBL-DPIA-RECRUIT-001"],
      "coverage_assessment": "partial",
      "gaps_identified": [
        "Does not specify timing (procurement vs deployment)",
        "No mention of ongoing reviews",
        "No escalation to ICO procedure"
      ]
    },
    {
      "element_id": "PE-002",
      "element_type": "transparency_statement",
      "extracted_text": "Employees will be informed when AI tools are used in performance decisions.",
      "source_location": "Section 5.1, paragraph 1, page 10",
      "confidence": 0.92,
      "matched_obligations": ["OBL-TRANSPARENCY-001"],
      "coverage_assessment": "full",
      "gaps_identified": []
    }
  ]
}
```

#### 3.2.3 Assessment Results (`assessment.json`)
```json
{
  "assessment_id": "ASSESS-ACME-2025-001",
  "policy_id": "POL-ACME-2025-001",
  "org_id": "acme-corp-2025",
  "assessed_at": "2025-01-27T14:30:00Z",
  "assessor": "AI Policy Validator v1.0",
  "overall_status": "partial_compliance",
  "compliance_score": 0.68,
  "summary": {
    "total_obligations": 12,
    "fully_met": 5,
    "partially_met": 4,
    "not_met": 3,
    "not_applicable": 0
  },
  "gap_analysis": [
    {
      "obligation_id": "OBL-DPIA-RECRUIT-001",
      "obligation_title": "DPIA for Recruitment AI",
      "status": "PARTIAL",
      "policy_element_ids": ["PE-001"],
      "findings": "DPIA commitment exists but lacks specificity on timing, review cycles, and ICO escalation procedures.",
      "risk_level": "high",
      "recommendations": [
        "Add procurement-stage trigger for DPIA initiation",
        "Specify DPO approval requirement",
        "Include ICO consultation procedure for residual high risks"
      ],
      "suggested_clause_id": "CLS-DPIA-RECRUIT-001",
      "evidence_citations": [
        {
          "source_id": "ICO-AI-DP-2024",
          "section_id": "ICO-AI-DP-2024-S3.2",
          "quote": "DPIAs should be started at the earliest practicable stage..."
        }
      ]
    }
  ],
  "tier_assessment": {
    "current_tier": "basic",
    "target_tier": "enhanced",
    "gaps_to_close": 4
  }
}
```

---

## 4. Compliance Matrix Export

The system generates audit-ready compliance matrices:

| Internal ID | Obligation | Status | Policy Coverage | Gaps | Regulatory Source |
|-------------|-----------|--------|-----------------|------|-------------------|
| OBL-DPIA-RECRUIT-001 | DPIA before recruitment AI | PARTIAL | Section 4.2 | Missing timing | ICO AI guidance S3.2; DSIT HR AI S4.1 |
| OBL-TRANSPARENCY-001 | Inform subjects of AI use | FULL | Section 5.1 | None | ICO AI guidance S5.1 |
| OBL-GOVERNANCE-001 | AI steering committee | NOT_MET | None | No governance structure | CDEI Assurance Portfolio |

---

## 5. System Architecture

### 5.1 Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Upload   │  │ Profile  │  │ Assess-  │  │ Compliance       │ │
│  │ Policy   │  │ Wizard   │  │ ment     │  │ Matrix Export    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PROCESSING ENGINE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Policy       │  │ Obligation   │  │ Gap Analysis &       │   │
│  │ Parser       │  │ Matcher      │  │ Recommendation       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REGULATORY CANON (Static)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Sources      │  │ Obligations  │  │ Clause Templates     │   │
│  │ (ICO, DSIT)  │  │ Register     │  │ Library              │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 User Flow

```
1. UPLOAD/INPUT
   ├── Upload existing policy document (.docx, .pdf)
   └── OR Answer questionnaire (no existing policy)
           │
           ▼
2. PROFILE ORGANISATION
   ├── Sector classification
   ├── Size and jurisdiction
   ├── AI use cases (with risk levels)
   └── Data types processed
           │
           ▼
3. DETERMINE APPLICABLE OBLIGATIONS
   ├── Filter by sector
   ├── Filter by use cases
   ├── Filter by data types
   └── Filter by risk level
           │
           ▼
4. EXTRACT & MATCH POLICY ELEMENTS
   ├── Parse uploaded policy
   ├── Extract statements/commitments
   └── Match against obligations
           │
           ▼
5. GAP ANALYSIS
   ├── Compare coverage vs requirements
   ├── Identify missing/weak areas
   └── Prioritise by risk
           │
           ▼
6. GENERATE OUTPUTS
   ├── Assessment report
   ├── Compliance matrix (CSV/PDF)
   ├── Recommended clause library
   └── Remediation roadmap
```

---

## 6. UK Regulatory Canon: Initial Scope

### 6.1 Primary Sources (Phase 1)

| Source | Issuing Body | Focus Area |
|--------|-------------|------------|
| AI and Data Protection Guidance | ICO | Data protection, DPIAs, lawfulness |
| AI in Recruitment Audits & Recommendations | ICO | Employment AI, fairness, transparency |
| Explaining Decisions Made with AI | ICO/Turing | Explainability, accountability |
| Responsible AI in Recruitment | DSIT (RTAU) | HR AI, assurance mechanisms |
| Portfolio of AI Assurance Techniques | CDEI | Risk assessment, testing, governance |
| UK AI Regulatory Principles | DSIT | Cross-sector principles |
| Internal AI Use Policy | ICO | Model governance policy |

### 6.2 Sector Extensions (Phase 2)

| Sector | Regulator | Key Guidance |
|--------|-----------|--------------|
| Financial Services | FCA | DP23/4, AI in financial services |
| Healthcare | MHRA, NHSE | AI as Medical Device, NHS AI Lab |
| Legal Services | SRA | AI and legal services guidance |
| Education | DfE | Generative AI in education |

---

## 7. Citation & Evidence Format

### 7.1 In-Document Citation Style

```markdown
**Policy text with inline citations:**

Before procuring or deploying any AI system that profiles, scores, or ranks 
job applicants, we will complete a **Data Protection Impact Assessment (DPIA)** 
to identify and mitigate privacy and fairness risks. [ICO-AI-DP-2024-S3.2] [DSIT-HR-AI-2024-S4.1]
```

### 7.2 Evidence Panel Format

When hovering/clicking on a citation badge:

```
┌─────────────────────────────────────────────────────────────────┐
│ EVIDENCE: DPIA for Recruitment AI                               │
├─────────────────────────────────────────────────────────────────┤
│ SOURCE 1: ICO AI and Data Protection Guidance                   │
│ Section: 3.2 - Lawfulness                                       │
│ Strength: MUST (legal requirement)                              │
│ Quote: "You must carry out a DPIA before you begin any type     │
│        of processing that is likely to result in a high risk."  │
│ URL: https://ico.org.uk/...                                     │
├─────────────────────────────────────────────────────────────────┤
│ SOURCE 2: DSIT Responsible AI in Recruitment                    │
│ Section: 4.1 - Pre-deployment assurance                         │
│ Strength: MUST (government guidance)                            │
│ Quote: "You must complete a DPIA for the AI system."            │
│ URL: https://gov.uk/...                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Differentiation from Case Library

| Aspect | Case Library | Policy Validator |
|--------|-------------|------------------|
| **Direction** | Document → Validate claims | Requirements → Check coverage |
| **Sources** | Discovered per case | Pre-loaded regulatory canon |
| **Primary output** | Validated case study | Compliance assessment + remediation |
| **Update trigger** | New case | Regulatory change |
| **User action** | Research | Implement |

---

## 9. Technology Stack (Recommended)

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Zustand** for state management
- **React Hook Form** for wizard flows

### Backend (if needed)
- **Node.js** with Express or Fastify
- **OpenAI/Claude API** for policy text analysis
- **PostgreSQL** for persistence
- **Redis** for caching

### Document Processing
- **pdf-parse** for PDF extraction
- **mammoth** for DOCX extraction
- **OpenAI embeddings** for semantic matching

### Export
- **docx-js** for Word generation
- **pdfmake** for PDF generation
- **papaparse** for CSV export

---

## 10. MVP Scope

### Phase 1: Core Validator (MVP)
- [ ] Organisation profile wizard
- [ ] Regulatory canon for recruitment AI (ICO + DSIT)
- [ ] Manual policy element entry (no document parsing)
- [ ] Basic gap analysis engine
- [ ] Compliance matrix export (CSV)
- [ ] Recommended clauses display

### Phase 2: Document Intelligence
- [ ] Policy document upload (.docx, .pdf)
- [ ] AI-powered policy element extraction
- [ ] Semantic matching to obligations
- [ ] Full ICO guidance coverage

### Phase 3: Extended Coverage
- [ ] Sector-specific modules (FCA, MHRA)
- [ ] CDEI assurance techniques library
- [ ] Horizon scanning alerts
- [ ] Policy version tracking

---

## 11. File Structure

```
/policies/{org_id}/
├── 1_profile.md              # Organisation overview
├── 2_applicable_sources.json # Regulatory sources that apply
├── 3_policy_elements.json    # Extracted/declared policy content
├── 4_assessment.json         # Compliance assessment results
├── 5_recommendations.md      # Generated suggestions
├── 6_compliance_matrix.csv   # Exportable matrix
└── uploads/
    └── original_policy.docx  # Source document
```

This mirrors the case library pattern while adapting for the compliance validation use case.
