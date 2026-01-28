# UK AI Policy Validator

A web app that validates company AI policies against UK regulatory requirements (ICO, DSIT, CDEI) with evidence-backed compliance assessment, gap analysis, and exportable reports.

## Features

- **Profile wizard** — capture organisation details, AI use cases, and risk level
- **Policy ingestion** — fetch from URL, upload PDF/DOCX/TXT/MD, or paste text
- **AI-powered analysis** — calls Anthropic Claude to match policy text against regulatory obligations
- **Compliance scoring** — FULL / PARTIAL / NOT_MET per obligation; overall percentage
- **Evidence chain** — every finding traces back to ICO/DSIT/CDEI citations with quotes and links
- **Export** — CSV compliance matrix and multi-page PDF report

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS (design tokens from `docs/files/design.md`)
- Anthropic SDK (Claude Sonnet 4)
- pdf-parse, mammoth (file parsing)
- jsPDF (PDF export)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and add your Anthropic API key:

```bash
cp .env.example .env.local
# then edit .env.local
```

| Variable           | Required | Description                          |
|--------------------|----------|--------------------------------------|
| `ANTHROPIC_API_KEY`| Yes      | Your Anthropic API key               |
| `MAX_UPLOAD_MB`    | No       | Max upload size in MB (default 5)    |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Docker

Build and run with Docker:

```bash
docker build -t ai-policy-validator .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=sk-ant-... ai-policy-validator
```

## Deploy to Railway

1. Push this repo to GitHub.
2. Create a new Railway project and connect the GitHub repo.
3. Add environment variable `ANTHROPIC_API_KEY` in Railway.
4. Railway auto-detects the Dockerfile and deploys.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.js   # AI analysis endpoint
│   │   └── ingest/route.js    # URL/file/paste ingestion
│   ├── globals.css            # Tailwind + design tokens
│   ├── layout.js
│   └── page.js                # Main validator UI
├── data/
│   ├── obligations.js         # Regulatory obligations
│   ├── regulatorySources.js   # ICO/DSIT/CDEI source metadata
│   ├── uk_obligations.json    # Full canonical data
│   └── uk_sources.json        # Full canonical data
docs/
├── DATA_SCHEMA_AND_FLOW.md    # Data schema + data flow
└── files/                     # Original design and reference files
```

## Data Schema

See [`docs/DATA_SCHEMA_AND_FLOW.md`](docs/DATA_SCHEMA_AND_FLOW.md) for field definitions and data flow diagrams.

## Secrets and Security

- **Never commit `.env.local`** — it's in `.gitignore`.
- Rotate your Anthropic key if leaked.
- API routes enforce size limits and timeouts.

## Privacy and Disclaimer

This tool performs automated compliance analysis using AI. Results are informational only and do not constitute legal advice. Consult qualified professionals for regulatory decisions.

Policy text is sent to the Anthropic API for analysis. Review Anthropic's privacy policy for data handling.

## License

MIT
