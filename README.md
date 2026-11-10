# THREADKEEP

> **A Project's Memory, Reconnected.**  
> *"Keep the knowledge. Keep the work moving."*  
> **Team:** SPY_2.O  
> **Hackathon Track:** Enterprise AI & Knowledge Continuity Platform

---

## 1. Product Vision & Problem

When software developers, technical leads, or project contributors depart a team, critical architectural knowledge gets fragmented across scattered documents, uncommitted meeting notes, undocumented decisions, and unassigned workstreams.

Incoming engineers and stakeholders struggle to answer:
- **What has already been completed?**
- **Why were certain architectural decisions made?**
- **What work is still pending?**
- **Which third-party dependencies are unverified or missing SLAs?**
- **What contradictions exist across legacy and modern specifications?**
- **What should the incoming team execute next?**

**THREADKEEP** solves this breakdown by ingesting project documentation (PDF, Word DOCX, CSV, and TXT), reconstructing technical architecture and decisions with exact line-level citations, surfacing blind spots in an automated **Knowledge Gap Radar**, detecting contradictions in a **Conflict Detection Workspace**, and generating verified **Executive Handover Dossiers** with exportable PDFs.

---

## 2. Technology Stack

- **Frontend:**
  - React.js (v18.3, Vite)
  - Tailwind CSS (Configured with custom SaaS editorial design system)
  - React Router DOM (v7)
  - Axios (with JWT interceptors)
  - Lucide React (Icons)
  - Recharts (Interactive Knowledge Health & Completeness visualizations)
  - PDF export & client-side printable layouts

- **Backend:**
  - Node.js & Express.js REST APIs
  - Modular layered controllers, middleware, and services
  - Centralized error handling and file validation

- **Database:**
  - MongoDB with Mongoose ODM
  - Embedded zero-config fallback support via `mongodb-memory-server`
  - 9 structured relational models: `User`, `Project`, `Document`, `ExtractedKnowledge`, `KnowledgeGap`, `Conflict`, `Review`, `Handover`, `ActivityLog`

- **AI & Document Intelligence:**
  - LLM API integration with `@google/generative-ai` (Google Gemini Flash)
  - Embedded **THREADKEEP Deep Intelligence Engine** for deterministic heuristic extraction, citation mapping, and contradiction analysis with zero external dependencies
  - Multi-format parsers: `pdf-parse` (PDF), `mammoth` (DOCX), `csv-parser` (CSV), native text stream (TXT, MD)

- **PDF Generation:**
  - Server-side executive handover rendering with `pdfkit`
  - Client-side printable report view

---

## 3. Design System & Color Palette

THREADKEEP features a bespoke editorial identity crafted to evoke precision, trust, and calm focus:

| Color Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Soft Aqua** | `#B8E5DF` | Primary highlights, interactive accents, brand pills |
| **Deep Teal** | `#285B55` | Primary buttons, headers, brand mark, key metrics |
| **Mint** | `#DDF3EC` | Soft badge backgrounds, selected states, success pills |
| **Sage Green** | `#A8C5B0` | Card borders, subtle divider lines, secondary badges |
| **Warm Ivory** | `#FAF9F5` | Background canvas, editorial panels, clean body text |
| **Charcoal** | `#303B39` | High-contrast typography, dark headers, status bars |
| **Soft Coral** | `#E9A69A` | Critical gaps, risks, rejection alerts |
| **Muted Gold** | `#D9BF83` | Contradiction alerts, warnings, inferred fact pills |

*Strict Design Rules Enforced: No generic blue, no neon colors, no excessive gradients, clean typography, consistent spacing.*

---

## 4. Application Architecture (15 Complete Pages)

