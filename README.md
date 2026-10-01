# MySpotify · Music search & recommendations

Next.js web app that searches tracks with the Spotify Web API, lets you build a playlist, and recommends new tracks with a rule-based scoring engine fed by artist metadata from MusicBrainz.
Team project (3 contributors) built at Jönköping University.

**Live:** [my-spotify-jonkoping.vercel.app](https://my-spotify-jonkoping.vercel.app/)

## Features

- **Track search** through the Spotify Web API, using the Client Credentials flow (`lib/spotify.ts`)
- **Playlist builder**: add search results to a personal playlist
- **Artist knowledge lookup**: genres, influences, collaborations, area and other metadata fetched from the MusicBrainz API (`lib/yago.ts`)
- **Recommendation engine**: a TypeScript, Prolog-style fact store and rule engine that scores candidate tracks on shared genres, influences, styles, instruments and similar artists, and returns the top 10 (`lib/prolog.ts`)
- **Four views** in a tabbed UI: Search, Playlist, Recommendations and Ontology (`app/page.tsx`)

## Tech stack

- Next.js 13 (App Router, static export) · React 18 · TypeScript
- Tailwind CSS · shadcn/ui (Radix UI) · lucide-react
- Spotify Web API · MusicBrainz API

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build (static export)
npm run start    # start the production server
npm run lint     # lint the project
```

Create a `.env.local` file with your Spotify app credentials:

```bash
NEXT_PUBLIC_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_CLIENT_SECRET=your_spotify_client_secret
```
