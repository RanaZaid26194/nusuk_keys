# 🕋 Nusuk Keys (مفاتيح نسك)

A community-driven, ultra-fast web application to share, discover, and verify **Nusuk Umrah Challenge Keys** (`NG-...`), optimized for seamless deployment on **Vercel** with **Supabase**.

---

## ✨ Features & Micro-Animations

- **⚡ Native Responsiveness**: Crafted for every screen dimension — compact touch experience on mobile, clean multi-column layouts on tablets, desktops, and ultra-wide screens.
- **🎨 Islamic Modern Aesthetic**: Deep emerald green (`#064e3b`), warm gold accents (`#d4af37`), glassmorphism cards, and subtle geometric patterns.
- **✨ Micro-Animations**:
  - **Morphing Copy Button**: Icon smoothly transitions from `Copy` to `Check` with celebratory particle burst and green glow.
  - **Spring Physics Voting**: Interactive "Works 👍" & "Expired ❌" buttons with bounce counters and local duplication prevention.
  - **Sliding Filter Tabs**: Smooth Framer Motion layout pill that slides between *All*, *Verified*, *Most Used*, and *Recent*.
  - **Interactive Search**: Dynamic search with live filter and animated clear button.
  - **Live Preview Submission**: As users type `NG-...`, a live preview card animates in real-time with automatic uppercase formatting.
- **🌐 Bilingual by Design**: Instant switcher between **English (LTR)** and **العربية (RTL)** with native font support (Amiri & Inter).
- **🚀 One-Tap Nusuk Deep Link**: Direct redirect button opening `https://services.nusuk.sa/app?p=27&id={CODE}`.
- **🔄 Realtime Synchronization**: Live updates when new keys are added using Supabase WebSockets.

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env.local`)
Create or edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dttwxygghtdxokcebwta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> [!NOTE]
> Even if you run without Supabase keys, the app automatically runs in interactive offline/demo mode with persistent local storage.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase SQL Schema

Paste this SQL into your **Supabase Dashboard ➔ SQL Editor**:

```sql
-- 1. Create table for challenge keys
CREATE TABLE IF NOT EXISTS challenge_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    upvotes INT DEFAULT 1,
    downvotes INT DEFAULT 0,
    copies_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for fast query sorting
CREATE INDEX IF NOT EXISTS idx_challenge_keys_active 
ON challenge_keys (is_active, upvotes DESC, created_at DESC);

-- 3. Enable Public Read & Insert Access (Row Level Security)
ALTER TABLE challenge_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active keys" 
ON challenge_keys FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public submit new keys" 
ON challenge_keys FOR INSERT WITH CHECK (code ~ '^NG-[A-Za-z0-9_-]+$');

CREATE POLICY "Allow voting updates" 
ON challenge_keys FOR UPDATE USING (true);

-- 4. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_keys;
```

---

## 🚀 Deploy to Vercel

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Nusuk Keys"
   git remote add origin https://github.com/YOUR_USERNAME/nusuk-keys.git
   git push -u origin main
   ```
2. Import the project in [Vercel](https://vercel.com/new).
3. Add the two environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**!
