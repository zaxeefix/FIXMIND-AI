<p align="center">
  <img src="public/fixmind-logo.png" alt="FixMind AI logo" width="220" />
</p>

# FixMind AI

<p align="center"><strong>Diagnose smarter. Repair faster.</strong></p>

A modern AI-powered device diagnosis and repair platform that helps people diagnose smartphones, tablets, laptops, and smartwatches with OpenAI, understand likely repair costs, and book professional repair services.

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-149eca?logo=react" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" /></a>
  <a href="https://platform.openai.com/docs/api-reference/responses"><img src="https://img.shields.io/badge/OpenAI-Responses_API-412991?logo=openai" alt="OpenAI Responses API" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-PostgreSQL-2d3748?logo=prisma" alt="Prisma and PostgreSQL" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" /></a>
</p>

---

## ✨ Features

- AI-powered device diagnosis
- Image-assisted fault analysis
- Intelligent repair recommendations and safety guidance
- Repair confidence score
- Estimated repair cost and duration
- Customer registration and authentication
- Premium AI diagnosis for registered customers
- Role-based customer, technician, and administrator workspaces
- Diagnosis and repair-history dashboard
- Professional repair booking system
- Technician repair progress and notes
- Mobile-first responsive interface
- Dark and light mode
- Smooth Framer Motion animations
- Secure server-side OpenAI integration
- Automatic retry, 24-hour diagnosis cache, and hackathon demo fallback

## 🧰 Technologies Used

| Area | Technologies |
| --- | --- |
| **Frontend** | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui design patterns, Framer Motion, Lucide React |
| **Backend** | Next.js Route Handlers, Server Actions, Prisma ORM, PostgreSQL, Zod |
| **AI** | OpenAI GPT-5 family, OpenAI Responses API, structured JSON output, multimodal image input |
| **Security** | Signed HTTP-only cookies, role-based authorization, server-side API keys, input validation, rate limiting |
| **Deployment** | Vercel and managed PostgreSQL |
| **Testing** | Node.js test runner, TypeScript compiler, ESLint, production build checks |

> The active model is configurable through `OPENAI_DIAGNOSIS_MODEL`. FixMind defaults to `gpt-5.6-terra` with medium reasoning effort for a strong balance of diagnostic quality, latency, and challenge-demo cost.

## Architecture

```mermaid
flowchart LR
    U["Guest or authenticated user"] --> N["Next.js 15 App Router"]
    N --> A["Role and session guard"]
    A --> D["Diagnosis API"]
    D --> C{"24-hour cache hit?"}
    C -->|Yes| R["Validated diagnosis result"]
    C -->|No| O["OpenAI Responses API"]
    O --> Z["Zod and JSON Schema validation"]
    Z --> R
    O -->|Temporary failure| F["Safe demo diagnosis"]
    F --> R
    R --> UI["Immediate customer result"]
    R -->|Background persistence| P["Prisma ORM"]
    P --> DB["PostgreSQL"]
    UI --> B["Repair booking and dashboards"]
```

The diagnosis result is shown before persistence completes. A temporary database failure therefore cannot hide a successful diagnosis, while retry, caching, and demo fallback keep the challenge presentation resilient.

## 🗂️ Project Structure

```text
fixmind-ai/
├── app/
│   ├── admin/                    # Administrator dashboard
│   ├── api/
│   │   ├── auth/login/           # Stable role-aware login endpoint
│   │   ├── diagnose/             # Protected OpenAI diagnosis endpoint
│   │   ├── diagnoses/            # Background diagnosis persistence
│   │   └── session/              # Current session metadata
│   ├── book/                     # Repair booking workflow
│   ├── dashboard/                # Customer dashboard and repair details
│   ├── diagnose/                 # Premium diagnosis experience
│   ├── login/                    # Sign-in interface
│   ├── resources/                # Free guides, tips, pricing, and samples
│   ├── signup/                   # Customer registration
│   ├── technician/               # Technician workspace
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── landing-page.tsx
│   ├── premium-gate.tsx
│   ├── ui.tsx
│   └── widgets.tsx
├── lib/
│   ├── auth.ts                   # Signed sessions and customer credentials
│   ├── diagnosis.ts              # Zod and JSON Schema contracts
│   ├── diagnosis-reliability.ts  # Cache and demo fallback
│   ├── openai-diagnosis.ts       # Responses API orchestration
│   ├── permissions.ts            # Central role permission matrix
│   ├── prisma.ts
│   └── rate-limit.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
│   └── fixmind-logo.png
├── tests/
├── .env.example
├── package.json
└── README.md
```

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 22.13 or newer
- npm
- PostgreSQL database
- OpenAI API project and API key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/fixmind-ai.git
cd fixmind-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### 4. Configure OpenAI and PostgreSQL

Add your OpenAI API key, database URL, authentication secret, and demo credentials to `.env.local`.

### 5. Generate Prisma Client and apply migrations

```bash
npm run db:generate
npm run db:deploy
```

For local schema development, use:

```bash
npm run db:migrate
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔐 Environment Variables

Create `.env.local` from the committed `.env.example`. Never commit real credentials.

```dotenv
OPENAI_API_KEY="sk-project-..."
OPENAI_DIAGNOSIS_MODEL="gpt-5.6-terra"
OPENAI_SIMULATE_FAILURE=
HACKATHON_DEMO="true"

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fixmind?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

