import { NextResponse } from "next/server";
import mammoth from "mammoth";

// pdf-parse doesn't have a proper ESM export, so we use dynamic import
async function parsePdf(buffer) {
  const pdfParse = (await import("pdf-parse")).default;
  return pdfParse(buffer);
}

// Maximum upload size in bytes (default 5MB)
const MAX_UPLOAD_BYTES = parseInt(process.env.MAX_UPLOAD_MB || "5", 10) * 1024 * 1024;

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle URL fetch
    if (contentType.includes("application/json")) {
      const { url, text } = await request.json();

      // Direct text paste
      if (text && typeof text === "string") {
        return NextResponse.json({ content: text.trim(), source: "Pasted text" });
      }

      // Fetch URL
      if (url && typeof url === "string") {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "UK-AI-Policy-Validator/1.0" },
            signal: AbortSignal.timeout(15000),
          });
          if (!res.ok) {
            return NextResponse.json(
              { error: `Failed to fetch URL: ${res.status}` },
              { status: 400 }
            );
          }
          const html = await res.text();
          // Basic HTML to text (strip tags)
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          return NextResponse.json({ content: textContent, source: url });
        } catch (err) {
          return NextResponse.json(
            { error: `URL fetch failed: ${err.message}` },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({ error: "Missing url or text" }, { status: 400 });
    }

    // Handle file upload (multipart form)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `File exceeds max size of ${MAX_UPLOAD_BYTES / 1024 / 1024}MB` },
          { status: 400 }
        );
      }

      const fileName = file.name || "upload";
      const ext = fileName.split(".").pop()?.toLowerCase();
      let textContent = "";

      if (ext === "pdf") {
        try {
          const data = await parsePdf(buffer);
          textContent = data.text || "";
        } catch (err) {
          return NextResponse.json(
            { error: `PDF parse failed: ${err.message}` },
            { status: 400 }
          );
        }
      } else if (ext === "docx" || ext === "doc") {
        try {
          const result = await mammoth.extractRawText({ buffer });
          textContent = result.value || "";
        } catch (err) {
          return NextResponse.json(
            { error: `DOCX parse failed: ${err.message}` },
            { status: 400 }
          );
        }
      } else if (ext === "txt" || ext === "md") {
        textContent = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: `Unsupported file type: .${ext}` },
          { status: 400 }
        );
      }

      return NextResponse.json({ content: textContent.trim(), source: fileName });
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (error) {
    console.error("Ingest API error:", error);
    return NextResponse.json(
      { error: error.message || "Ingest failed" },
      { status: 500 }
    );
  }
}
