# JobLens — System Architecture & Design

This document explains how JobLens works internally:
- what each file does
- how data flows through the system
- how scoring is computed
- how evidence is extracted and paired
- why design decisions were made

---

## High-Level Architecture

JobLens is a **frontend-only, deterministic analysis pipeline**.

User Input
├─ Job Description (text)
└─ Resume (text / PDF / DOCX)
↓
Text Normalization
↓
Evidence Extraction
↓
JD–Resume Pairing
↓
Scoring Engine
↓
Analysis Generation
↓
Results UI

There is **no backend** and **no ML**.  
All logic is explicit and inspectable.

---

## Input Layer

### `InputPage.jsx`
- Collects job description text
- Collects resume input (paste or file upload)
- Displays extracted resume text for user review
- Prevents auto-analysis after file upload

---

### `src/utils/parseResumeFile.js`
Responsible for file-based resume parsing.

Functions:
- `validateResumeFile(file)`
  - Validates file type and size
- `parseResumeFile(file)`
  - Routes to PDF or DOCX parsing
  - Returns plain text or a clear error

PDF parsing:
- Uses `pdfjs-dist`
- Extracts text page by page
- Preserves line breaks

DOCX parsing:
- Uses `mammoth`
- Extracts raw text only

This module performs **no interpretation**, only text extraction.

---

## Evidence Extraction Layer

### `extractJDEvidence.js`
Analyzes the job description to extract role expectations.

Outputs:
- Execution style signals
- Learning curve expectations
- Collaboration signals
- Structure and ambiguity tolerance

Each signal includes:
- the inferred expectation
- exact JD text snippets that triggered it
- evidence counts

No signal exists without textual backing.

---

### `extractResumeEvidence.js`
Extracts quotable evidence from the resume.

Groups evidence into:
- execution
- adaptability
- production exposure
- education

Evidence consists of **exact resume lines**, not abstractions.

---

## Pairing Logic (Core Insight Engine)

### `pairJDWithResume.js`
This is the heart of JobLens.

For each JD expectation:
- Finds relevant resume evidence
- Classifies alignment as:
  - MATCH
  - GAP
  - NEUTRAL
  - RISK
- Produces an explanation backed by text from both sides

Neutral classifications are explicitly explained as
“not emphasized by the JD, therefore not affecting readiness”.

---

## Scoring Engine

### `scoreDimensions.js`

Computes the **base readiness score**, summing to exactly 100 points.

Dimensions:
- Role Alignment (25)
- Skill Realism (25)
- Adaptability (25)
- Context Fit (25)

Each dimension score is derived from pairing results and extracted signals.

---

### Risk Handling
- Risks are computed separately
- Each risk deducts a small fixed number of points
- Maximum deduction cap prevents score collapse
- No risks → no deductions

---

### Adjustments
Applied after base score and risk deduction:
- education fit multiplier
- full-time constraint multiplier
- cover letter impact

All adjustments are explained and visible to the user.

---

## Analysis Generation

### `generateAnalysis.js`
Transforms raw scoring and pairing data into human-readable analysis.

Responsibilities:
- Explain what the score represents
- Break down each dimension
- List strengths with evidence
- List gaps and risks with evidence
- Clearly show base score, deductions, and adjustments

This file **does not re-infer logic**.
It only formats and explains existing results.

---

## UI Layer

### `ResultsPage.jsx`
Responsible for presentation only.

Key design decisions:
- One primary score: “Overall Readiness (out of 100)”
- Supporting breakdown in collapsible sections
- Consistent dimension naming
- Evidence quotes trimmed for readability
- Risk section de-emphasized when empty

---

### `trimQuote.js`
Utility to:
- shorten evidence snippets
- preserve meaning
- reduce visual noise

---

## Design Principles

1. **Transparency over intelligence**
2. **Evidence before inference**
3. **No hidden penalties**
4. **Deterministic behavior**
5. **User-verifiable outputs**

Every claim must be traceable to:
- job description text, or
- resume text

---

## Summary

JobLens is not an ATS, not a resume optimizer, and not a hiring predictor.

It is a structured reasoning system that:
- evaluates role readiness honestly
- exposes its reasoning
- allows users to agree, disagree, or improve intentionally

This architecture prioritizes trust and clarity over cleverness.
