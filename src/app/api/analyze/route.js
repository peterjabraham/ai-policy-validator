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
        { error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY in environment." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a UK AI regulatory compliance expert. Analyse the provided AI policy against the given regulatory obligations.

For each obligation, determine:
1. status: "FULL" (fully addressed), "PARTIAL" (partially addressed), or "NOT_MET" (not addressed)
2. findings: What the policy says (or doesn't say) about this requirement
3. policy_match: Direct quote from the policy that addresses this (if any), or null
4. gaps: Array of specific gaps or missing elements
5. recommendation: Specific action to achieve compliance

Be precise and cite specific policy text where possible. If the policy doesn't mention something, mark it as NOT_MET.

IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no explanation, no code fences. Just the raw JSON array starting with [ and ending with ].

Each object in the array must have exactly these fields:
{ "obligation_id": "...", "status": "FULL" or "PARTIAL" or "NOT_MET", "findings": "...", "policy_match": "..." or null, "gaps": ["..."], "recommendation": "..." }`;

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

Return a JSON array with one assessment object per obligation. Start your response with [ and end with ].`;

    let response;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [{ role: "user", content: systemPrompt + "\n\n" + userPrompt }],
      });
    } catch (apiError) {
      console.error("Anthropic API call failed:", apiError);
      return NextResponse.json(
        { error: `Anthropic API error: ${apiError.message}` },
        { status: 502 }
      );
    }

    const text =
      response.content?.map((item) => item.text || "").join("") || "";
    
    if (!text) {
      console.error("Empty response from Anthropic API");
      return NextResponse.json(
        { error: "Empty response from AI. Please try again." },
        { status: 502 }
      );
    }

    // More robust JSON extraction
    let cleanJson = text;
    
    // Remove markdown code fences if present
    cleanJson = cleanJson.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
    
    // Try to find JSON array in the response
    const arrayMatch = cleanJson.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleanJson = arrayMatch[0];
    }
    
    cleanJson = cleanJson.trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI response. Raw text:", text.slice(0, 1000));
      console.error("Cleaned JSON attempt:", cleanJson.slice(0, 500));
      return NextResponse.json(
        { 
          error: "Failed to parse AI analysis response. The AI returned invalid JSON.",
          debug: process.env.NODE_ENV === "development" ? text.slice(0, 500) : undefined
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed)) {
      console.error("AI response is not an array:", typeof parsed);
      return NextResponse.json(
        { error: "AI response was not in expected format (array)." },
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
        gaps: Array.isArray(aiResult.gaps) ? aiResult.gaps : ["No coverage found"],
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
