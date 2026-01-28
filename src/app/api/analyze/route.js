import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Maximum allowed policy text length (characters)
const MAX_TEXT_LENGTH = 100_000;

export async function POST(request) {
  try {
    const { policyContent, obligations } = await request.json();

    if (!policyContent || typeof policyContent !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid policyContent" },
        { status: 400 }
      );
    }

    if (policyContent.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Policy text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!Array.isArray(obligations) || obligations.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty obligations array" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a UK AI regulatory compliance expert. Analyse the provided AI policy against the given regulatory obligations.

For each obligation, determine:
1. status: "FULL" (fully addressed), "PARTIAL" (partially addressed), or "NOT_MET" (not addressed)
2. findings: What the policy says (or doesn't say) about this requirement
3. policy_match: Direct quote from the policy that addresses this (if any)
4. gaps: Array of specific gaps or missing elements
5. recommendation: Specific action to achieve compliance

Be precise and cite specific policy text where possible. If the policy doesn't mention something, mark it as NOT_MET.

Respond ONLY with a JSON array of assessment objects, no other text. Each object must have:
{ "obligation_id": "...", "status": "FULL|PARTIAL|NOT_MET", "findings": "...", "policy_match": "..." or null, "gaps": [...], "recommendation": "..." }`;

    const userPrompt = `POLICY DOCUMENT:
${policyContent.slice(0, MAX_TEXT_LENGTH)}

OBLIGATIONS TO ASSESS:
${JSON.stringify(
  obligations.map((o) => ({
    id: o.obligation_id,
    title: o.title,
    description: o.description,
    strength: o.obligation_strength,
    what_good_looks_like: o.what_good_looks_like,
  })),
  null,
  2
)}

Analyse this policy against each obligation and return a JSON array.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: systemPrompt + "\n\n" + userPrompt }],
    });

    const text =
      response.content?.map((item) => item.text || "").join("") || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse AI response:", cleanJson.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI analysis response" },
        { status: 500 }
      );
    }

    // Merge AI results with original obligation data
    const results = obligations.map((obl) => {
      const aiResult =
        parsed.find(
          (r) => r.id === obl.obligation_id || r.obligation_id === obl.obligation_id
        ) || {};
      return {
        ...obl,
        status: aiResult.status || "NOT_MET",
        findings: aiResult.findings || "Not addressed in policy",
        policy_match: aiResult.policy_match || null,
        gaps: aiResult.gaps || ["No coverage found"],
        recommendation:
          aiResult.recommendation || "Add policy provisions for this requirement",
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
