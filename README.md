# Selah

An interactive atlas of the biblical world. Selah lets you explore scripture as a world — not just a text.

> *Selah* (סֶלָה) — a pause marker in the Hebrew Psalms. A moment to stop and reflect.

## What it does

Most Bible apps are reading tools. Selah is an exploring tool. You can wander from a person to the places they touched, from a word to the verses where it appears, from a moment on the timeline to the web of people around it.

**Map** — Trace journeys, kingdoms, and cities across the ancient Near East, from Eden to Patmos, on an interactive Leaflet map.

**Characters** — Browse 100 biblical figures with biographies, scripture references, key locations, and relationship data — from major patriarchs to unnamed witnesses.

**Words** — Explore 40 original Hebrew and Greek words with transliterations, definitions, and the verses they appear in.

**Timeline** — Plot two thousand years of biblical history on a single horizon, from Abraham to the apostles.

**Network** — A D3 force graph of relationships between biblical characters — see who was connected to whom and how.

**Bible** — Browse scripture passages linked to the people, places, and words in the rest of the app.

## Data

All content is stored as static JSON in `src/data/`:

| File | Entries |
|---|---|
| `characters.json` | 100 characters |
| `locations.json` | 35 locations |
| `words.json` | 40 Hebrew / Greek words |
| `journeys.json` | 100 journeys |

## Tech stack

- React 19, React Router 7
- Leaflet + react-leaflet (map)
- D3 (force graph)
- Static JSON data (no backend)

## Running locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

The app is a standard Create React App build. The `public/_redirects` file is configured for Netlify's SPA routing.

```bash
npm run build
```
