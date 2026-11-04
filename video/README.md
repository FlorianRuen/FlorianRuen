# Resume video

A 66-second animated resume made with [Remotion](https://www.remotion.dev) (React → video).
All facts come from the site's `src/data/resume-data.tsx`, so updating the resume and
re-rendering keeps the video in sync. Video-only phrasing lives in `src/copy.ts` (EN + FR).

The soundtrack is original: `scripts/make-music.mjs` synthesizes a 120 BPM track in code
(no samples, no third-party rights). Every scene cut lands on a bar (60 frames = 2 s).

```sh
cd video
npm install
npm run studio          # live preview / tweak in the browser
npm run render          # → ../public/video/resume-{en,fr}.{mp4,webm,jpg}
npm run render -- fr    # one language only
```

Requires `ffmpeg` (for loudness normalisation, WebM encoding and posters).
