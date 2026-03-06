# CineSwipe

A Tinder-style movie rating app with AI-powered recommendations, built with React + Vite and deployed on Vercel.

## Features

- Swipe right to watchlist, left to skip — or tap any of 6 rating categories
- 177 curated world-cinema films with smart director-interleaving
- AI recommendations via Claude (personalized to your taste)
- Persistent ratings saved to localStorage
- Keyboard shortcuts: `←/→` to skip/watchlist, `1–6` for categories, `Ctrl+Z` to undo

## Setup

1. Clone and install: `npm install`
2. Add your Anthropic API key as an environment variable on Vercel: `ANTHROPIC_API_KEY`
3. Deploy to Vercel — the `/api/recommend` serverless function handles AI calls securely server-side

## Dev

```bash
npm run dev
```
