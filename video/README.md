# Resume video

Three versions live side by side (same data, same render pipeline):

- **v1** (`src/*.tsx`, `resume-<lang>.*`): kinetic typography, 120 BPM synthwave, 66 s.
- **v2** (`src/v2/`, `resume-v2-<lang>.*`): the career "deployed" from an IDE (florian.go, `git log --graph`, a CI pipeline where skills are tests, `kubectl apply`, an isometric cluster where soft skills are pods, a Grafana-style dashboard, `sudo hire florian`), 128 BPM electro, 67.5 s.
- **v3** (`src/v3/`, `resume-v3-<lang>.*`): what I know, then who I am. The v2 IDE, shortened
  (florian.go, git log, pipeline, dashboard), then `exit`: the IDE flies away and a mountain-bike
  ride at dawn takes over. The shy line plays on a piano break, soft skills are trail checkpoints
  backed by real facts, and the summit shows three words and the interests. Back to
  `sudo hire florian` for the finish. 128 BPM uplifting house in A major, 78.75 s.
- **v4** (`src/v4/`, `resume-v4-<lang>.*`): a story in chapters on a slow cinematic score,
  100 BPM, 76.8 s. Kept as source only (too slide-like); `npm run render:v4` regenerates it.
- **v5** (`src/v5/`, `resume-v5-<lang>.*`): the trailer. Same chapters as v4 but shot like a
  video: one continuous camera (push, punch on every kick, shakes on the hits, whip pans with
  motion blur on the cuts), full-bleed moving sets (the Eyes'R camera feed in perspective, a
  flight through CIDgravity's provider network, a highway of OVHcloud requests, a
  side-scrolling mountain-bike travelling at dawn, a light tunnel for the ambitions), kinetic
  typography that slams in on the beat, film grain and letterbox. Original 128 BPM electro,
  B minor, drop on bar 4, piano breakdown for "who I am", bigger drop for "what's next",
  heartbeat under `sudo hire florian`. 60 s.

v1 is a 66-second animated resume made with [Remotion](https://www.remotion.dev) (React → video).
All facts come from the site's `src/data/resume-data.tsx`, so updating the resume and
re-rendering keeps the video in sync. Video-only phrasing lives in `src/copy.ts` (EN + FR).

Soundtracks are original: `scripts/make-music.mjs` (v1, 120 BPM), `scripts/make-music-v2.mjs`
(v2, 128 BPM), `scripts/make-music-v3.mjs` (v3, 128 BPM) and `scripts/make-music-v4.mjs`
(v4, 100 BPM) and `scripts/make-music-v5.mjs` (v5, 128 BPM) synthesize the music in code (no samples, no third-party rights). Scene cuts land
on bars of the music.

```sh
cd video
npm install
npm run studio          # live preview / tweak in the browser
npm run render          # → ../public/video/resume-{en,fr}.{mp4,webm,jpg}
npm run render -- fr    # one language only
npm run render:v2       # → ../public/video/resume-v2-{en,fr}.{mp4,webm,jpg}
npm run render:v3       # → ../public/video/resume-v3-{en,fr}.{mp4,webm,jpg}
npm run render:v4       # → ../public/video/resume-v4-{en,fr}.{mp4,webm,jpg}
npm run render:v5       # → ../public/video/resume-v5-{en,fr}.{mp4,webm,jpg}
npm run icons           # site icon (src/Icon.tsx) → ../src/app/{icon.svg,icon.png,apple-icon.png,favicon.ico}
```

Requires `ffmpeg` (for loudness normalisation, WebM encoding and posters).
