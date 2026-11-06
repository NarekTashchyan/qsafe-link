# QSafe Link — MVP

MVP of the **Quantum-Safe Communication with QKD** project (Management course, French University in Armenia, 2026).

The site has two pages:

- `/` — landing page: the problem, how the BB84 algorithm works, the product and the proof-of-concept results
- `/simulation` — the interactive MVP

The simulation runs the full product workflow between two sites of a bank:

1. Site A sends photons to Site B (BB84 protocol)
2. The bases are compared over the normal network
3. Spy check: the error rate is compared with the 11% safety limit
4. Both sites derive the same 256-bit secret key
5. The key encrypts a real message with AES-256-GCM, and tampering is detected

The photon channel is simulated in software. The spy check, key processing and encryption run for real in the
browser (Web Crypto API).

Team: Narek Tashchyan, Robert Yesayan, Rita Sharafyan, Elina Melkumyan.

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the landing page and http://localhost:3000/simulation for the simulation.

## Build

```bash
npm run build
```

This creates a static website in the `out` folder. `npm run preview` serves it locally.

## Deploy to Netlify

**Fastest (no Git):** run `npm run build`, open https://app.netlify.com/drop and drag the `out` folder onto the page.

**From GitHub (auto-deploys on every push):**

1. Push this folder to a GitHub repository.
2. In Netlify: **Add new site → Import an existing project → GitHub**, and pick the repository.
3. Netlify reads `netlify.toml`, so the settings fill in automatically (build command `npm run build`, publish
   directory `out`). Click **Deploy**.

## Project structure

```
app/page.tsx              landing page (styles in app/landing.css)
app/simulation/page.tsx   the interactive simulation
app/layout.tsx            fonts, metadata, global styles
components/               UI parts (photon stream, bench, controls, steps, session log)
lib/bb84.ts     BB84 simulation: photons, spy, sifting, error rate, secure key size
lib/crypto.ts   privacy amplification (SHA-256) and AES-256-GCM encryption
```
