# 🤝 Contributing to Nusuk Keys (مفاتيح نسك)

Thank you for your interest in contributing to **Nusuk Keys**! This project is built as an open community utility (Sadaqah Jariyah) to assist pilgrims worldwide.

---

## 🎨 Design Principles (Apple Human Interface Guidelines)

When contributing UI features or making frontend modifications, adhere to these aesthetic standards:

1. **Subtle Glassmorphic Surfaces**: Avoid loud gradients or garish neon colors. Use deep dark zinc tones (`#09090b`, `#18181b`, `#27272a`) with subtle borders (`border-zinc-800/80`) and frosted glass backdrops (`backdrop-blur-xl`).
2. **Spring Dynamics**: Use physics-based motion with `framer-motion` rather than linear or mechanical easing curves.
3. **Typography**: Respect the sacred Nasta'liq calligraphy line-height requirements. Ensure ample vertical padding so diacritics are never cropped.
4. **Bilingual Mirroring**: Any new UI element must properly support both LTR (English) and RTL (العربية) without layout collisions.

---

## 🛠️ Development Workflow

1. **Fork & Branch**:
   ```bash
   git checkout -b feature/my-enhancement
   ```

2. **Code Standards**:
   - Write clean TypeScript with strict types.
   - Run typecheck and linting:
     ```bash
     npm run build
     ```
   - Ensure zero build errors or hydration mismatches.

3. **Commit Conventions**:
   Follow Conventional Commits:
   - `feat:` New features
   - `fix:` Bug fixes
   - `perf:` Performance improvements
   - `docs:` Documentation updates
   - `style:` Formatting or design polish

4. **Pull Requests**:
   - Provide a clear description and include before/after screenshots for visual changes.
   - Ensure responsive testing across mobile (<640px) and desktop (>1024px) viewports.
