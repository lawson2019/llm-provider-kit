# Remotion intro animation

Deterministic source for the 8.5 s `llm-provider-kit` intro shown on the demo page.

- Composition `Intro`: 960×540, 30 fps, 255 frames (8.5 s)
- Output: `../demo/demo-intro.mp4` (H.264, yuv420p)
- Poster/fallback: `../demo/demo-intro.gif`

## Commands

```bash
cd remotion
npm install
npm run studio   # interactive preview
npm run render   # write ../demo/demo-intro.mp4
```

## Why Remotion

The animation is a pure function of the frame number, so the same source renders
identically on any machine and can be re-rendered after copy or data changes.
Text stays pixel-accurate, unlike generated video.

This directory is a separate, private package: the root `llm-provider-kit`
package keeps zero runtime dependencies and never imports Remotion.
