# Resume video

Two versions live side by side (same data, same render pipeline):

- **v1** (`src/*.tsx`, `resume-<lang>.*`): kinetic typography, 120 BPM synthwave, 66 s.
- **v2** (`src/v2/`, `resume-v2-<lang>.*`): the career "deployed" from an IDE (florian.go, `git log --graph`, a CI pipeline where skills are tests, `kubectl apply`, an isometric cluster where soft skills are pods, a Grafana-style dashboard, `sudo hire florian`), 128 BPM electro, 67.5 s.

v1 is a 66-second animated resume made with [Remotion](https://www.remotion.dev) (React → video).
All facts come from the site's `src/data/resume-data.tsx`, so updating the resume and
re-rendering keeps the video in sync. Video-only phrasing lives in `src/copy.ts` (EN + FR).

Soundtracks are original: `scripts/make-music.mjs` (v1, 120 BPM) and `scripts/make-music-v2.mjs`
(v2, 128 BPM) synthesize the music in code (no samples, no third-party rights). Scene cuts land
on bars of the music.

```sh
cd video
npm install
npm run studio          # live preview / tweak in the browser
npm run render          # → ../public/video/resume-{en,fr}.{mp4,webm,jpg}
npm run render -- fr    # one language only
npm run render:v2       # → ../public/video/resume-v2-{en,fr}.{mp4,webm,jpg}
npm run icons           # site icon (src/Icon.tsx) → ../src/app/{icon.svg,icon.png,apple-icon.png,favicon.ico}
```

Requires `ffmpeg` (for loudness normalisation, WebM encoding and posters).
