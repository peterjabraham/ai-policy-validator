// Regulatory sources data for client-side use
// Full data lives in uk_sources.json; this is a lightweight runtime lookup object

export const regulatorySources = {
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

export default regulatorySources;
