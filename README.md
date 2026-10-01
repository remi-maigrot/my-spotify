# MySpotify · Music search & recommendations

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Spotify API](https://img.shields.io/badge/Spotify_API-1DB954?style=flat-square&logo=spotify&logoColor=white)
![MusicBrainz](https://img.shields.io/badge/MusicBrainz-BA478F?style=flat-square&logo=musicbrainz&logoColor=white)

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