1. **Landing Page (`/`):** Hero, product vision, problem vs solution comparison, interactive pillar preview, and CTA.
2. **Login Page (`/login`):** Authentication with 1-click Demo Architect credentials.
3. **Register Page (`/register`):** Account creation with organization and role assignment.
4. **Dashboard (`/app/dashboard`):** Real database stats, Knowledge Health Index, completeness donut chart, Project Memory Timeline.
5. **Projects Page (`/app/projects`):** Search, status filtering, health indicators, delete confirmation.
6. **Create Project (`/app/projects/create`):** Project form with live card preview.
7. **Project Details (`/app/projects/:id`):** Project metadata, ingested documents table, quick module navigation.
8. **Document Center (`/app/documents`):** Drag-and-drop multi-file upload (PDF, DOCX, CSV, TXT), section inspector modal.
9. **AI Reconstruction (`/app/reconstruction`):** 7-stage processing progress, visual Architecture Flow, Objectives, Tech Stack, Decisions, Completed/Pending Tasks with citations.
10. **Knowledge Gap Radar (`/app/gaps`):** Severity matrix (Critical, High, Medium, Low), Suggested Questions, Recommended Actions, interactive resolution workflow.
11. **Conflict Detection Workspace (`/app/conflicts`):** Side-by-side statement comparisons, source document pills, excerpt inspector, formal resolution modal.
12. **Evidence Explorer (`/app/evidence`):** Full-text citation browser with verbatim document quotes, page numbers, and line ranges.
13. **Human Review Center (`/app/reviews`):** Approval/rejection/inline-editing queue and tamper-evident audit history.
14. **Handover Generator (`/app/handover`):** Complete executive report preview, inline editing, and downloadable executive PDF report.
15. **Settings (`/app/settings`):** API key overrides, user profile, architecture compliance specifications.

---

## 5. Quick Start & Startup Commands

### Prerequisites:
- **Node.js** v18+ (tested on Node v25)
- **npm** v9+

### 1. Configure Environment:
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

### 2. Start Backend Server:
```bash
cd server
npm start
```
*The server connects to local MongoDB or automatically initializes the embedded zero-config MongoMemoryServer on port 5000.*

### 3. Start Frontend Client:
In a separate terminal:
```bash
cd client
npm run dev
```
*Opens at `http://localhost:5173`.*

---

## 6. End-to-End Evaluation Workflow

To verify the complete MVP without developer assistance:

1. Open `http://localhost:5173`.
2. Click **"Explore Demo Workspace"** or click **"Sign In"** -> click **"Fill Demo Credentials (1-Click)"** -> **Sign In**.
3. On the Dashboard, click the prominent banner button **"Load Realistic Sample Project (1-Click)"** (or click the top bar button **"Load Sample Project (FinPulse)"**).
4. Watch THREADKEEP automatically:
   - Ingest 3 multi-page documents:
     - `FinPulse_Architecture_Spec_v1.txt`
     - `FinPulse_Sprint_Handover_Notes_v2.txt`
     - `FinPulse_Decisions_and_Risks.csv`
   - Reconstruct technical architecture and decisions with citations.
   - Detect 4 knowledge gaps (unassigned QA owner, missing deployment runbook, undocumented rate limits).
   - Detect 2 critical contradictions (MongoDB vs PostgreSQL, AWS vs GCP).
   - Calculate the authentic Knowledge Health Score.
   - Generate the initial Handover Dossier.
5. Navigate to **Document Center** to inspect the parsed text and sections.
6. Navigate to **AI Reconstruction** to inspect the Architecture Flow and source citations.
7. Navigate to **Knowledge Gap Radar** to resolve a gap with reviewer comments.
8. Navigate to **Conflict Detection** to inspect the side-by-side statements and resolve the database choice.
9. Navigate to **Human Review Center** to approve findings.
10. Navigate to **Handover Generator** and click **"Download PDF Report"** to export the formal executive handover dossier.

---

## 7. Team SPY_2.O
- **Platform:** THREADKEEP
- **Mission:** Continuous Project Memory & Zero-Friction Handover
