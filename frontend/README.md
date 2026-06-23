# NyaayAI Frontend

AI-Powered Legal Aid Platform · Team Avinya · TESSERACT '26

## Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Lucide React icons

## Quick Start

```bash
cd nyaayai
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, how-it-works |
| `/analyze` | Document upload & analysis trigger |
| `/dashboard` | Full result dashboard with all cards |
| `/history` | Past analyses with search & filter |

## Connecting to Backend
Set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
```

Then run your FastAPI backend:
```bash
uvicorn app.main:app --reload
```

## File Structure
```
src/
├── app/
│   ├── page.tsx               # Landing
│   ├── analyze/page.tsx       # Upload & analyze
│   ├── dashboard/page.tsx     # Results dashboard
│   ├── history/page.tsx       # History log
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── FeatureCards.tsx
│   │   ├── HowItWorks.tsx
│   │   └── TrustSection.tsx
│   ├── analyze/
│   │   ├── UploadCard.tsx
│   │   └── ActionButtons.tsx
│   └── dashboard/
│       ├── RiskScoreCard.tsx
│       ├── SummaryCard.tsx
│       ├── SimplificationCard.tsx
│       ├── DetectionCard.tsx
│       ├── FraudIndicatorsCard.tsx
│       ├── DeadlineCard.tsx
│       ├── NextStepsCard.tsx
│       └── ReplyDraftCard.tsx
├── lib/
│   ├── api.ts                 # FastAPI integration
│   ├── mockData.ts            # Demo data
│   └── utils.ts               # Helpers
└── types/
    └── index.ts               # TypeScript types
```

## API Response Shape
```typescript
{
  detected_language, redactions, document_type, case_type,
  tone, extracted_fields, risk_score, risk_label, risk_reasons,
  deadlines, next_steps, summary, explanation, reply_draft, fingerprint
}
```
