# ♿ Inclusive Exam Platform

> Reimagining examinations for differently-abled students in India.

![FAR AWAY 2026](https://img.shields.io/badge/FAR%20AWAY-2026-red)
![Theme](https://img.shields.io/badge/Theme-Examinations-blue)
![WCAG](https://img.shields.io/badge/WCAG-2.2%20AA-green)

---

## 🧩 The Problem

Every year, millions of differently-abled students appear for NEET, UPSC, GATE, and board exams across India. The current accommodation system — physical scribes, separate rooms, manual time extensions — is inconsistent, hard to scale, and fails students at the last moment.

**This platform replaces that fragile process with a smart, accessible-by-default exam interface.**

---

## ✨ Features

### Core
- 🎙️ **Voice-to-Text Answering** — Speak your answer, it transcribes in real time. Fully editable before submission.
- 🤖 **AI Scribe Mode** — Claude API cleans up fragmented dictation into a coherent answer, preserving intent without adding content.
- 🔤 **Simplified Language Toggle** — Rephrases complex question wording without changing meaning, for students with cognitive disabilities.

### Accessibility
- ♿ **WCAG 2.2 AA Compliant** — Every element labelled, keyboard-navigable, no colour-only cues.
- 🔊 **Question Read-Aloud** — Text-to-speech reads each question on demand with speed control.
- 🅰️ **Font & Contrast Personalisation** — OpenDyslexic font toggle, high contrast mode, adjustable text size.

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Tailwind CSS |
| Voice-to-Text | Web Speech API |
| AI Scribe | Claude API (claude-sonnet-4-20250514) |
| Text-to-Speech | Browser SpeechSynthesis API |
| Auth & Database | Firebase |
| Backend | Node.js + Express |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Firebase account
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Manthan2806/inclusive_exam_platform.git
cd inclusive_exam_platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Environment Variables

Create a `.env` file in the root folder:
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
ANTHROPIC_API_KEY=your_claude_api_key

### Running Locally

```bash
# Start frontend
npm run dev

# Start backend (in a new terminal)
cd backend
node index.js
```

---

## 🎬 Demo

📹 **[Watch Demo Video](#)** ← _link will be added before submission_

### What the demo shows
1. Problem statement — real student denied scribe at NEET
2. Live voice-to-text → AI scribe cleanup (before/after)
3. Simplified language toggle on a UPSC question
4. Full keyboard + screen reader navigation (Orca on Linux / VoiceOver on Mac)

---

## ♿ Accessibility Audit

| Test | Tool | Score |
|---|---|---|
| Lighthouse Accessibility | Chrome DevTools | _TBD_ |
| WCAG 2.2 AA | axe DevTools | _TBD_ |
| Screen Reader | Orca (Linux) | _TBD_ |

Full audit report: [`/demo/accessibility-audit.md`](./demo/accessibility-audit.md)

---

## 👥 Team

| Name | Role |
|---|---|
| Manthan | Backend + Firebase |
| [Dev A name] | Frontend + WCAG UI |
| [Dev B name] | AI Scribe + Voice |
| [Dhruv] | Accessibility Testing + Demo |

---

## 📁 Project Structure
inclusive_exam_platform/
├── src/
│   ├── components/        # UI components (Dev A)
│   ├── hooks/             # Voice + scribe hooks (Dev B)
│   ├── api/               # Claude + TTS integration (Dev B)
│   └── pages/             # Exam page views
├── backend/               # Node.js + Express (Dev C)
├── demo/                  # Screenshots + audit report
└── README.md

---

## 🌍 Impact

- 2.68 crore registered differently-abled people in India
- Lakhs appear for NEET, UPSC, GATE, and board exams annually
- Direct integration path with NTA and CBSE disability registration systems

---

_Built for FAR AWAY 2026 — India's Biggest International Hackathon_