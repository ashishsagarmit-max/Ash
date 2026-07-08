# The Alternate Pharmacopoeia — Web App

A proper multi-page web app: real routes (`/`, `/medicine/:slug`, `/add`, `/about`),
a real database (JSON file on disk, read/written by the server — swap for
Postgres/SQLite later without changing the frontend), and a working "Add entry"
form so new medicines don't require touching code.

**Zero external dependencies** — built only on Node's core `http`, `fs`, `url`,
and `querystring` modules. That means `npm install` isn't required and there's
nothing to break on a host's build step, which is what makes this a two-minute
deploy on the free hosts below.

## Pages

| Route | What it does |
|---|---|
| `GET /` | Search + browse index. `?q=` filters by name/alias. |
| `GET /medicine/:slug` | Detail card for one entry. |
| `GET /add`, `POST /add` | Form to add a new entry — saves straight to the database. |
| `GET /about` | What the tool is / isn't, disclaimer. |

## Run it locally

```
cd webapp
node server.js
```

Then open `http://localhost:3000`. No `npm install` step needed.

## Get a live URL

I can't deploy this from my own sandbox (no outbound internet access there),
but you can have it live in a couple of minutes on any of these — all have
free tiers and all auto-detect Node from `package.json`:

### Option A — Render (easiest, free tier, no card required)
1. Push this `webapp` folder to a new GitHub repo.
2. Go to [render.com](https://render.com) → **New → Web Service** → connect the repo.
3. Build command: (leave blank). Start command: `node server.js`.
4. Deploy. You'll get a URL like `https://alternate-pharmacopoeia.onrender.com`.

### Option B — Railway
1. Push to GitHub, then [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
2. It auto-detects `node server.js` from `package.json`. Deploy, then generate a domain under Settings.

### Option C — Fly.io
1. Install the `flyctl` CLI, run `fly launch` inside the `webapp` folder, accept the defaults.
2. `fly deploy`. Gives you a `https://<app>.fly.dev` URL.

### A note on the database
The JSON file (`data/medicines.json`) lives on the server's own disk. On
Render/Railway free tiers the filesystem is **ephemeral** — entries added
through `/add` can be lost on redeploy or restart. Fine for trying this out;
if you want additions to persist long-term, the next step is swapping
`lib/data.js` for a real database (e.g. a free Postgres instance on Render or
Railway, or SQLite on a host with a persistent volume like Fly.io). The rest
of the app (routes, views) doesn't need to change — only `lib/data.js` would.

## Project structure

```
webapp/
  server.js           — HTTP server + routing
  lib/data.js          — reads/writes data/medicines.json (swap this for a real DB later)
  lib/views.js         — HTML templates for each page
  public/style.css     — shared stylesheet
  data/medicines.json  — the 23 seed entries
```

## Please read

This app is an educational cross-reference, not a medical device or verified
clinical guidance — including anything added later through the `/add` form.
Before sharing the live URL with anyone beyond yourself, it's worth having a
doctor or pharmacist glance over the content, since it will read as more
authoritative once it's a real website with a real URL than it did as a
local file.
