# Ascenda Pipeline — Claude Cowork Desktop Deployment Guide

**Version:** 3.0 | **Date:** February 2026  
**GitHub Repo:** https://github.com/Diversified-Business-Management/ascenda-pipeline  
**Pinecone Host:** https://ascenda-pipeline-8t9sj7i.svc.aped-4627-b74a.pinecone.io  
**Public Form:** AscendaGRP.com (ascenda-form.html)  
**Internal CRM:** GitHub Pages (brand-crm.html)

---

## FILES TO UPLOAD TO GITHUB (Re-upload These)

After this session, upload these files to your `ascenda-pipeline` GitHub repo:

| File | Destination | Action |
|------|------------|--------|
| `index.html` | `/` root | REPLACE existing |
| `ascenda-form.html` | `/` root | NEW — customer-facing form |
| `brand-crm.html` | `/` root | NEW — internal CRM |
| `n8n-workflows/workflow-01-intake-scoring.json` | `/n8n-workflows/` | REPLACE |
| `n8n-workflows/workflow-10-rag-sync.json` | `/n8n-workflows/` | REPLACE |
| `pinecone-setup/setup.js` | `/pinecone-setup/` | NEW |
| `pinecone-setup/embed-query.js` | `/pinecone-setup/` | NEW |
| `README.md` | `/` root | REPLACE |
| `docs/ascenda-master-strategy.md` | `/docs/` | NEW |
| `COWORK-DEPLOY.md` | `/` root | This file |

---

## ONE-TIME SETUP SESSIONS FOR CLAUDE COWORK DESKTOP

Copy and paste each session prompt exactly into Claude Cowork Desktop.

---

### SESSION 1 — Verify Folder Structure

```
Open Finder and navigate to my Desktop folder called "ascenda-pipeline".
Show me a list of all files and subfolders.
If any of these folders are missing, create them:
  - n8n-workflows
  - pinecone-setup
  - docs
Take a screenshot showing the folder structure.
```

---

### SESSION 2 — Initialize Pinecone RAG Index

> Prereq: You have your Pinecone API key ready.

```
Open Terminal.
Navigate to the folder: Desktop/ascenda-pipeline/pinecone-setup

Run this command (replace YOUR_KEY with your actual Pinecone API key):
  PINECONE_API_KEY=YOUR_KEY node setup.js

Wait for it to complete. It will take about 60 seconds.
When it finishes, look for the line that says "Index host:" and copy that URL.
Take a screenshot of the full terminal output.
```

Expected output should include:
- ✅ Index created: ascenda-retail-intelligence
- ✅ Seeded vectors for namespaces: brands, portfolio-kpis, compliance-docs, roadshow-results, market-intel, templates
- Index host: https://ascenda-pipeline-8t9sj7i.svc.aped-4627-b74a.pinecone.io *(already set)*

---

### SESSION 3 — Update n8n Webhook URLs in All Workflows

