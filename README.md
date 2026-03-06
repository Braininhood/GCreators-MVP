# G.Creators MVP

> Mentor–learner platform connecting experts with learners through consultations, digital products, and AI-powered matching.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)

**Live:** [gcreators.me](https://gcreators.me)

---

## Overview

G.Creators is a full-stack platform where mentors offer consultations, digital products, and personalized guidance. Learners discover mentors, book sessions, purchase products, and interact via chat and AI avatars.

### Features

- **Mentor discovery** — Browse mentors, view profiles, and get AI-powered recommendations
- **Consultations** — Book sessions with calendar integration (Google Calendar)
- **Digital products** — Mentors sell courses, guides, and resources
- **Messaging** — Direct chat between learners and mentors
- **AI avatars** — Knowledge-base-powered AI assistants for mentor products
- **Payments** — Stripe Connect for mentor payouts and product purchases
- **Admin panel** — User management, sales, bookings, and support

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Payments | Stripe, Stripe Connect |
| AI | OpenAI (embeddings, chat) |
| Calendar | Google Calendar API |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/Braininhood/GCreators-MVP.git
cd GCreators-MVP

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env with your Supabase and Stripe keys

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for required variables. You need:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- Stripe keys (for payments)

---

## Project Structure

```
GCreators-MVP/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom hooks
│   ├── integrations/  # Supabase client
│   └── utils/         # Helpers
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/    # Database migrations
├── public/             # Static assets
└── docs/               # Documentation
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Deployment

- **Vercel / Netlify** — Static frontend; configure build command and env vars
- **EC2 / AWS** — See deployment guides in the project documentation

---

## License

This project is licensed under the MIT License — see [LICENSE.md](LICENSE.md) for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

**G.Creators** — Connect, learn, grow.
