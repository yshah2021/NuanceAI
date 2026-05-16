# Nuance AI

Most people know they need to communicate better — but there's nowhere safe and private to actually practice. Nuance AI is an open-source communication coach that lets you have real voice conversations with an AI, get objective scoring across 9 skills, and follow a structured program to improve.

Built on Google Gemini's Multimodal Live API for sub-500ms voice interaction.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

---

## Features

- **Real-time Voice Practice** — Converse with an AI coach at <500ms latency using the Google Gemini Live API
- **Structured Curriculum** — 3 weeks of content live across Voice, Presence, and Connection; more weeks coming soon
- **Instant Feedback** — Objective scoring (0–100) across 9 communication metrics after every session
- **Progress Tracking** — Radar charts and trend analysis to visualize improvement over time
- **Adaptive Practice** — Daily drills personalized to your weakest areas

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS (CDN) |
| AI | Google Gemini Multimodal Live API (`gemini-2.5-flash-native-audio-preview`) |
| Charts | Recharts |
| Routing | React Router DOM |

## Getting Started

### Prerequisites

- Node.js v18+
- A [Google AI Studio API key](https://aistudio.google.com/app/apikey)

### Installation

```sh
git clone https://github.com/your_username/nuance-ai.git
cd nuance-ai
npm install
cp .env.example .env   # then add your GEMINI_API_KEY
npm run dev            # http://localhost:5173
```

> **Note**: This is a frontend-only demo. Authentication is mocked (any username/password works) and session data is not persisted across page reloads.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key from AI Studio |

## Scripts

```sh
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build
npm run preview    # preview production build locally
npm test           # run tests
npm run lint       # lint
npx tsc --noEmit   # type check
```

## Curriculum

| Week | Theme | Status |
|------|-------|--------|
| 1 | Voice of Influence — tone, clarity, and speaking fundamentals | Live |
| 2 | Presence & Listening — active listening and non-verbal cues | Live |
| 3 | Magnetic Connection — rapport, empathy, and storytelling | Live |
| 4 | Persuade with Integrity — argument structure and logical reasoning | Coming Soon |

## Project Structure

```
nuance-ai/
├── components/       # React components (UI)
├── data/             # Curriculum and mock data
├── services/         # Gemini API integration and adaptive engine
├── utils/            # Shared helpers
├── tests/            # Vitest test suite
├── types.ts          # Shared TypeScript types
└── index.tsx         # App entry point
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, code style, and where help is most needed.

For non-trivial changes, please open an issue first so we can align on approach before you invest time writing code.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