> Prereq: You have your n8n instance URL (e.g. https://myname.app.n8n.cloud)

```
Open the folder Desktop/ascenda-pipeline/n8n-workflows in Finder.
Open each JSON file in TextEdit (or VS Code if installed).
In each file, find every instance of the text:
  "https://YOUR_N8N_INSTANCE.com"
Replace it with:
  "https://YOUR_ACTUAL_N8N_URL"
Save each file.
Take a screenshot confirming all 10 files have been updated.
```

---

### SESSION 4 — Update Webhook URL in Public Form

```
Open Desktop/ascenda-pipeline/ascenda-form.html in TextEdit.
Find this line:
  const N8N_WEBHOOK = 'https://YOUR_N8N_INSTANCE.com/webhook/ascenda/intake';
Replace it with:
  const N8N_WEBHOOK = 'https://YOUR_ACTUAL_N8N_URL/webhook/ascenda/intake';
Save the file.
```

---

### SESSION 5 — Update Webhook URL in Brand CRM

```
Open Desktop/ascenda-pipeline/brand-crm.html in TextEdit.
Find this line:
  const N8N_BASE = 'https://YOUR_N8N_INSTANCE.com';
Replace it with:
  const N8N_BASE = 'https://YOUR_ACTUAL_N8N_URL';
Save the file.
```

---

### SESSION 6 — Commit and Push Everything to GitHub

```
Open Terminal.
Navigate to: Desktop/ascenda-pipeline

Run these commands one by one:
  git add .
  git commit -m "Add customer form, brand CRM, A&P tracker, Pinecone per-brand RAG v3.0"
  git push origin main

Wait for the push to complete.
Open my browser and navigate to:
  https://github.com/Diversified-Business-Management/ascenda-pipeline
Take a screenshot confirming all files are in the repo.
```

---

### SESSION 7 — Verify GitHub Pages is Live

```
Open my browser and navigate to:
  https://diversified-business-management.github.io/ascenda-pipeline/index.html
Wait for it to load.
Then navigate to:
  https://diversified-business-management.github.io/ascenda-pipeline/ascenda-form.html
Then navigate to:
  https://diversified-business-management.github.io/ascenda-pipeline/brand-crm.html
Take a screenshot of each page confirming they load correctly.
```

---

### SESSION 8 — Import n8n Workflows (In Order)

> Prereq: n8n is open in your browser.

```
Open my browser and navigate to my n8n instance.
Go to Workflows. For each file listed below, click "Add workflow" → "Import from file"
and import the file from Desktop/ascenda-pipeline/n8n-workflows/

Import in this exact order:
  1. workflow-10-rag-sync.json         (RAG foundation — import FIRST)
  2. workflow-01-intake-scoring.json
  3. workflow-02-compliance.json
  4. workflow-03-readiness-scoring.json
  5. workflow-04-gonogo.json
  6. workflow-05-financial-loi.json
  7. workflow-06-retail-submission.json
  8. workflow-07-logistics.json
  9. workflow-08-postshow-report.json
 10. workflow-09-growth-spv.json

After importing, take a screenshot showing all 10 workflows in the list.
```

---

### SESSION 9 — Set n8n Environment Variables

```
In my browser, go to my n8n instance → Settings → Variables.
Create each of these variables (click + New Variable for each):

Variable Name          | Value
-----------------------|-------------------------------
PINECONE_API_KEY       | [YOUR PINECONE API KEY]
PINECONE_HOST          | https://ascenda-pipeline-8t9sj7i.svc.aped-4627-b74a.pinecone.io
ANTHROPIC_API_KEY      | [YOUR ANTHROPIC API KEY]
N8N_BASE_URL           | [YOUR N8N INSTANCE URL]
GOOGLE_SHEETS_ID       | [YOUR SPREADSHEET ID]

Take a screenshot showing all 5 variables are set (you can hide the values).
```

---

### SESSION 10 — Connect Google Credentials in n8n

```
In n8n, go to Settings → Credentials.
Click "Add Credential" and connect each of these:
  1. Google Sheets OAuth2
  2. Google Drive OAuth2
  3. Gmail OAuth2
  4. Google Calendar OAuth2

Use the Google account: admin@newchannelpro.com
For each, follow the OAuth flow in the popup window.
Take a screenshot showing all 4 Google credentials connected (green checkmark).
```

---

### SESSION 11 — Activate All Workflows

```
In n8n, go to Workflows.
For each of the 10 Ascenda workflows:
  - Click on the workflow
  - Toggle the "Active" switch to ON (green)
  - Click Save

Start with workflow-10 (RAG Sync), then workflow-01 through workflow-09.
Take a screenshot showing all 10 workflows with Active status.
```

---

### SESSION 12 — End-to-End Test

```
Open my browser and navigate to:
  https://diversified-business-management.github.io/ascenda-pipeline/ascenda-form.html

Fill in the Phase 1 form with this test data:
  Company Name: Test Brand Co
  Contact: Test User
  Email: [YOUR EMAIL]
  Product: Test Widget
  Category: Food & Beverage
  Description: This is a test submission to verify the full pipeline automation is working.
  Differentiation: We are testing the Ascenda automation pipeline end to end.
  Member Value: Sam's Club members love our product because it saves time.
  
Click "Submit Phase 1".

Then check:
  1. Your email — you should receive a confirmation or approval email within 5 minutes
  2. Your Google Sheet — a new row should appear in Phase1_Submissions tab
  3. n8n — execution log should show WF-01 ran successfully
  4. Pinecone console — brands namespace should have a new vector

Take screenshots of each confirming the test worked.
```

---

## HOSTING THE FORM ON ASCENDAGRP.COM

To embed the form on your existing AscendaGRP.com WordPress site:

### Option A — Embed via iframe (Easiest)

Add this to any WordPress page using the HTML block:

```html
<iframe 
  src="https://diversified-business-management.github.io/ascenda-pipeline/ascenda-form.html"
  width="100%"
  height="900"
  frameborder="0"
  style="border:none;border-radius:8px;"
  title="Sam's Club Roadshow Application"
></iframe>
```

### Option B — Replace the existing page (Recommended)

```
In Cowork, open my browser and navigate to my WordPress admin at:
  ascendagrp.com/wp-admin

Go to Pages → Find "ascendasales" or "Feasibility Snapshot" page.
Click Edit → Switch to HTML/Code editor.
Replace the entire page content with:
  [add the ascenda-form.html content directly into a custom HTML block]

Update/Publish the page.
Navigate to https://ascendagrp.com/ascendasales to verify it loads.
Take a screenshot.
```

---

## PER-BRAND PINECONE NAMESPACE ARCHITECTURE

Each brand in the CRM gets its own isolated Pinecone namespace:

```
ascenda-retail-intelligence index
├── brands/              ← Portfolio-level brand summaries
├── brands/brand-001/    ← NutriPure Foods (isolated)
├── brands/brand-002/    ← VitaBlend Wellness (isolated)
├── brands/brand-XXX/    ← Each new brand you create
├── portfolio-kpis/      ← Cross-brand benchmarks
├── compliance-docs/     ← Retailer checklists
├── roadshow-results/    ← Historical performance
├── market-intel/        ← Category intelligence
└── templates/           ← LOIs, two-pagers, models
```

**Isolation guarantee:** When you query a brand's namespace, results come ONLY from that brand's data. No cross-contamination between brands.

---

## QUICK REFERENCE — LIVE URLS

| Resource | URL |
|----------|-----|
| Pipeline Dashboard | https://diversified-business-management.github.io/ascenda-pipeline/ |
| Customer Form (GitHub) | https://diversified-business-management.github.io/ascenda-pipeline/ascenda-form.html |
| Brand CRM | https://diversified-business-management.github.io/ascenda-pipeline/brand-crm.html |
| Customer Form (Production) | https://ascendagrp.com/ascendasales/ |
| GitHub Repo | https://github.com/Diversified-Business-Management/ascenda-pipeline |
| Pinecone Console | https://app.pinecone.io |
| n8n Instance | [YOUR_N8N_URL] |

---

## OPEN ACTION ITEMS

| # | Item | Who | Notes |
|---|------|-----|-------|
| A1 | Change Google account password | **Errol — URGENT** | Credentials were shared in chat |
| A2 | Get Anthropic API key | Errol | console.anthropic.com |
| A3 | Get n8n instance URL | Errol | n8n.io or self-hosted |
| A4 | Get Google Sheets ID | Errol | From the spreadsheet URL |
| A5 | Embed form on AscendaGRP.com | Errol + Cowork | Session 12 above |
| A6 | Connect DocuSign for LOI signing | Dev partner | WF-05 integration |
| A7 | Build real embedding (replace placeholder) | Dev partner | embed-query.js — use OpenAI text-embedding-3-small |
| A8 | Load historical brand data into RAG | Errol + Dev | Use embed-query.js sync-csv command |

---

*Ascenda Group · Retail Expansion Intelligence · v3.0*  
*Built for Claude Cowork Desktop deployment*
