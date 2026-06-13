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
- ⏱️ **Automated Extended Time Engine** — Exam timers dynamically pull the student's disability category and automatically apply the correct time multiplier (e.g., 1.5x) with zero manual override required.
- 🔤 **Simplified Language Toggle** — Rephrases complex question wording without changing meaning, for students with cognitive disabilities.

### Accessibility
- ♿ **WCAG 2.2 AA Compliant** — Every element labelled, keyboard-navigable, no colour-only cues.
- 🔊 **Question Read-Aloud** — Text-to-speech reads each question on demand with speed control.
- 🅰️ **Font & Contrast Personalisation** — OpenDyslexic font toggle, high contrast mode, adjustable text size.

---

## 🏗️ Architecture & Security (The API Proxy)

We built this platform with enterprise-grade security in mind. **We do not expose LLM API keys in the client browser.**

Instead of the React frontend talking directly to Anthropic, we built a **Node.js Express Proxy Server**. The frontend captures the audio, sends the raw transcript to our local backend, and the backend securely authenticates with the Claude API to process the text.

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Zustand |
| Voice-to-Text | Native Web Speech API |
| AI Scribe | Claude API (claude-3-5-sonnet-20240620) |
| Text-to-Speech | Browser SpeechSynthesis API |
| Auth & Database | Firebase |
| Backend | Node.js + Express (Secure AI Proxy) |
| Package Manager | Bun |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 🚀 Getting Started

Because of our secure proxy architecture, the frontend and backend run as separate microservices.

### Prerequisites
- Node.js v18+
- [Bun](https://bun.sh/)
- Firebase Account
- Anthropic API Key

### 1. Backend Setup (Secure AI Proxy)

```bash
git clone https://github.com/Manthan2806/inclusive_exam_platform.git
cd inclusive_exam_platform/backend
```

Create a `.env` file in the `backend/` folder:

```env
CLAUDE_API_KEY=your_anthropic_api_key_here
```

Start the backend:

```bash
node --env-file=.env index.js
# Runs on http://localhost:3000
```

### 2. Frontend Setup (Client UI)

Open a new terminal and navigate to the frontend folder:

```bash
cd inclusive_exam_platform/assessment-ace-front-main
```

Create a `.env` file in the `assessment-ace-front-main/` folder:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Install dependencies and start:

```bash
bun install
bun run dev
# Runs on http://localhost:5173
```

---

## 🎬 Demo

📹 **[Watch Demo Video](#)** ← *link will be added before submission*

### What the demo shows
1. Problem statement — real student denied scribe at NEET
2. Live voice-to-text → AI scribe cleanup (before/after)
3. Extended time engine adjusting automatically based on mock profiles
4. Simplified language toggle on a UPSC question
5. Full keyboard + screen reader navigation (Orca on Linux / VoiceOver on Mac)

---

## ♿ Accessibility Audit

We didn't just build for accessibility; we tested it.

| Test | Tool | Score |
|---|---|---|
| Lighthouse Accessibility | Chrome DevTools | 100/100 ✅ |
| WCAG 2.1 AA | axe DevTools | 0 issues ✅ |
| Screen Reader | Orca (Linux) | Pending |

Full audit report: [`/demo/accessibility-audit.md`](./demo/accessibility-audit.md)

---

## 👥 Team

| Name | Role |
|---|---|
| Manthan | Backend + Firebase |
| Ashwin | Frontend + WCAG UI |
| Anant | AI Scribe + Voice |
| Dhruv | Accessibility Testing + Demo |

---

## 🌍 Impact

- 2.68 crore registered differently-abled people in India
- Lakhs appear for NEET, UPSC, GATE, and board exams annually
- Direct integration path with NTA and CBSE disability registration systems

---

*Built for FAR AWAY 2026 — India's Biggest International Hackathon*