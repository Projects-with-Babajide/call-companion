

# Call Prep Brief — Implementation Plan

## Overview
A single-page AI-powered tool that turns messy customer notes into a structured, scannable brief a salesperson can review in 60–90 seconds before a call.

---

## 1. Input Section (Top of Page)
- **App header** with title "Call Prep Brief" and a brief tagline
- **Paste box** — large textarea for raw text input
- **Source labeling** — dropdown per chunk (CRM, Transcript, Email, Notes, Other), with an "Add another chunk" button to paste multiple sources separately
- **File upload** — optional `.txt` / `.md` file upload that populates a new chunk
- **"Generate Call Prep" button** — primary action, triggers AI processing
- **"Clear" button** — resets all inputs and results

## 2. AI Processing (Lovable Cloud + Lovable AI)
- An edge function receives the labeled text chunks and calls the Lovable AI gateway (Gemini Flash) with a structured prompt
- Uses **tool calling** to extract structured output: an array of theme cards with summaries, confidence levels, and source-attributed snippets
- Streams results back for a responsive feel

## 3. Theme Cards Output (Below Input)
Results displayed as expandable cards, one per theme from this fixed list (plus "Other"):
- Pain Points
- Problems
- Objections
- Goals / Priorities
- Open Questions
- Risks / Blockers
- Next Steps

**Each card shows:**
- Theme name + confidence badge (High / Med / Low with color coding)
- 1–2 sentence summary
- Expandable details with 3–6 supporting snippets, each labeled with source type and chunk number (e.g., "Transcript #2")
- Cards with no relevant content are hidden

## 4. Utility Features
- **"Copy Brief"** button — copies all theme summaries and key bullets to clipboard in a clean text format
- **Loading state** with skeleton cards while AI processes
- **Error handling** for AI rate limits (429/402) with user-friendly messages

## 5. Design & UX
- Clean, minimal single-page layout — no navigation, no sidebar
- Light professional theme with clear visual hierarchy
- Accordion-style expandable cards for quick scanning
- Fully responsive (usable on laptop during a call)
- Output tone: bullets, concise, actionable — enforced via the AI system prompt

## 6. Backend Setup
- Enable Lovable Cloud
- One edge function (`call-prep`) that handles the AI call with a carefully crafted system prompt enforcing the theme structure, snippet attribution, and concise tone

