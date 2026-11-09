# 📜 Changelog

All notable changes to the **Nusuk Keys (مفاتيح نسك)** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.0] - 2026-11-09

### Added
- **4-Stage Progressive Hydration Pipeline**:
  - Stage 1 (<100ms): 500 keys initial render.
  - Stage 2: Background sync to 1,000 keys.
  - Stage 3: Background sync to 1,500 keys.
  - Stage 4: Parallel streaming batches up to 5,996+ keys.
- **Glass Skeleton Shimmer**: 8-card responsive shimmer grid rendering instantly during initial hydration.
- **Local SWR Cache**: `localStorage` caching with version key `nusuk_keys_cache_v2` for 0ms return visit paints.
- **Sacred Nasta'liq Calligraphy Engine**: Specialized typography for Quranic Ayah (*Surah Al-Ma'idah 5:2*) and Hadith (*Sahih Muslim 2699*) with generous vertical breathing room (`leading-[3]`).
- **Comprehensive Documentation Suite**: Added `ARCHITECTURE.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md`.

### Changed
- **Modal Close Button**: Mirrored close button placement to top-left in RTL mode to prevent collision with Arabic header icon.
- **Info Button**: Integrated dark-emerald glass corner `(i)` button directly on primary action buttons.
- **Card Action**: Compacted action button to a clean, minimal "Copy" with SVG icon.

---

## [2.0.0] - 2026-11-08

### Added
- Minimalist glassmorphic dark interface with zinc palette (`#09090b`).
- Web Audio API haptic procedural audio engine for zero-latency clicks and chimes.
- OpenGraph & Twitter preview cards (1200x630) for social sharing.
- PWA installability with `manifest.ts` and Apple touch icons.
- Search Engine & AI agent crawler support via `sitemap.xml`, `robots.txt`, and `llms.txt`.
- Google Search Console ownership verification.

---

## [1.0.0] - 2026-11-07

### Added
- Initial release of Nusuk Keys web directory.
- Next.js 14 App Router foundation with Supabase PostgreSQL backend.
- Bilingual English & Arabic dictionary switcher.
- Instant search and upvote/downvote verification system.
