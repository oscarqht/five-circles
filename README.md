# Five Circles

![Five Circles — find all five differences in a watercolor scene](docs/readme-poster.png)

A responsive, browser-based find-the-differences game built with Vite, TypeScript, and plain CSS.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the printed local URL. To play on a phone connected to the same Wi-Fi, open the printed Network URL. Production output is created by `npm run build`; `npm run preview` serves it locally.

## Playing

- The 9 supplied illustrations each have one new edited image: **9 rounds**, with **exactly 5 small object replacements per round**.
- A round compares an original with its matching edited illustration. Each change swaps a small item for another plausible object with similar scale, color, lighting, soft edges and watercolor texture. Look closely: these are intended to blend into the scene.
- Landscape illustrations stack vertically. The portrait illustration appears side by side, including on phones.
- Tap/click either image to find a difference. Found details are circled in both pictures and repeated taps count only once.
- Drag to pan after zooming, use the mouse wheel or a two-finger pinch to zoom, or use the zoom buttons. Both images share one normalized camera transform.
- Shift + wheel pans horizontally. Focus a picture for arrow-key panning, + / − zoom, and 0 to reset.
- Hints center and highlight an unfound detail. Progress, current round, completed rounds, and time are saved in localStorage on the current device.
- There is no time limit or penalty. The timer pauses while the tab is hidden or a dialog is open.

## Puzzle data and images

- `assets/`: the original supplied PNGs, unchanged; `assets/generated/` holds the nine generated edit sources.
- `public/images/`: 9 lossless WebP originals, 9 finished edits, and 9 lightweight collection thumbnails. These are the images used by the game.
- `public/data/puzzles.json`: all 9 rounds and their answer coordinates. `x`, `y`, and `bounds` use normalized image coordinates from 0 to 1. `pixelBounds` stores the exact source-pixel rectangle. Each difference has a stable ID and human-readable label.
- `assets/generation-prompts.json`: the prompt set and built-in image generation provenance.
- `scripts/image-plan.mjs`: scene definitions, five object replacements per scene, and measured compositing bounds.

The edited images were created with the built-in image generation tool. Only the five measured regions from each generated result were composited into the untouched source, with a three-pixel feathered edge. Lossless output guarantees **zero changed pixels outside those five regions**. Each region was visually reviewed for a real object substitution, local watercolor style and natural scale; pixel checks alone cannot prove these. Automated size checks limit each edit region to 1.5% of the canvas, and the five combined to 4%, to prevent oversized edits.

Review all 45 before/after details in [the object replacement contact sheet](docs/object-replacements.webp).

The final image files and JSON are self-contained; running the game never calls an image-generation service. Rebuild the images with `node scripts/prepare-assets.mjs`; the generated source images and prompt manifest are included in `assets/generated/` and `assets/generation-prompts.json`. No generation service is needed to rebuild.

This harder edition uses a new localStorage namespace (`little-differences-v3`) so answers and completions from both earlier puzzle sets are not applied to the new objects.

## Verification

```sh
npm test                 # camera transforms, hit coordinates, bounds, shuffle
npm run validate:assets  # dimensions, five non-overlapping regions, no edits outside them
npm run test:browser      # desktop + phone browser tests (start npm run dev first)
npm run build            # strict TypeScript check and production build
```

Browser tests use installed Google Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` to use Edge, or install Playwright Chromium and set `PLAYWRIGHT_CHANNEL=chromium`.

No backend or account is required. Google Fonts are optional; system fonts are used when unavailable.
