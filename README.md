# RoleAudit

**RoleAudit** is a frontend-only, evidence-based role readiness analysis tool for candidates.

It analyzes a job description and a resume (text, PDF, or DOCX), extracts verifiable evidence from both, and explains — with proof — how well the resume aligns with the role’s actual expectations.

RoleAudit does **not** predict hiring outcomes, optimize resumes, or act as an ATS.
Its goal is transparency: helping candidates understand *why* they are (or aren’t) a strong fit for a specific role.

---

## What RoleAudit Does

- Accepts job descriptions and resumes as plain text, PDF, or DOCX
- Converts all resumes into editable plain text before analysis
- Extracts evidence directly from both the JD and the resume
- Pairs job expectations with resume evidence
- Produces an explainable readiness score out of 100
- Clearly shows strengths, gaps, neutral factors, and risks
- Explains exactly where every point comes from

Every insight is traceable to text the user provided.

---

## What RoleAudit Does NOT Do

- No machine learning or embeddings
- No resume rewriting or keyword stuffing
- No layout or formatting scoring
- No hiring probability predictions
- No black-box “AI insights”

RoleAudit is intentionally deterministic and explainable.

---

## Scoring Overview

The score is always out of **100 points**, fully allocatable.

### Base Readiness (100 points total)

- **Role Alignment** (25)  
  Alignment with the role’s execution style, learning curve, and expectations

- **Skill Realism** (25)  
  Depth and repeated usage of skills in real contexts

- **Adaptability** (25)  
  Ability to learn and ramp effectively when required

- **Context Fit** (25)  
  Exposure to production, real-world environments, and work context

### Risk Deductions

- Risks are **not pre-applied**
- Points are deducted **only if concrete risks are detected**
- Each risk deducts a small, explicit number of points
- If no risks exist, no deductions are applied

### Adjustments

- Education fit
- Full-time constraints
- Cover letter impact (optional)

Adjustments modify the score transparently and are explained separately.

---

## Input Methods

### Resume Input
- Paste plain text directly
- Upload PDF (.pdf)
- Upload DOCX (.docx)

All files are converted into plain text and shown to the user before analysis.
Users can review and edit extracted text.

---

## Tech Stack

- React (Vite)
- JavaScript (no backend)
- pdfjs-dist (PDF text extraction)
- mammoth (DOCX text extraction)

---

## Why JobLens Exists

Most tools hide reasoning behind opaque scores.
JobLens does the opposite.

It is built to be:
- honest
- inspectable
- debuggable by the user
- defensible in interviews

---

## License

MIT
