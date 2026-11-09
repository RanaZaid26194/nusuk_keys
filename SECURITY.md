# 🛡️ Security Policy & Threat Model

At **Nusuk Keys (مفاتيح نسك)**, ensuring data integrity, preventing spam, and protecting user privacy are fundamental core principles.

---

## 1. Why the Supabase Anon Key is Safe to be Public

A common question in Jamstack and serverless architectures is whether exposing the `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the browser bundle is secure.

### The Short Answer:
**Yes, it is 100% safe by design.**

### The Technical Explanation:
In Supabase's architectural model:
1. **The Anon Key is an Identity, Not an Admin Secret**: The `anon` key only informs PostgreSQL that the incoming request originates from an unauthenticated public visitor. It carries the Postgres role `anon`.
2. **Postgres Row Level Security (RLS) is the Hard Boundary**: The client never executes arbitrary database operations. Every query passes through Postgres RLS policies:
   - **SELECT**: Restricted to `is_active = true`.
   - **INSERT**: Strictly gated with `WITH CHECK (code ~ '^NG-[A-Za-z0-9_-]+$')`. Any attempt to insert malicious payloads, extra columns, or invalid codes is rejected at the database engine level.
   - **DELETE**: Completely disabled for the `anon` role (no policy exists, defaulting to `DENY ALL`).
3. **The Service Role Key is Never Exposed**: The high-privilege `service_role` key (which bypasses RLS) is **never** included in client code, environment files, or repository commits.

---

## 2. Input Sanitization & Anti-Abuse Measures

To prevent spam, script injection, and duplicate flooding:

### 1. Format Strictness
- All submissions are constrained to the pattern: `^NG-[A-Za-z0-9_-]+$`.
- Character lengths are bounded between 5 and 50 characters.
- Non-alphanumeric characters (outside of `-` and `_`) are stripped immediately upon input change.

### 2. Client-Side Token Bucket Rate Limiting
- Submissions are metered using a client-side token bucket in `src/lib/security.ts`.
- Users must wait a minimum cooldown (15 seconds) between submissions to prevent rapid automated spamming.

### 3. Server Uniqueness Verification
- Before an insert is attempted, a lookup query checks whether the key code already exists in PostgreSQL.
- If a match is found, the submission is rejected with an informative error and a visual shake animation.

---

## 3. Reporting a Vulnerability

If you discover a potential security vulnerability within this repository, please **do not** open a public issue.

Instead, please report it privately:
- Contact: Create a private security advisory through the repository's GitHub Security tab, or reach out to the project maintainers.
- Response Time: We strive to acknowledge and assess reports within 24–48 hours.
