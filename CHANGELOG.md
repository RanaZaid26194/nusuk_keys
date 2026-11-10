# 📜 Changelog

All notable changes to the **Nusuk Keys (مفاتيح نسك)** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.7.0] - 2026-11-10

### Added
- **Ghost Key Pruning on Complete Hydration (`page.tsx`)**:
  - Adaptive merge engine `mergeIncoming(prev, incomingList, complete)` detecting full catalog loads (`deduped incoming >= totalCount`).
  - Automatically purges deleted or deactivated keys from browser state and `localStorage` cache upon load completion.
  - **Local Keep Rule**: Preserves local-only keys if they have an active RPC in flight (`pendingIdsRef`) or were submitted by this browser within `LOCAL_KEEP_MS` (10 minutes via `locallyAddedRef`).
  - Cache writes are deferred until pruning is complete, preventing ghost keys from being re-persisted.
- **Post-Vote Button Locking & Feedback (`KeyCard.tsx`)**:
  - Disables both vote buttons immediately upon casting a vote (`item.userVoted`).
  - Preserves selected vote highlight while dimming the other button (`opacity-40 cursor-not-allowed`, hover/tap animations disabled).
  - Displays bilingual feedback tooltip: `"You already voted"` (EN) / `"لقد قمت بالتصويت مسبقاً"` (AR).
  - Silently blocks vote triggers and audio synthesis when clicking disabled buttons.
- **Safe Storage Helper (`safeStorage.ts`)**:
  - SSR-safe, throw-resilient wrappers (`safeGet`, `safeSet`, `safeRemove`) protecting against quota limits and private browsing blocks.
- **Strict RPC Security Lockdown (`supabase_lockdown.sql`, `supabase_schema.sql`)**:
  - Revoked direct `UPDATE` privileges on `challenge_keys` from `anon` and `authenticated` roles.
  - Counter mutations (`upvotes`, `downvotes`, `copies_count`) run exclusively via atomic `SECURITY DEFINER` RPCs (`cast_vote`, `increment_copy`).

### Changed
- **Deterministic Multi-Stage Pagination**:
  - Added secondary `id ASC` order across all query stages (`.order("created_at", { ascending: false }).order("id", { ascending: true })`).
  - Added `dedupeById` across stage assembly, realtime updates, and cache hydration.
- **Component Memoization**:
  - Stabilized `handleVote` and `handleCopy` handlers in `page.tsx` using `keysRef` to prevent unnecessary `KeyCard` re-renders.

### Fixed
- **Verified Tab Visibility (`page.tsx`)**:
  - Kept verified keys visible in the **Verified Working** tab even after being marked as used by the user (instead of hiding them via `usedSnapshot`), while keeping browse tabs (`All Keys`, `Most Used`, `Recently Added`) filtered cleanly.
- **Duplicate Search Clear Icon (`globals.css`)**:
  - Suppressed native browser `::-webkit-search-cancel-button` / `::-ms-clear` controls on `input[type="search"]` so only the themed custom clear button renders.

---

## [2.6.0] - 2026-11-10

### Added
- **Platform-Aware Ayah End Marker Engine (`DailyAyah.tsx`)**:
  - Resolves WebKit/CoreText ligature limitation on iOS devices (where `U+06DD` and digits rendered side-by-side) by applying dynamic composite centering for Arabic-Indic numerals inside the ornamental medallion `۝`.
  - Native HarfBuzz font shaping on Desktop (Windows, macOS, Linux) and Android remains 100% untouched and unaffected.
  - Dynamic font scaling and letter-spacing for 1-digit, 2-digit, and 3-digit ayah numbers.
- **Responsive Report Modal (`ReportModal.tsx`)**:
  - Dedicated reporting interface with direct native `mailto:` links and one-tap clipboard copy for support email (`ranazaide288@gmail.com`).
  - Pre-filled bug reporting template for pilgrims reporting invalid or expired keys.
  - Bilingual English and Arabic translations (`reportModal`).
- **Omni-Channel Social Media Marketing Suite**:
  - High-resolution promotional graphics in both English and Arabic with scannable QR codes and unobstructed 3D emerald-and-gold key visuals:
    - Landscape Banners (`1920×1080`): `nusuk_keys_promo.png` and `nusuk_keys_promo_ar.png`.
    - Square Social Posts (`1080×1080`): `nusuk_keys_promo_square.png` and `nusuk_keys_promo_square_ar.png`.

### Changed
- **Header Scroll Compression**:
  - Fixed initial page scroll jump by isolating tab horizontal scrolling into `tabContainerRef`.
  - Header compresses smoothly from `h-16`/`72px` to `h-14`/`56px` with deepened backdrop-blur-xl and border elevation.
- **Viewport Boundary Clamping**:
  - Clamped all tooltips, cooldown notifications, and popups with `max-w-[calc(100vw-2rem)]` to prevent overflow across small screens (320px–390px).
- **Directory Milestone**:
  - Updated all counters and metadata to reflect **7,000+ active verified challenge keys**.

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
