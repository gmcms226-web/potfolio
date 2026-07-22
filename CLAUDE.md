# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR (http://localhost:5173/)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

There is no test framework or linter configured. Validate changes with `npm run build` (catches bundling/import errors) and visual checks via `npm run dev`. On Windows, `npm.cmd run build` may be needed.

Headless verification scripts (all use puppeteer-core driving Edge; `check*`/`shoot-case` need the dev server running, screenshots land in `scripts/shots/`):

- `node scripts/check.mjs` — drives the opening sequence, screenshots each scroll depth, reports console errors; use for scroll-driven animation changes on a cold load
- `node scripts/check-reload.mjs` — verifies the scroll-to-bottom-then-F5 case (post-intro landing position)
- `node scripts/check-magazine.mjs` — screenshots all 12 Projects folding cards (3 projects × 4)
- `node scripts/shoot-case.mjs <slug|/path> [scrollpx]` — screenshots a case-study page (or home with a `/` path)
- `node scripts/shoot-static.mjs <folder> <page> <outfile> [selector|scrollpx]` — serves a local static site and captures it; used to produce the `projects/` and `case/` capture assets
- `node scripts/record-search.mjs` — regenerates `src/assets/reaction/search-demo.webm` (the asset was deleted as unused on 2026-07-13; the script only matters if that idea returns)

Important: HMR corrupts ScrollTrigger pin state, so after structural edits the browser needs a full reload before judging behavior.

Mobile review screenshots (390×844 baseline) live in `scripts/shots/mobile/`; full-page mobile passes were done 2026-07-11 and 2026-07-16 (folding cards verified down to 360×640), so mobile regressions matter as much as desktop ones.

This directory is a git repository — use commits for rollback points. Older manual backups live under `.codex-backups/` (gitignored, e.g. `reaction-before-radar/`).

Deployment: remote `origin` is https://github.com/gmcms226-web/potfolio (private); **pushing to `main` auto-deploys to production** at https://potfolio-green-seven.vercel.app via the Vercel–GitHub integration, so don't push unverified work. Manual deploy: `vercel deploy --prod --yes`. `vercel.json` holds the SPA rewrite that keeps `/projects/:slug` reloads from 404ing.

Also read `AGENTS.md` (coding style) and `HANDOFF.md` (active work state, pending items, immutable rules). AGENTS.md predates the git init and some asset moves — where it conflicts with this file or HANDOFF.md, those win.

## Architecture

