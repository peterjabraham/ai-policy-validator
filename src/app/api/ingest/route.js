import { NextResponse } from "next/server";
import mammoth from "mammoth";

// Extract text from PDF using unpdf (serverless-friendly)
async function parsePdf(buffer) {
  const { extractText } = await import("unpdf");
  // unpdf requires Uint8Array, not Buffer
  const uint8Array = new Uint8Array(buffer);
  const result = await extractText(uint8Array);
  // result.text is an array of strings (one per page), join them
  const text = Array.isArray(result.text)
    ? result.text.join("\n\n")
    : (result.text || "");
  return { text };
}

// Maximum upload size in bytes (default 5MB)
const MAX_UPLOAD_BYTES = parseInt(process.env.MAX_UPLOAD_MB || "5", 10) * 1024 * 1024;

// Check if extracted text looks like valid readable content (not PDF internals)
function isValidTextContent(text) {
  if (!text || text.length < 50) return false;

  // Check for PDF internal markers that indicate failed extraction
  const pdfInternalMarkers = [
    '/Type /Font',
    '/BaseFont',
    '/Encoding',
    'endobj',
    'stream',
    '/Filter',
    '/Length',
    '%PDF-',
    'xref',
    'trailer',
  ];

  const lowerText = text.toLowerCase();
  const markerCount = pdfInternalMarkers.filter(marker =>
    lowerText.includes(marker.toLowerCase())
  ).length;

  // If more than 2 PDF internal markers found, likely corrupted extraction
  if (markerCount > 2) return false;

  // Check that text has reasonable word-like content
  const words = text.split(/\s+/).filter(w => w.length > 2 && /^[a-zA-Z]/.test(w));
  if (words.length < 20) return false;

  return true;
}

// Strip HTML tags and clean up text
function htmlToText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle URL fetch or text paste
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
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; UK-AI-Policy-Validator/1.0)",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7"
            },
            signal: AbortSignal.timeout(30000),
            redirect: "follow",
          });

          if (!res.ok) {
            return NextResponse.json(
              { error: `Failed to fetch URL: ${res.status} ${res.statusText}` },
              { status: 400 }
            );
          }

          const responseContentType = res.headers.get("content-type") || "";
          let textContent = "";

          // Handle PDF URLs
          if (responseContentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf")) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (buffer.length > MAX_UPLOAD_BYTES) {
              return NextResponse.json(
                { error: `PDF exceeds max size of ${MAX_UPLOAD_BYTES / 1024 / 1024}MB` },
                { status: 400 }
              );
            }

            try {
              const data = await parsePdf(buffer);
              textContent = data.text || "";

              if (!isValidTextContent(textContent)) {
                return NextResponse.json(
                  { error: "Could not extract readable text from this PDF. The PDF may be image-based (scanned), encrypted, or use unsupported encoding. Try copying the text manually and using the Paste option instead." },
                  { status: 400 }
                );
              }
            } catch (err) {
              return NextResponse.json(
                { error: `PDF parse failed: ${err.message}` },
                { status: 400 }
              );
            }
          }
          // Handle DOCX URLs
          else if (responseContentType.includes("application/vnd.openxmlformats") ||
            responseContentType.includes("application/msword") ||
            url.toLowerCase().endsWith(".docx") ||
            url.toLowerCase().endsWith(".doc")) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            try {
              const result = await mammoth.extractRawText({ buffer });
              textContent = result.value || "";
            } catch (err) {
              return NextResponse.json(
                { error: `DOCX parse failed: ${err.message}` },
                { status: 400 }
              );
            }
          }
          // Handle HTML/text URLs
          else {
            const html = await res.text();
            textContent = htmlToText(html);
          }

          if (!textContent || textContent.length < 50) {
            return NextResponse.json(
              { error: "Could not extract meaningful text from the URL. The page may require authentication, be empty, or use JavaScript rendering." },
              { status: 400 }
            );
          }

          return NextResponse.json({ content: textContent, source: url });
        } catch (err) {
          if (err.name === "TimeoutError" || err.name === "AbortError") {
            return NextResponse.json(
              { error: "URL fetch timed out. The server may be slow or unreachable." },
              { status: 400 }
            );
          }
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

          if (!isValidTextContent(textContent)) {
            return NextResponse.json(
              { error: "Could not extract readable text from this PDF. The PDF may be image-based (scanned), encrypted, or use unsupported encoding. Try copying the text manually and using the Paste option instead." },
              { status: 400 }
            );
          }
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

      if (!textContent || textContent.length < 50) {
        return NextResponse.json(
          { error: "Could not extract meaningful text from the file. It may be empty or corrupted." },
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