AUTH_SECRET="generate-a-unique-random-secret-at-least-32-characters"

DEMO_USER_EMAIL="demo@fixmind.ai"
DEMO_USER_PASSWORD="replace-with-a-strong-password"

TECHNICIAN_EMAIL="technician@fixmind.ai"
TECHNICIAN_PASSWORD="replace-with-a-strong-password"

ADMIN_EMAIL="admin@fixmind.ai"
ADMIN_PASSWORD="replace-with-a-different-strong-password"
```

| Variable | Required | Purpose |
| --- | :---: | --- |
| `OPENAI_API_KEY` | Yes¹ | Server-side OpenAI authentication |
| `OPENAI_DIAGNOSIS_MODEL` | Yes | Model used by the Responses API |
| `OPENAI_SIMULATE_FAILURE` | No | Development-only reliability testing: `429`, `500`, `timeout`, or `network` |
| `HACKATHON_DEMO` | No | Returns a labelled demo diagnosis if OpenAI is temporarily unavailable |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `NEXT_PUBLIC_APP_URL` | No | Canonical application URL for integrations and deployment metadata |
| `AUTH_SECRET` | Yes | Signs authentication cookies; use at least 32 random characters |
| Role email/password variables | Demo | Local challenge credentials for customer, technician, and admin roles |

¹ OpenAI may be omitted only when intentionally running the labelled hackathon fallback.

## 📸 Screenshots

### Landing Page

> _Screenshot placeholder — add `docs/screenshots/landing-page.png`._

### AI Diagnosis

> _Screenshot placeholder — add `docs/screenshots/ai-diagnosis.png`._

### Customer Dashboard

> _Screenshot placeholder — add `docs/screenshots/dashboard.png`._

### Repair Booking

> _Screenshot placeholder — add `docs/screenshots/booking.png`._

### Admin Panel

> _Screenshot placeholder — add `docs/screenshots/admin-panel.png`._

## 🧠 How It Works

1. A user creates a free customer account or signs in.
2. The customer selects their device type, brand, model, age, and problem category.
3. The customer describes the symptoms in plain language.
4. Optional device photos are compressed in the browser and uploaded securely.
5. The protected server endpoint sends the evidence to the OpenAI Responses API.
6. FixMind validates the structured response and displays the diagnosis, confidence, cost, duration, parts, repair steps, and safety warnings.
7. The customer can book a professional repair.
8. The diagnosis is displayed immediately and persisted to repair history in the background.

Temporary OpenAI failures are retried with exponential backoff. When challenge demo mode is enabled, FixMind returns a clearly labelled demo diagnosis instead of presenting a broken experience.

## 🧪 Quality Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Run the complete submission gate with:

```bash
npm run check
```

## 🗺️ Future Improvements

- Voice-powered diagnosis
- Multi-language support
- Native technician mobile application
- Inventory and spare-parts management
- Conversational AI repair assistant
- Predictive maintenance alerts
- Spare-parts marketplace
- Managed multi-device authentication
- Shared Redis/KV diagnosis cache
- S3 or R2 repair-photo storage

## 🛡️ Security

- OpenAI and database credentials remain server-side.
- Real environment files are excluded through `.gitignore`.
- Signed HTTP-only cookies protect authenticated sessions.
- Premium AI routes and APIs require the customer role.
- Technician and administrator workspaces enforce dedicated role checks.
- Uploaded files are validated for type, size, and count.
- Structured AI output is validated before it reaches the UI.
- Lightweight rate limiting helps reduce automated abuse.
- Sensitive failures are logged on the server and never exposed as raw API errors.

> FixMind currently uses hackathon-focused authentication. A managed identity provider and formal privacy review are recommended before a public production launch.

## 💡 Why FixMind AI?

Many people cannot accurately identify a phone or laptop fault before visiting a repair center. This uncertainty makes it difficult to understand whether a quote is reasonable, whether a repair is urgent, or whether a device is safe to keep using.

FixMind AI transforms device symptoms and images into understandable preliminary guidance. Users receive likely causes, repair difficulty, estimated cost, expected duration, safety warnings, and a clear next step before committing to a repair.

## 🏆 OpenAI Build Challenge

FixMind AI was built for the **OpenAI Build Challenge**. It demonstrates a practical, multimodal use of the OpenAI GPT-5 family and Responses API to address real-world device repair problems.

The challenge implementation highlights:

- Multimodal symptom and image analysis
- Strict structured-output validation
- Human-readable safety-aware repair guidance
- Premium role-based AI access
- Resilient retry, caching, and demo fallback
- Immediate results with non-blocking database persistence

## 👤 Contributor

### Atam Isaiah Msughter

**Founder & CEO, ZaxeeFix Enterprise**  
Computer Scientist · Cybersecurity Professional · AI Engineer

- **GitHub:** [Add GitHub profile](https://github.com/YOUR_GITHUB_USERNAME)
- **LinkedIn:** [Add LinkedIn profile](https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME)
- **Website:** [www.zaxeefix.com](https://www.zaxeefix.com)

## 🤝 Contributing

Contributions, issue reports, and ideas are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Please run `npm run check` before submitting changes.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built with OpenAI, Next.js, and a mission to make device repair more transparent.
</div>
