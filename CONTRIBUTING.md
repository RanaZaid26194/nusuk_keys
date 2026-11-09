# 🤝 Contributing to Nusuk Keys (مفاتيح نسك)

Thank you for your interest in contributing to **Nusuk Keys**! This project is an open-source community utility dedicated as an ongoing charity (*Sadaqah Jariyah*) to assist pilgrims worldwide.

Contributions of all kinds — translations, performance optimizations, accessibility enhancements, bug fixes, and feature proposals — are warmly welcomed.

---

## 🎨 Design Principles & Aesthetic Guidelines

When proposing or building user interface changes, please adhere to these core design standards:

1. **Clean Glassmorphic Surfaces**: Maintain a calm, restrained dark aesthetic. Use deep dark zinc tones (`#09090b`, `#18181b`, `#27272a`) with subtle hairline borders (`border-zinc-800/80`) and frosted glass backdrops (`backdrop-blur-xl`). Avoid loud, saturated gradients or visual clutter.
2. **Fluid Spring Dynamics**: Use natural spring physics with `framer-motion` for transitions and modals rather than rigid linear animations.
3. **Sacred Calligraphy & Line Height**: Maintain generous vertical breathing room (`leading-[2.8] - leading-[3]`) for Arabic sacred typography so diacritics (*tashkeel*) and waqf marks are never clipped.
4. **First-Class Bi-directional (RTL) Support**: Every UI element must be carefully tested in both English (LTR) and Arabic (RTL) to ensure symmetrical alignment and zero layout collisions.

---

## 🛠️ Development Workflow

1. **Fork the Repository**:
   Click the **Fork** button at the top-right of the repository page.

2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nusuk_keys.git
   cd nusuk_keys
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Local Testing & Code Quality**:
   - Write clean, maintainable TypeScript with strict types.
   - Verify there are no build or compilation errors:
     ```bash
     npm run build
     ```
   - Test responsiveness across mobile (<640px) and desktop viewports.

6. **Commit Message Conventions**:
   Follow standard Conventional Commits:
   - `feat:` New user-facing feature
   - `fix:` Bug fix
   - `perf:` Performance enhancement
   - `docs:` Documentation improvements
   - `refactor:` Code refactoring without behavior change

7. **Submit a Pull Request**:
   - Push your branch to GitHub (`git push origin feature/your-feature-name`).
   - Open a Pull Request against the `main` branch with a clear description and screenshots of any visual changes.

---

## 🌍 Community & Translations

We especially welcome contributions to localize Nusuk Keys into more languages spoken by pilgrims worldwide (such as Urdu, Indonesian, Turkish, Malay, and French). If you'd like to help translate, feel free to open a PR or start a discussion!
