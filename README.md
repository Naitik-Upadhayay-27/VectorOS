# VectorOS — AI-Powered Job Application OS

![VectorOS Hero](./screenshots/hero.png)

> Your AI-powered career command center. Build, optimize, and track your job applications — from upload to offer letter.

---

## What is VectorOS?

VectorOS is a full-stack AI job application platform that combines every tool a modern job seeker needs into one intelligent system:

- **AI Resume Builder** — 15 ATS-optimized templates with real-time AI rewriting
- **PDF Auto-Fill** — Upload your existing resume and AI parses it instantly
- **ATS Scoring** — Scored against your target role using the same criteria as Workday, Greenhouse & Lever
- **Inline Editing** — Click any text on the live preview to edit directly (like Canva)
- **AI Chat Coach** — Chat with an AI that knows your resume, target role, and career goals. Edits apply instantly
- **Gap Analysis** — Identifies exact keywords and skills missing between your resume and target role
- **Google OAuth** — One-click sign in with Google
- **Application Tracker** — Track every application status in real time

---

## Tech Stack

| Layer       | Tech                                                             |
| ----------- | ---------------------------------------------------------------- |
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand |
| Backend     | Node.js, Express, TypeScript                                     |
| AI          | Google Gemini 2.5 Flash Lite                                     |
| Auth        | JWT + Refresh Tokens, Passport.js (Google OAuth)                 |
| PDF Parsing | pdf-parse                                                        |
| Validation  | Zod                                                              |

---

## Project Structure

```
resume-analyzer/
├── frontend/          # Vite + React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── resume-editor/    # Editor panels + live preview
│   │   │   ├── resume-templates/ # 15 ATS templates
│   │   │   ├── onboarding/       # 5-step onboarding flow
│   │   │   ├── chat/             # AI chat panel
│   │   │   └── ui/               # Shared UI components
│   │   ├── pages/                # Route pages
│   │   ├── store/                # Zustand stores
│   │   └── lib/                  # Utilities + apiFetch
│   └── public/                   # Static assets
│
└── backend/           # Express + TypeScript
    └── src/
        ├── routes/    # auth, ai, resume, jobs, applications
        ├── middleware/ # JWT auth
        └── config/    # Passport OAuth config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/vectoros.git
cd vectoros
```

### 2. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 3. Configure environment variables

Copy the example and fill in your keys:

```bash
cp backend/.env.example backend/.env
```

Required keys in `backend/.env`:

```env
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
GEMINI_API_KEY=your-gemini-key-here

# Optional — for Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 4. Run the app

```bash
# Terminal 1 — Backend (port 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Google OAuth Setup (optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable Google People API
3. OAuth consent screen → External
4. Credentials → OAuth 2.0 Client ID → Web application
5. Add redirect URI: `http://localhost:4000/api/auth/google/callback`
6. Paste Client ID and Secret into `backend/.env`

---

## License

MIT
