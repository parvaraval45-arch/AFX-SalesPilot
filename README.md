# AFX SalesPilot

**AI-powered pre-sales intelligence for NetApp field teams.** AFX SalesPilot helps sales engineers match customer workloads to the right NetApp product, size AFX disaggregated storage clusters, generate competitive battlecards against key competitors, and create customer-facing proposals — all through a conversational AI interface powered by Claude.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fparvaraval45-arch%2FAFX-SalesPilot&env=ANTHROPIC_API_KEY&envDescription=Anthropic%20API%20key%20from%20console.anthropic.com&project-name=afx-salespilot)

---

## Features

- **Product Selector** — Conversational workload-to-product matcher with AI recommendations across 5 product families (AFX, AFF A-Series, AFF C-Series, ASA r2, FAS)
- **AFX Sizer** — 3-step wizard: workload profile, AI refinement, configuration output with Keystone STaaS pricing estimates and AFX vs AFF A1K comparison charts
- **Competitive Intelligence** — AI-generated battlecards for 6 competitors (Pure, Dell, HPE, WEKA, VAST, DDN) with head-to-head tables, killer questions, and win/lose scenarios
- **Proposal Generator** — Multi-step proposal builder with AI-generated content for customer-facing documents
- **Dashboard** — Activity feed, quick stats, and AFX readiness checklist

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 (App Router)               │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Product  │ │   AFX    │ │Competitiv│ │  Proposal   │ │
│  │ Selector │ │  Sizer   │ │  Intel   │ │ Generator   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘ │
│       │             │            │              │        │
│  ┌────▼─────────────▼────────────▼──────────────▼─────┐ │
│  │              Reusable ChatInterface                 │ │
│  │         (framer-motion + recommendation cards)      │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────────┐ │
│  │                API Routes (/api/*)                  │ │
│  │  /api/chat  ·  /api/size  ·  /api/competitive      │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────────┐ │
│  │        lib/claude.ts (Anthropic SDK)                │ │
│  │     lib/afx-sizing.ts (sizing engine)               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │  data/products.json · afx-specs.json · competitors   ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
         │
         ▼
  Claude API (claude-sonnet-4-20250514)
```

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui components
- **Animation**: Framer Motion
- **Charts**: Recharts
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **Font**: Geist Sans

## Local Setup

```bash
# Clone the repository
git clone https://github.com/parvaraval45-arch/AFX-SalesPilot.git
cd AFX-SalesPilot

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key from console.anthropic.com

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | API key from [console.anthropic.com](https://console.anthropic.com) |
| `KV_REST_API_URL` | No | Vercel KV URL (auto-configured on Vercel) |
| `KV_REST_API_TOKEN` | No | Vercel KV token (auto-configured on Vercel) |

## Deployment

### Vercel (Recommended)

1. Click the **Deploy with Vercel** button above
2. Set `ANTHROPIC_API_KEY` in the environment variables
3. Deploy

### Manual

```bash
npm run build
npm start
```

## Project Structure

```
app/
  page.tsx                    # Dashboard
  product-selector/page.tsx   # AI product matcher
  afx-sizer/page.tsx          # AFX sizing wizard
  competitive-intel/page.tsx  # Competitive battlecards
  proposal-generator/page.tsx # Proposal builder
  api/
    chat/route.ts             # Claude chat endpoint
    size/route.ts             # AFX sizing + narrative
    competitive/route.ts      # Battlecard generation
components/
  ChatInterface.tsx           # Reusable chat (exported)
  ProductRecommendationCard.tsx
  BattleCard.tsx
  Sidebar.tsx                 # Desktop sidebar + mobile bottom nav
  TopBar.tsx
  ui/                         # shadcn/ui primitives
data/
  products.json               # 5 product families
  afx-specs.json              # AFX component specifications
  competitors.json            # 6 competitor battle-card datasets
lib/
  claude.ts                   # Anthropic SDK wrapper
  afx-sizing.ts               # AFX sizing calculation engine
  netapp-products.ts          # Product data utilities
middleware.ts                 # API rate limiting (30 req/min)
```

## License

Proprietary — NetApp Confidential.