Vite + React 18 portfolio. Dependencies: React, GSAP, react-router-dom, three/@react-three/fiber@8 (intro only — fiber v9 needs React 19, don't upgrade casually). Code comments are in Korean; keep that convention.

Routing (`App.jsx`): `/` = `pages/Home` (the full scroll experience), `/projects/:slug` = `pages/CaseStudy` (light-themed detail pages; content single-sourced in `src/data/caseStudies.js`, slugs: marketing/web/automation). The Projects folding cards are category entrances linking to these. Case-study gallery images: `src/assets/case/<slug>-N.png`. A case-study entry with a `chapters` array renders as chapters (sections → gallery slice via `gallery: { from, to }` → per-chapter 회고 card — the web page uses this, chronological order user-confirmed); without it, the flat sections+gallery layout is used (marketing/automation). CaseStudy.jsx renders several optional data blocks only when the entry defines them: a section with `image: { num, caption }` gets a two-column body+figure layout (image = `case/<slug>-N`); `beforeAfter`, `flow` (nodes array — `manual: true` renders the dashed "사람이 직접" node), `runLog` (numbered capture grid — its `num`s are automatically excluded from the top gallery), `features`, and `expansion` are the automation page's visual blocks. Add/edit these in `caseStudies.js`, not in JSX. Opening plays once per real page load (module-scope flag in Home.jsx — survives route changes, resets on reload); returning via "메인으로" (`location.state.returnTo`) lands at `#projects-anchor` — the jump must re-run in rAF after the unlock-refresh, which resets scroll to 0.

### Opening (scroll-driven)

The only auto-playing part is `Intro` (`src/components/Intro/`) — a ~2.3s year counter overlay (2018.01 → 2026.07). `Home.jsx` locks scrolling on **both** `document.documentElement` and `document.body` while it plays (locking only body lets wheel input scroll the page behind it), with a 5s failsafe force-unlock. `onLeaving` unlocks scroll, `onFinish` unmounts the overlay. Everything after is scroll-scrubbed, not timed.

Section order: Reaction → Record (count-up stats, no pin — free-scroll breather between pins; 이력 rows live in `Record.jsx`, order 경력 → 프로젝트 → 교육 → 자격 is user-confirmed) → About → Hero (work tunnel, bridge into Projects) → Projects → Contact.

`SiteHeader` (`src/components/SiteHeader/`) is the persistent mini header + top scroll-progress bar that appears once the opening ends (`visible` prop from Home). It uses `mix-blend-mode: difference` to stay legible over dark and light sections — the POV section title visually "breaking" as it passes under the header is intentional design (user-confirmed), not a bug to fix.

- `Reaction` (`src/components/sections/Reaction/`) — pinned 900% scrub (scrub 1.2) through scenes sharing one `perspective` viewport: foggy sea voyage (`src/assets/voyage/ships-scrub.mp4` — a re-encode of the unbundled original `Ships_sailing_hero.mp4`; any replacement video **must** be re-encoded with a short GOP (`-g 4 -keyint_min 4 -sc_threshold 0`, full ffmpeg command in HANDOFF.md) or `currentTime` seeking freezes in real browsers — scroll scrubs `video.currentTime` via a proxy-object tween over timeline 0–58, poster/fallback `sea-poster.jpg`, darkened by a shade/vignette overlay; CSS fog layers clear with scroll and the INSIGHTS hesitation keywords start clustered near center then scatter outward off-screen — a static ship image was tried and removed) → content card ("사용자의 언어로 기준을 정리합니다") → journey path 고민→탐색→읽음→안심→문의 with Search./Read./Trust. words flying through z (WORDS array; Read. sits at `y: 170` to clear the card) — the sea stays behind these scenes as a stage and exits at timeline 64 → inquiry message bubbles → mosaic wall of real inquiry captures that accumulate one by one (deliberately accumulation-style, not fly-through, to avoid duplicating the Hero tunnel grammar) → wall dims and recedes while "Reaction." lands over it → slogan → identity reveal ("반응을 읽는 마케터 추민석" + MARKETING/WEB/자동화 pillar cards). Timeline units = progress 0–100; mosaic layout is a deterministic 4×4 grid + jitter, appearance order a ×7 mod 16 permutation. The Hero tunnel has no finale — it's purely a work fly-through; identity and pillars intentionally live here. A SCROLL nudge button overlays the first scene (click/tap = exactly one viewport of smooth scroll, chevron bounce respects `prefers-reduced-motion`); its fade-out belongs to the existing timeline, don't add a separate one.
- `Hero` — pinned 500% scrub (`SCROLL_LENGTH`); scroll progress drives the same `progress.current.p` value the gsap.ticker uses to place tunnel cards. The animation code is unchanged from its auto-play era; only the driver changed.

Pin lengths were globally extended ~40% on 2026-07-09 after "전체적으로 너무 빨라" feedback (Reaction 900%, Hero 500%, About 210%/slide + 85% exit, Projects folding `+=3200`px, POV exit 1.5×viewport) — don't shorten without asking.

### Section-stack scroll transitions

About and Projects exit with a scale-down + fade while the next section slides over ("stacked pages"), implemented differently at each boundary to avoid nested-pin conflicts: About's exit is appended to its existing pinned timeline (extra +85% scroll); the Projects black POV section gets its own `pinSpacing: false` pin as Contact covers it. Contact must keep `position: relative; z-index: 2` and an opaque background for the cover effect to work.

### Convention-based image loading

Components discover images with `import.meta.glob` and parse numbers out of filenames — file naming is load-bearing:

- `src/assets/works/work-NN.png` → Hero tunnel card NN (extension/case-insensitive)
- `src/assets/reaction/reactionNN.*` → Reaction mosaic wall (leading zeros OK)
- `src/assets/pillars/pillar-N.*` → Reaction identity pillar cards (1=MARKETING, 2=WEB, 3=자동화); raster (png/jpg/webp) wins over the co-existing SVGs
- `src/assets/values/value-N.*` → About value objets (1=관찰, 2=기획, 3=성장, 4=연결); delete to fall back to the SVG line icons
- `src/assets/projects/project-N-M.*` → Projects folding cards (project N, card M): photo-spread cards 2·3 use the image as the 화보 photo (falls back to a "준비 중" page), cover card 1 and back-cover card 4 are replaced wholesale by the image
- `src/assets/write/write-N-M.png` → CaseStudy "글쓰기 해부" captures on the marketing page (N=campaign: 1 애견미용, 2 과외, 3 입시; M=reader-journey order); captions/chapters are edited in the `writing` block of `caseStudies.js`, not in JSX

Missing numbers render as placeholders; adding a correctly named file is all that's needed.

### Projects section (two distinct animation systems)

`src/components/sections/Projects/` has two parts in fixed order:

1. Folding-card section — 3 projects × 4 cards, pinned scroll interaction using **GSAP ScrollTrigger**. The 4 cards follow a magazine-editorial grammar: cover (1) → photo spreads (2·3) → back cover (4). All copy/captions are single-sourced in the `CARD_PROJECTS[].magazine` field in `Projects.jsx` (photos take an optional `pos` for object-position cropping) — edit there, not in the JSX markup.
2. "PROJECT POINT OF VIEW" black section — SNS/AI/Web cards with CSS `div` circle graphics, animated with **Intersection Observer + CSS transitions only** (deliberately not GSAP). Keyword circles appear staggered (`--tx` + transition-delay) and inflate/spread on hover (gated to `hover:hover and pointer:fine`).

Keep this split: don't introduce GSAP into part 2 or replace part 1 with part 2. A hover content-swap for the POV cards was proposed and rejected ("그냥 냅두자") — don't re-propose it.

## Active constraints (from HANDOFF.md)

- Design should stay clean, premium, B2B-proposal-like — no neon, particles, or heavy gradients.
- Never suggest or add a custom cursor — the user explicitly had one removed.
- Company names are OK in the 경력 line of Record's Capabilities block ("동화세상에듀코 콘텐츠 마케팅 8년 · ㈜예람 인턴 2개월", user-confirmed 2026-07-09) — avoid exposing them elsewhere in copy.
- Known open items (post-deploy polish): `pillar-*`/`value-*` were converted to WebP and the favicon/unused-file issues resolved on 2026-07-13, but `works/`, `write/`, `case/` still hold multi-MB PNGs (JS chunk warning also remains) — convert/resize those next if load time matters.
- All 12 Projects folding cards are filled as of 2026-07-13 (automation spreads = user-provided Make captures; theme switched to 주간 업무보고 자동화). Known blemish: the P.02 capture shows an old blog-SEO prompt — replace if the user produces a weekly-report prompt capture, don't nag otherwise.
- Never suggest a floating scroll-to-top button — reviewed and rejected 2026-07-16; the case-study sticky bar + footer buttons are the agreed exits.
- The 마케팅기획전문가 certificate is **not yet earned** — do not add it to Record's 이력 (user still deciding whether to take it).

## Style

- Two-space indent, single quotes, no semicolons, React function components + hooks.
- CSS Modules co-located with each component (`Hero.module.css` next to `Hero.jsx`).
- Shared design values go in `src/styles/tokens.css`, not duplicated literals in modules.
