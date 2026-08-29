# PROJECT REPORT — `contact-me`

> Based on a full read of the project source, configs, schema, API, pages, services, and libs.
> Sections 4, 7, and 8 reflect the current state after the security-hardening, cleanup, and PWA-install-gate pass.
> No secrets, API keys, passwords, or `.env` values are included in this report.

---

## 1. PROJECT OVERVIEW

### 1.1 App Purpose

**"Contact Me" (ទំនាក់ទំនងមកខ្ញុំ)** is a **digital contact-card Progressive Web App (PWA)** — a mobile-first, Khmer-language ("KH/EN" toggle) personal link-in-bio page. A single owner registers an account, builds a profile (bilingual display name + bio, avatar), and manages a list of **contact methods** (Telegram, Messenger, Facebook, WhatsApp, Instagram, TikTok, YouTube, LINE, Viber, Gmail, Email, Phone, SMS, Website). Visitors open the public page and tap animated cards that open deep links (`tel:`, `mailto:`, `https://t.me/...`, `https://wa.me/...`, `https://m.me/...`, etc.).

> Note: the PWA manifest / Open Graph tags in `index.html` and `vite.config.ts` are currently branded for one specific deployment — **"វត្តវារីបាការាម(ស្នាយដួច)"** (a Buddhist pagoda), indicating the app was built for that client. The project was bootstrapped from a Google **AI Studio** template (`metadata.json`, `assets/.aistudio/`, `DISABLE_HMR` hooks).

### 1.2 Full Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript, React Router 7 (SPA, lazy-loaded admin routes), Tailwind CSS 4 (via `@tailwindcss/vite`), Motion (Framer Motion) animations, lucide-react + react-icons icon sets |
| **Backend** | Node.js + Express 4 (`server.ts` + `src/api.ts`), TypeScript executed via `tsx` in dev |
| **Database** | PostgreSQL via `pg` connection Pool + **Drizzle ORM** (schema-first; `drizzle-kit push` for sync — no migration files kept) |
| **Auth** | JWT (`jsonwebtoken`, 7-day expiry, Bearer header) + `bcryptjs` password hashing (10 salt rounds), token persisted in `localStorage` |
| **Build tooling** | Vite 6 (client SPA), esbuild (server bundled to CJS), `vite-plugin-pwa` (installable app, `autoUpdate` service worker) |
| **Deployment** | Single self-hosted Express process serving both `/api` and the built `dist/` SPA (target platform "Sabay Cloud" per code comments); alternative pure-static hosting documented in README (`public/_redirects` for Netlify/Cloudflare Pages) |
| **Package managers** | Both `bun.lock` and `package-lock.json` present (ambiguous) |

### 1.3 Role of Each package.json Dependency

**dependencies**

| Package | Version | Role |
|---|---|---|
| `react` | ^19.0.1 | UI framework (components, hooks, StrictMode) |
| `react-dom` | ^19.0.1 | React renderer, mounted in `src/main.tsx` |
| `react-router-dom` | ^7.18.2 | Client-side routing: `BrowserRouter`, nested admin routes, `Outlet`, guards via `<Navigate>` |
| `express` | ^4.21.2 | HTTP server: mounts the API router and, in production, serves the built SPA + fallback |
| `drizzle-orm` | ^0.45.2 | Type-safe SQL ORM; all queries in `src/api.ts` use it (`select/insert/update/delete`) |
| `pg` | ^8.23.0 | PostgreSQL driver (`Pool`) backing drizzle's `node-postgres` adapter |
| `bcryptjs` | ^3.0.3 | Password hashing/verification in register and login endpoints |
| `jsonwebtoken` | ^9.0.3 | JWT issuing (`sign`, 7d) and verification (`authenticate` middleware) |
| `dotenv` | ^17.4.2 | Loads `.env` for `DATABASE_URL` (in `src/db/index.ts` and `drizzle.config.ts`) |
| `lucide-react` | ^0.546.0 | UI/chrome icons in the admin panel and layouts |
| `react-icons` | ^5.7.0 | Brand icons (Telegram, WhatsApp, Facebook, …) mapped per contact-method type |
| `motion` | ^12.23.24 | Entrance/hover/tap/stagger animations on the public contact card |
| `@google/genai` | ^2.4.0 | **Unused** — Gemini SDK left over from the AI Studio template (declared in `metadata.json` as `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` but never imported) |
| `vite` | ^6.2.3 | **Misplaced** — build tool listed as a runtime dependency (also in devDependencies) |
| `@vitejs/plugin-react` | ^5.0.4 | **Misplaced** — Vite React plugin (belongs in devDependencies) |
| `@tailwindcss/vite` | ^4.1.14 | **Misplaced** — Tailwind v4 Vite plugin (belongs in devDependencies) |

**devDependencies**

| Package | Version | Role |
|---|---|---|
| `vite` | ^6.2.3 | Client bundler / dev server (HMR middleware mode inside Express in dev) |
| `vite-plugin-pwa` | ^1.3.0 | Generates web manifest + auto-update service worker |
| `tailwindcss` | ^4.1.14 | Utility-first CSS engine (v4, CSS-first `@theme` config in `index.css`) |
| `autoprefixer` | ^10.4.21 | Legacy leftover — largely redundant with Tailwind v4's vite plugin |
| `tsx` | ^4.21.0 | Runs `server.ts` TypeScript directly for `npm run dev` |
| `esbuild` | ^0.25.0 | Bundles the Express server to `dist/server.cjs` for production |
| `drizzle-kit` | ^0.31.10 | Schema synchronization (`npm run db:push`) |
| `typescript` | ~5.8.2 | Type checking (`npm run lint` = `tsc --noEmit`) |
| `@types/express` | ^4.17.21 | Express type definitions |
| `@types/bcryptjs` | ^2.4.6 | bcryptjs types |
| `@types/jsonwebtoken` | ^9.0.10 | jsonwebtoken types |
| `@types/node` | ^22.14.0 | Node types |
| `@types/pg` | ^8.23.1 | pg types |

---

## 2. FILE STRUCTURE

### 2.1 Complete Directory Tree

```
d:\Projects\Contact\
└── contact-me\                        # ← the entire app lives here
    ├── app\
    │   └── applet\
    │       └── server.ts
    ├── assets\
    │   └── .aistudio\
    │       └── .gitignore
    ├── public\
    │   ├── favicon.ico
    │   ├── favicon.png
    │   ├── pwa-192x192.png
    │   ├── pwa-512x512-maskable.png
    │   ├── pwa-512x512.png
    │   ├── pwa-icon.svg
    │   └── _redirects
    ├── src\
    │   ├── components\
    │   │   └── layout\
    │   │       ├── AdminLayout.tsx
    │   │       └── AuthLayout.tsx
    │   ├── db\
    │   │   ├── index.ts
    │   │   └── schema.ts
    │   ├── lib\
    │   │   ├── auth.tsx
    │   │   ├── iconMapping.tsx
    │   │   └── links.ts
    │   ├── pages\
    │   │   ├── admin\
    │   │   │   ├── AdminPage.tsx
    │   │   │   ├── ContactMethodsPage.tsx
    │   │   │   ├── LoginPage.tsx
    │   │   │   ├── ProfilePage.tsx
    │   │   │   └── SettingsPage.tsx
    │   │   └── public\
    │   │       └── PublicPage.tsx
    │   ├── routes\
    │   │   └── index.tsx
    │   ├── services\
    │   │   ├── contactMethodService.ts
    │   │   └── profileService.ts
    │   ├── types\
    │   │   └── database.types.ts
    │   ├── api.ts
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── .env.example
    ├── .gitignore
    ├── bun.lock
    ├── drizzle.config.ts
    ├── index.html
    ├── metadata.json
    ├── package-lock.json
    ├── package.json
    ├── PROJECT_REPORT.md              # (this file)
    ├── README.md
    ├── server.ts
    ├── tsconfig.json
    └── vite.config.ts
```

Not present on disk at analysis time: `node_modules/` (dependencies not installed), `dist/` (never built), `drizzle/` (no migration files — schema is pushed directly), `.env` (gitignored and absent).

### 2.2 Role of Each Important File (one line per file)

**Root / config**

| File | Role |
|---|---|
| `server.ts` | **Main server** — Express: mounts `/api` router, dev mode = Vite middleware, prod mode = static `dist/` + SPA fallback `app.get('*') → index.html`; port 3000 hardcoded |
| `app/applet/server.ts` | **Dead code** — stale duplicate Express stub with only a health endpoint, no API/DB routes; if run instead of root `server.ts` the app breaks |
| `vite.config.ts` | Vite config: react + tailwind + VitePWA plugins, PWA manifest (pagoda branding), `@ → ./src` alias, `DISABLE_HMR` toggles for AI Studio agent edits |
| `drizzle.config.ts` | drizzle-kit config: schema at `./src/db/schema.ts`, output `./drizzle`, postgres dialect, credentials from `DATABASE_URL` |
| `tsconfig.json` | ES2022, bundler module resolution, `jsx: react-jsx`, `@/* → ./src/*` path alias, `noEmit` (type-check only) |
| `index.html` | SPA entry: `lang="km"`, viewport-fit=cover, Khmer fonts (Battambang, Koulen, Rajdhani), static OG/Twitter meta tags |
| `package.json` | Scripts (`dev`/`build`/`preview`/`clean`/`lint`/`start`/`db:push`) and dependencies (see §1.3) |
| `metadata.json` | AI Studio project metadata (name, description, Gemini capability flag) |
| `.env.example` | Template listing `VITE_FIREBASE_*` vars — **stale**: no Firebase code exists, and required `DATABASE_URL`/`JWT_SECRET` are missing from it |
| `.gitignore` | Ignores `node_modules/`, `build/`, `dist/`, `coverage/`, logs, `.DS_Store`, `.env*` (keeps `.env.example`) |
| `README.md` | Documents SPA-fallback hosting setup for Netlify/Vercel/Firebase/Apache/Nginx and the static-OG-tag strategy |
| `bun.lock` / `package-lock.json` | Lockfiles for two different package managers (both kept — ambiguous) |
| `public/_redirects` | Netlify/Cloudflare Pages SPA fallback rule: `/* /index.html 200` |

**public/ assets**

| File | Role |
|---|---|
| `public/favicon.ico` / `favicon.png` | App icons (PNG also used as PWA icon and OG image) |
| `public/pwa-192x192.png`, `pwa-512x512.png`, `pwa-512x512-maskable.png` | PWA manifest icons (incl. adaptive/maskable variant) |
| `public/pwa-icon.svg` | SVG icon — not referenced by the manifest |

**src/ core**

| File | Role |
|---|---|
| `src/main.tsx` | Entry point: `StrictMode → AuthProvider → App`, imports `index.css` |
| `src/App.tsx` | Trivial wrapper that renders `<AppRoutes/>` |
| `src/routes/index.tsx` | Route table: eager `PublicPage`, lazy-loaded admin pages, auth guards, `/` and `*` redirects to `/contact` |
| `src/api.ts` | **The entire backend API** — Express `Router` with JWT `authenticate` middleware, DB↔DTO mappers, all auth/profile/contact-method endpoints (detailed in §4) |
| `src/index.css` | Tailwind v4 CSS-first theme (Battambang default font), `fade-in-up` keyframes, global scrollbar hiding, `delay-150` utility |

**src/db/**

| File | Role |
|---|---|
| `src/db/index.ts` | Creates a `pg` `Pool` from `DATABASE_URL` and exports the drizzle client `db` (with schema) |
| `src/db/schema.ts` | Drizzle schema: `users`, `profiles`, `contact_methods` tables (detailed in §3) |

**src/lib/**

| File | Role |
|---|---|
| `src/lib/auth.tsx` | `AuthProvider`/`useAuth` context — token in `localStorage`, boot-time validation via `GET /api/auth/me`, `setAuth`, `signOut` |
| `src/lib/iconMapping.tsx` | Single source of truth for 14 contact-method types: `ContactMethodType` union, per-type icon + brand color, `getIconForType`/`getColorForType` (fallback: gray `Link` icon) |
| `src/lib/links.ts` | `getActionUrl(type, value)` — normalizes raw values into `tel:`/`mailto:`/`t.me`/`wa.me`/`m.me`/`facebook.com`/`https://` URLs; returns `"#"` on failure |

**src/services/**

| File | Role |
|---|---|
| `src/services/profileService.ts` | `ProfileService` static class: public/me profile fetch + update, `uploadAvatar` (client-side FileReader → base64 data URL — no real server upload) |
| `src/services/contactMethodService.ts` | `ContactMethodService` static class: public/me reads, CRUD, `toggleContactMethod`, `reorderContactMethods`; attaches Bearer token from localStorage |

**src/pages/**

| File | Role |
|---|---|
| `src/pages/public/PublicPage.tsx` | Public contact card: KH/EN language switcher, avatar/name/bio header, brand-colored animated method cards (Motion), skeleton loading, error + retry state, per-type descriptions/localized labels |
| `src/pages/admin/AdminPage.tsx` | Dashboard: profile-completeness status card, method totals (total/active), static security blurb, quick links |
| `src/pages/admin/LoginPage.tsx` | Login/register toggle form; raw `fetch` to `/api/auth/login` or `/api/auth/register`, stores token via `setAuth` |
| `src/pages/admin/ProfilePage.tsx` | Profile editor: KH/EN display names + bios, avatar upload (≤5 MB, PNG/JPG/WebP, client-side only) |
| `src/pages/admin/ContactMethodsPage.tsx` | Full method management: add/edit modal (type-driven placeholders + auto Khmer labels), enable toggle (optimistic), delete confirm modal, ↑/↓ reorder (optimistic with rollback) |
| `src/pages/admin/SettingsPage.tsx` | Account email display + change-password form — **UI-only stub** (backend not implemented, submit shows "not enabled" message) |

**src/components/, src/types/**

| File | Role |
|---|---|
| `src/components/layout/AdminLayout.tsx` | Sidebar shell for `/admin/*`: nav links (Khmer labels), "view public page" link, sign-out button, `<Outlet/>` for child pages |
| `src/components/layout/AuthLayout.tsx` | `ProtectedRoute` (redirects to `/admin/login` when unauthenticated) and `PublicOnlyRoute` (redirects to `/admin` when authenticated), spinner while loading |
| `src/types/database.types.ts` | Frontend DTO types (`Profile`, `ContactMethod`) in Supabase-style snake_case — the shape the API returns (and pages consume) |
| `assets/.aistudio/.gitignore` | AI Studio marker directory; ignores all of its own contents (`*`) |

---

## 3. DATABASE SCHEMA

Source: `src/db/schema.ts` — PostgreSQL, Drizzle ORM (`pgTable`), applied via `drizzle-kit push` (no migration files kept, no `relations()` declarations — all queries are flat selects/joins by `userId`).

### 3.1 Table: `users`

| TS Property | SQL Column | Type | Constraints | Notes |
|---|---|---|---|---|
| `id` | `id` | `uuid` | PRIMARY KEY, `defaultRandom()` | |
| `email` | `email` | `text` | NOT NULL, **UNIQUE** | login identifier |
| `passwordHash` | `password_hash` | `text` | nullable | bcrypt hash; null ⇒ password-less account (login rejects it) |
| `createdAt` | `created_at` | `timestamp` | NOT NULL, default `now()` | |

### 3.2 Table: `profiles`

| TS Property | SQL Column | Type | Constraints | Notes |
|---|---|---|---|---|
| `id` | `id` | `uuid` | PRIMARY KEY, `defaultRandom()` | |
| `userId` | `user_id` | `uuid` | NOT NULL, **UNIQUE**, FK → `users.id` **ON DELETE CASCADE** | enforced 1:1 with `users` via the unique constraint |
| `displayName` | `display_name` | `text` | nullable | Khmer display name (default at registration: email prefix before `@`) |
| `displayNameEn` | `display_name_en` | `text` | nullable | English display name |
| `bio` | `bio` | `text` | nullable | Khmer bio |
| `bioEn` | `bio_en` | `text` | nullable | English bio |
| `avatarUrl` | `avatar_url` | `text` | nullable | currently stores base64 data URLs (no file storage yet) |
| `coverUrl` | `cover_url` | `text` | nullable | accepted by API; no UI field yet |
| `updatedAt` | `updated_at` | `timestamp` | NOT NULL, default `now()` | no DB auto-update trigger; set manually in code — also used as a proxy for "most recently updated profile" in the public-default lookup |

### 3.3 Table: `contact_methods`

| TS Property | SQL Column | Type | Constraints | Notes |
|---|---|---|---|---|
| `id` | `id` | `uuid` | PRIMARY KEY, `defaultRandom()` | |
| `userId` | `user_id` | `uuid` | NOT NULL, FK → `users.id` **ON DELETE CASCADE** | owner; not unique ⇒ 1:N |
| `type` | `type` | `text` | NOT NULL | one of the 14 types defined in `iconMapping.tsx` (`telegram`, `messenger`, `facebook`, `whatsapp`, `instagram`, `tiktok`, `youtube`, `line`, `viber`, `gmail`, `email`, `phone`, `sms`, `website`; `other` exists in the TS union only) — no DB enum/check constraint |
| `value` | `value` | `text` | NOT NULL | raw handle / number / URL, normalized client-side by `getActionUrl` at render time |
| `title` | `title` | `text` | NOT NULL | display label (mapped to `label` in the API DTO) |
| `enabled` | `enabled` | `boolean` | NOT NULL, default `true` | only enabled rows are exposed publicly |
| `order` | `order` | `text` | NOT NULL | ⚠️ **sort order stored as TEXT**; every read parses it with `parseInt` (in-memory sort) |
| `createdAt` | `created_at` | `timestamp` | NOT NULL, default `now()` | |
| `updatedAt` | `updated_at` | `timestamp` | NOT NULL, default `now()` | set manually on every mutation |

### 3.4 Relations

- `users 1 ─── 1 profiles` — via `profiles.userId` (UNIQUE + ON DELETE CASCADE).
- `users 1 ─── N contact_methods` — via `contactMethods.userId` (ON DELETE CASCADE).
- **No Drizzle `relations()` are defined** and no SQL joins are used anywhere; each endpoint queries a single table filtered by `userId`.

### 3.5 Schema-level gaps

- No DB-level enum/check constraint on `contact_methods.type`.
- No index on `contact_methods.user_id` (FK lookups unindexed).
- `order` should be an integer with an index, not text.
- No `created_at` on `profiles` (API fakes it with `updatedAt`).
- Migration history is not versioned (`drizzle-kit push` only).

---

## 4. API ENDPOINTS

All endpoints live in `src/api.ts` as an Express `Router` mounted at `/api` by `server.ts`. **Current security state: registration disabled (403), all contact-method mutations ownership-scoped (IDOR fixed), `JWT_SECRET` strictly required at startup, public "default" profile fallback gated behind `DEFAULT_PROFILE_USER_ID`.** Responses are wrapped objects (`{ token, user }`, `{ profile }`, `{ contactMethods }`, `{ contactMethod }`, `{ success }`) with DB→DTO mapping done server-side by `mapProfile()`/`mapContactMethod()` (camelCase DB → snake_case DTO). Errors return `{ error: string }` with status 400/401/404/500.

**Auth mechanism:** the `authenticate` middleware reads `Authorization: Bearer <jwt>`, verifies it with `JWT_SECRET`, attaches `{ userId, email }` to `req.user`; returns 401 on missing header or invalid/expired token. Tokens expire after **7 days**.

| # | Method | Path | Auth | Purpose |
|---|---|---|---|---|
| 1 | GET | `/api/health` | ❌ Public | Liveness probe → `{ status: "ok", message: "Backend is ready!" }` (declared in `server.ts`; the `applet/server.ts` duplicate has its own variant) |
| 2 | POST | `/api/auth/register` | ❌ Public | **DISABLED (single-admin app):** immediately returns **403** `{ error: 'Registration is disabled' }`. Route is kept so old clients get a clear error; the original registration logic (bcrypt hashing, user+profile creation) is preserved commented-out inside the handler with the note `// Registration disabled: single-admin app` |
| 3 | POST | `/api/auth/login` | ❌ Public | Login: verifies bcrypt password; returns generic `"Invalid credentials"` (400) for unknown email, missing hash, or wrong password; returns JWT (7d) + `{ id, email }` |
| 4 | GET | `/api/auth/me` | ✅ Bearer JWT | Returns current user `{ id, email }` resolved from the token's `userId`; 404 if the user no longer exists |
| 5 | GET | `/api/profiles/public/:id` | ❌ Public | Fetch a profile by user UUID (404 if not found). **Special case (now guarded):** for `:id` = `"default"`/`"undefined"`, the most-recently-updated profile is returned **only if** `DEFAULT_PROFILE_USER_ID` is set and matches it — or, when that env var is unset, only if exactly **one** profile exists in the table. Otherwise: 404 `{ error: 'Not found' }` |
| 6 | GET | `/api/profiles/me` | ✅ Bearer JWT | Returns the authenticated user's own profile as DTO (`theme_settings` is always `null`; `created_at` is faked with `updatedAt`) |
| 7 | PUT | `/api/profiles/me` | ✅ Bearer JWT | Upsert own profile from body fields `display_name`, `display_name_en`, `bio`, `bio_en`, `avatar_url`, `cover_url`; sets `updatedAt = now()`; inserts a new row if none exists. No field validation, no length limits |
| 8 | GET | `/api/contact-methods/public/:id` | ❌ Public | All **enabled** methods for user `:id`, filtered in memory and sorted ascending by `parseInt(order)` |
| 9 | GET | `/api/contact-methods/me` | ✅ Bearer JWT | **All** (including disabled) methods for the authenticated user, sorted by `parseInt(order)` |
| 10 | POST | `/api/contact-methods` | ✅ Bearer JWT | Create a method for the authenticated user. Body: `type`, `value`, `label`, `enabled`, `sort_order` (stored in the `order` TEXT column via `sort_order?.toString() \|\| '0'`). Returns created DTO |
| 11 | PUT | `/api/contact-methods/:id` | ✅ Bearer JWT | Partial update: only provided fields are applied (`type`, `value`, `label` → `title`, `enabled`, `sort_order` → `order`); bumps `updatedAt`. **Ownership enforced (IDOR fix):** the `where` clause also filters by `eq(contactMethods.userId, req.user.userId)`; returns **404** if no row matches (no existence leak) |
| 12 | DELETE | `/api/contact-methods/:id` | ✅ Bearer JWT | Deletes the method by `id` **owned by the authenticated user** (ownership filter in the `where` clause + `.returning()`); returns **404** if nothing was deleted, otherwise `{ success: true }` |
| 13 | POST | `/api/contact-methods/reorder` | ✅ Bearer JWT | Body `{ orderedIds: string[] }` — loops through the array, setting `order = i.toString()` per id; each UPDATE is scoped to the authenticated user (`and(eq(id), eq(userId))`). ⚠️ Still not wrapped in a transaction (known issue, §8) |

### 4.1 Endpoint inventory summary

- **Total:** 13 endpoints (1 health, 3 auth, 3 profiles, 6 contact-methods).
- **Public (no auth):** 5 — health, register (**always 403 — disabled**), login, public profile (**"default" fallback guarded**), public contact methods.
- **Authenticated (Bearer JWT):** 8 — me, my profile (GET/PUT), my methods (GET), create/update/delete/reorder methods (**update/delete/reorder are ownership-scoped as of the IDOR fix**).
- **Not implemented anywhere:** password change, email change, account deletion, single-method GET, logout/revocation, pagination, rate limiting.

### 4.2 DTO mapping (DB ↔ API)

| DB (`profiles`) | API DTO (`Profile`) |
|---|---|
| `userId` | `id` |
| `displayName` / `displayNameEn` | `display_name` / `display_name_en` |
| `bio` / `bioEn` | `bio` / `bio_en` |
| `avatarUrl` / `coverUrl` | `avatar_url` / `cover_url` |
| — (always null) | `theme_settings` |
| `updatedAt` | `created_at` **and** `updated_at` (fake) |

| DB (`contact_methods`) | API DTO (`ContactMethod`) |
|---|---|
| `id` | `id` |
| `userId` | `profile_id` |
| `type` | `type` |
| `title` | `label` |
| `value` | `value` |
| — (always null) | `icon` |
| `enabled` | `enabled` |
| `order` (TEXT) | `sort_order` (`parseInt(order) \|\| 0`) |
| `createdAt` / `updatedAt` | `created_at` / `updated_at` |

---

## 5. FRONTEND ROUTES & COMPONENTS

### 5.1 Routes (`src/routes/index.tsx`)

| Path | Component | Import | Guard |
|---|---|---|---|
| `/` | `<Navigate to="/contact" replace>` | — | — |
| `/contact/:id?` | `PublicPage` | eager | Public (no `:id` → public-profile endpoint falls back to "most recent profile") |
| `/admin/login` | `LoginPage` | lazy | `PublicOnlyRoute` — redirects to `/admin` if already logged in; spinner while `loading` |
| `/admin` | `AdminLayout` (index → `AdminPage`) | lazy | `ProtectedRoute` — redirects to `/admin/login` when unauthenticated |
| `/admin/profile` | `ProfilePage` | lazy | `ProtectedRoute` (nested under layout) |
| `/admin/methods` | `ContactMethodsPage` | lazy | `ProtectedRoute` (nested under layout) |
| `/admin/settings` | `SettingsPage` | lazy | `ProtectedRoute` (nested under layout) |
| `*` (catch-all) | `<Navigate to="/contact" replace>` | — | — |

All routes live in one `<BrowserRouter>` wrapped in `<Suspense fallback={<AdminLoadingFallback/>}>` (a spinner). Admin pages are code-split via `React.lazy`; `PublicPage` is bundled eagerly because it is the landing view.

### 5.2 Component relationships

```
main.tsx  (AuthProvider wraps the whole tree)
└── AppRoutes (BrowserRouter + Suspense)
    ├── PublicPage ── lib/links.getActionUrl + lib/iconMapping
    ├── AuthLayout guards
    │   ├── PublicOnlyRoute → LoginPage ──(setAuth)──> AuthContext
    │   └── ProtectedRoute → AdminLayout (sidebar nav + Outlet)
    │       ├── AdminPage ── ProfileService.getOwnerProfile
    │       │              └─ ContactMethodService.getOwnerContactMethods (stats)
    │       ├── ProfilePage ── ProfileService (get / update / uploadAvatar)
    │       ├── ContactMethodsPage ── ContactMethodService (CRUD, toggle, reorder;
    │       │                          optimistic updates with refetch rollback)
    │       └── SettingsPage ── (display only; password change is a stub)
    └── Redirects: "/" and "*" → /contact
```

- **`AdminLayout`** is the shared shell for all admin pages: a responsive sidebar (top bar on mobile) with four nav items (Dashboard, Profile, Methods, Settings — Khmer labels), a "view public page" external link (`/contact/<user.id>`), and a sign-out button; page content renders through `<Outlet/>`.
- **`AuthLayout.tsx`** exports the two guard components used as layout routes; they consume `useAuth()` and either render `<Outlet/>` or `<Navigate>`.
- **`PublicPage`** is fully standalone (no auth context needed) and is the only page using the Motion library and the KH/EN switcher.

### 5.3 State management approach

- **No external state library** (no Redux / Zustand / React Query / SWR). No global server-data cache — each page fetches its own data on mount (`useEffect` + `useState`), so the Dashboard refetches profile + methods and the Methods page refetches them again.
- **Global state = one `AuthContext`** (`src/lib/auth.tsx`): `{ user, token, loading, setAuth, signOut }`.
  - Token persisted in `localStorage("token")`.
  - On boot: if a stored token exists, it is validated against `GET /api/auth/me`; invalid/failed ⇒ token removed.
  - `signOut` clears client state only (no server-side revocation).
- **Optimistic updates with rollback** in `ContactMethodsPage`: the enable-toggle and ↑/↓ reorder mutate local state first, then call the API; on failure they call `loadMethods()` to resync.
- **UI-only local state** everywhere else: modal open/editing flags, delete-confirmation id, form data, saving/deleting/loading flags, success/error banners, and `PublicPage`'s `lang: 'kh' | 'en'` toggle.

---

## 6. SERVICES & LIBS

### 6.1 `src/services/profileService.ts` — `ProfileService` (static class)

| Method | Calls | Behavior |
|---|---|---|
| `getPublicProfile(profileId?)` | GET `/api/profiles/public/:id` | No auth; returns `null` on any failure (warn-logged) |
| `getOwnerProfile()` | GET `/api/profiles/me` | Bearer header; throws on failure |
| `updateOwnerProfile(updates)` | PUT `/api/profiles/me` | Sends partial profile DTO; throws on failure |
| `uploadAvatar(file)` | *(none — client-only)* | ⚠️ Reads the file with `FileReader` and resolves a **base64 data URL**; no real upload/S3/bucket (comment in code admits this). Result is stored in `avatar_url` — the reason the server allows a 10 MB JSON body |

### 6.2 `src/services/contactMethodService.ts` — `ContactMethodService` (static class)

| Method | Calls | Behavior |
|---|---|---|
| `getPublicContactMethods(profileId)` | GET `/api/contact-methods/public/:id` | No auth; returns `[]` on failure |
| `getOwnerContactMethods()` | GET `/api/contact-methods/me` | Bearer header; includes disabled methods |
| `createContactMethod(method)` | POST `/api/contact-methods` | Caller supplies `sort_order` (page appends `methods.length`) |
| `updateContactMethod(id, updates)` | PUT `/api/contact-methods/:id` | Partial update |
| `deleteContactMethod(id)` | DELETE `/api/contact-methods/:id` | Throws on failure |
| `toggleContactMethod(id, enabled)` | → `updateContactMethod` | Sugar over partial update |
| `reorderContactMethods(orderedIds)` | POST `/api/contact-methods/reorder` | Sends `{ orderedIds }` |

Both services **duplicate identical helper code** (`getToken()` / `getHeaders()` reading `localStorage("token")` and building `Authorization` + `Content-Type` headers). There is no shared HTTP client, no timeout handling, and no 401-interceptor (an expired token never triggers auto-logout).

### 6.3 `src/lib/auth.tsx` — auth context

`AuthProvider` (mounted in `main.tsx`) + `useAuth()` hook. Holds `user`, `token`, `loading`; `setAuth(token, user)` persists to localStorage; `signOut()` clears it. Boot-time session restoration via `/api/auth/me`. Consumers: route guards, `AdminLayout`, `LoginPage`, `SettingsPage`.

### 6.4 `src/lib/iconMapping.tsx` — type/icon/color registry

- `ContactMethodType` union of 15 values (`telegram`, `messenger`, `facebook`, `whatsapp`, `instagram`, `tiktok`, `youtube`, `line`, `viber`, `gmail`, `email`, `phone`, `sms`, `website`, `other`).
- `contactMethodTypes: IconDefinition[]` — 14 entries with brand icon (react-icons `Si*` / `Md*`) and hex brand color (e.g. Telegram `#26A5E4`, WhatsApp `#25D366`). ⚠️ `other` has no entry, so it always renders the fallback.
- `getIconForType(type)` / `getColorForType(type)` — case-insensitive lookup; fallback is lucide's `Link` icon / gray `#6b7280`.
- Used by both `PublicPage` and `ContactMethodsPage`; the admin page also derives default Khmer labels from it.

### 6.5 `src/lib/links.ts` — URL builder

`getActionUrl(type, value)` — trims the value and normalizes per type:
- `phone` → `tel:` keeping only digits and `+`.
- `email` → `mailto:`.
- `whatsapp` → existing `wa.me` / `api.whatsapp.com` URLs upgraded to https, else digits-only `https://wa.me/<n>`.
- `telegram` → upgrades/normalizes `t.me` URLs, strips leading `@`, else `https://t.me/<user>`.
- `messenger` → normalizes `m.me/...`, else `https://m.me/<value>`.
- `facebook` → keeps absolute URLs (upgraded to https), wraps bare handles in `https://www.facebook.com/<handle>`.
- `website` / default → prefixes `https://` when missing.
- Returns `"#"` when the value is empty or an error is thrown (errors are console-logged).

### 6.6 `src/types/database.types.ts` — shared DTO types

`Profile` and `ContactMethod` interfaces in snake_case, mirroring exactly what the API returns (including nullable `theme_settings`/`icon`), consumed by pages and services.

### 6.7 How the frontend communicates with the backend

- **Relative-URL `fetch` calls** (`fetch('/api/…')`) — same-origin only; the Express process serves both the API and the SPA (dev: Vite middleware mode; prod: static `dist/`). No CORS configuration exists, so splitting frontend and API onto different origins would break.
- **Auth** is attached manually per request from `localStorage("token")` as `Authorization: Bearer <token>` (the two services) — except `LoginPage`, which does its own raw `fetch`.
- **Error handling convention:** public reads swallow errors and render fallback UI (empty state / error card with retry button); owner reads/writes throw, and pages surface Khmer error messages or `alert()` on failure.
- **No API layer features:** no retries, no request cancellation (page unmounts can set state after fetch resolves), no caching/invalidation, no optimistic-update queue beyond the two in-page cases.

---

## 7. ENVIRONMENT & DEPLOYMENT

### 7.1 Environment Variables (NAMES ONLY — no values)

| Variable | Used by | Required? | Status |
|---|---|---|---|
| `DATABASE_URL` | `src/db/index.ts` (pg `Pool`), `drizzle.config.ts` | **Yes — required** (PostgreSQL connection string) | Listed in `.env.example` |
| `JWT_SECRET` | `src/api.ts` | **Yes — strictly required** (module-load guard in `src/api.ts`: the server throws `'JWT_SECRET environment variable is required'` at startup if unset — hardcoded fallback removed) | Listed in `.env.example` |
| `NODE_ENV` | `server.ts` | Yes in production (`production` ⇒ serve `dist/` instead of Vite middleware) | |
| `PORT` | `server.ts` | Optional | Now supported: `const port = Number(process.env.PORT) || 3000;` — the actual port is logged at startup |
| `DEFAULT_PROFILE_USER_ID` | `src/api.ts` | Optional | Designates which user's profile the public "default" fallback may expose; when unset, the fallback only works if exactly one profile exists |
| `DISABLE_HMR` | `vite.config.ts` | Optional | When `'true'`, disables HMR + file watching (AI Studio agent-edit mode) |

`.env.example` has been rewritten to contain exactly the five variables above (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`, `DEFAULT_PROFILE_USER_ID`) — the six stale `VITE_FIREBASE_*` entries were removed (no Firebase code exists in the project). `.gitignore` correctly excludes `.env*` (keeping `.env.example`). **No `.env` file exists** in the workspace — the backend will refuse to start until `JWT_SECRET` and `DATABASE_URL` are provided.

### 7.2 npm Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx server.ts` | Single process: Express API + Vite dev middleware (HMR) on port 3000 |
| `build` | `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs` | Client bundle → `dist/`; server bundled → `dist/server.cjs` (node_modules kept external ⇒ host must run `npm install`) |
| `preview` | `vite preview` | Static preview of the client build only (no API) |
| `start` | `node dist/server.cjs` | Production: one Express process serving `/api/*`, static `dist/`, and SPA fallback (`app.get('*')` → `index.html`) |
| `lint` | `tsc --noEmit` | Type-check only (no ESLint/Prettier configured) |
| `db:push` | `drizzle-kit push` | Push schema directly to Postgres (no migration files kept) |
| `clean` | `rm -rf dist` | POSIX-only command — will not run in Windows CMD |

### 7.3 Deployment Process & Targets

1. **Primary target — self-hosted Node ("Sabay Cloud" per code comments):**
   - Provision PostgreSQL; set `DATABASE_URL` and `JWT_SECRET` (**both strictly required — the server throws at startup without them**), plus `NODE_ENV=production`, optional `PORT` and `DEFAULT_PROFILE_USER_ID`.
   - `npm install` (npm is the authoritative package manager — `bun.lock` was removed) → `npm run db:push` (create tables) → `npm run build` → `npm start`.
   - The single Express process serves the API and the SPA; binds to `0.0.0.0` on `PORT` (default 3000, logged at startup).
2. **Alternative — pure static SPA hosting** (documented in `README.md` + `public/_redirects`): Netlify/Cloudflare Pages (`/* /index.html 200`), Vercel rewrites, Firebase Hosting rewrites, Apache `FallbackResource`, Nginx `try_files`. ⚠️ This path leaves `/api` without a backend — a separate API host would be required (and CORS does not exist).
3. **PWA:** `vite-plugin-pwa` (`registerType: 'autoUpdate'`) generates the manifest + service worker in every client build; the service worker is registered via `registerSW({ immediate: true })` in `src/main.tsx`. Manifest icons: `pwa-192x192.png`, `pwa-512x512.png`, `pwa-512x512-maskable.png` (favicon.png removed from the manifest). iOS meta tags (apple-touch-icon, `apple-mobile-web-app-*`) added to `index.html`. The `InstallGate` component (`src/components/Install.tsx`) forces mobile visitors to install before using the app.
4. **SEO/social:** only static Open Graph/Twitter tags in `index.html`; dynamic per-profile OG metadata is explicitly deferred (see README).
5. **Migrations:** none kept — schema changes go straight to the DB via `drizzle-kit push`.
6. **First admin:** registration is disabled (single-admin app) — the initial admin account must be seeded directly into the `users`/`profiles` tables (bcrypt hash, 10 rounds), e.g. via a one-off script.

---

## 8. CURRENT STATE & ISSUES

### 8.1 Completed & Working Features

- **Full auth loop:** register (auto-creates a profile seeded with the email prefix), login, JWT persistence in `localStorage`, boot-time token validation via `/api/auth/me`, route guards (`ProtectedRoute` / `PublicOnlyRoute`), client-side sign-out.
- **Profile editing:** bilingual (KH/EN) display names and bios, avatar picking with client-side validation (≤5 MB, PNG/JPG/WebP only).
- **Contact-method management (complete):** create with 14 typed kinds (per-type input placeholders, auto-generated Khmer labels), edit in a modal, delete with a confirmation modal, enable/disable toggle with optimistic update + rollback, manual ↑/↓ reorder with optimistic persistence.
- **Public contact card:** skeleton loading state, error state with retry, KH/EN language switcher, brand-colored animated cards (Motion stagger/spring), per-type descriptions and localized labels, correct deep links via `getActionUrl`, safe-area-aware mobile layout.
- **PWA:** manifest, icons (incl. maskable), auto-update service worker; SPA fallback for static hosts; production Express serves SPA + API from one process.
- **API DTO layer:** server-side `mapProfile`/`mapContactMethod` keep the camelCase DB schema and snake_case frontend types in sync.

**Recently completed (security-hardening, cleanup & PWA pass):**
- **Public registration disabled** — `POST /api/auth/register` returns 403 `{ error: 'Registration is disabled' }`; original logic preserved commented-out (single-admin app).
- **IDOR fixed** — `PUT/DELETE /api/contact-methods/:id` and `/reorder` are now scoped to the authenticated user and return 404 on no match.
- **`JWT_SECRET` strictly required** — hardcoded fallback removed; server throws `'JWT_SECRET environment variable is required'` at startup when missing.
- **Public "default" profile guarded** — gated behind `DEFAULT_PROFILE_USER_ID` (or the single-profile rule).
- **InstallGate PWA gate** (`src/components/Install.tsx`) — mobile visitors must install before using the app: Android `beforeinstallprompt` flow with "🚀 ដំឡើងឥឡូវនេះ" button, iOS Safari numbered instructions, in-app-browser detection, `?gate=off` test bypass; wrapped around the router inside `AuthProvider`.
- **Service worker registration** via `registerSW({ immediate: true })` in `src/main.tsx` (+ `src/vite-env.d.ts` references); iOS PWA meta tags added to `index.html`; manifest icons fixed (favicon.png removed, `purpose: 'maskable'`).
- **Dead code & dependency cleanup** — `app/applet/` and `bun.lock` deleted; `@google/genai` removed; `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite` moved to devDependencies; `.env.example` rewritten (Firebase vars removed); `PORT` now configurable and logged.
- **TypeScript clean** — all 4 pre-existing `tsc` errors fixed; `npm run lint` passes with zero errors and `npm run build` succeeds (PWA `dist/sw.js` + `dist/server.cjs` generated).

### 8.2 In-Progress / Stubs

- **Avatar upload to real storage** — `ProfileService.uploadAvatar` returns a base64 data URL; no S3/bucket integration (admitted in code comment). Avatars live as multi-MB text rows in Postgres, which is why the JSON body limit is 10 MB.
- **Change password** — `SettingsPage` form is pure UI; the submit handler short-circuits with "not enabled" and **no backend endpoint exists**.
- **`cover_url`** — column + API field exist, but no UI to set or display a cover image.
- **`theme_settings`** — always `null` in the API mapping; no theming feature.
- **Dynamic Open Graph previews** — intentionally deferred (README); static tags only.
- **`@google/genai`** — Gemini capability declared in `metadata.json` but never implemented.

### 8.3 Missing Features

- Server-side input validation: no email format check, no password policy/min-length on register, no length limits on profile/method fields.
- No ESLint/Prettier ("lint" is only `tsc --noEmit`); no tests of any kind; no CI.
- No rate limiting, no security headers (`helmet`), no CORS config, no request logging, no graceful shutdown, no health-check beyond the basic route.
- No migration history/versioning (`drizzle-kit push` only), no seed script.
- Server port and JWT expiry hardcoded; no config layer.
- No pagination anywhere; no search/filter in the admin method list.
- Admin panel UI is Khmer-only (the KH/EN toggle exists only on the public page).

### 8.4 Known Bugs & Code Smells (verified in code)

1. ~~Duplicate/conflicting server files~~ — **RESOLVED**: the stale `app/applet/server.ts` (and the `app/` folder) has been deleted; `server.ts` is the only server entry.
2. **`/api/health` declared after the `/api` router mount** in `server.ts` — it only works because no `/api/health` route exists inside the router; fragile ordering. (The duplicate server file that also defined a health route was deleted.)
3. **`order` stored as TEXT** — sorting relies on `parseInt` at every read; a non-numeric value silently becomes `0` (`parseInt(order) || 0` in the mapper) and can scramble ordering. Should be an integer column with an index.
4. **Reorder is not transactional** — `/contact-methods/reorder` issues N sequential UPDATEs; a mid-loop failure leaves rows with duplicate/intermediate order values.
5. **Global 10 MB JSON body limit** (`express.json({ limit: "10mb" })`) applies to *all* endpoints — a DoS-friendly workaround for base64 avatars.
6. ~~Dependency hygiene~~ — **RESOLVED**: `@google/genai` removed from dependencies; `vite`, `@vitejs/plugin-react`, and `@tailwindcss/vite` moved to devDependencies. (`autoprefixer` is still redundant with Tailwind v4.)
7. ~~Two lockfiles~~ — **RESOLVED**: `bun.lock` deleted; `package-lock.json` (npm) is the authoritative lockfile.
8. ~~`.env.example` is misleading~~ — **RESOLVED**: rewritten to exactly `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`, `DEFAULT_PROFILE_USER_ID` (Firebase vars removed).
9. **Fake `created_at`** — `mapProfile` sets `created_at = updatedAt` (the `profiles` table has no created-at column, but the DTO claims one).
10. **Fragile "default profile" contract** — `PublicPage` with no `:id` calls `/api/profiles/public/undefined`, which only works because the server string-matches the literal `"undefined"`.
11. **Duplicated auth-header code** in both services — no shared fetch wrapper; no 401 handling/auto-logout on expired tokens.
12. **No shared data cache** — Dashboard, Profile, and Methods pages each refetch independently; saves on one page don't refresh others.
13. **Client-side-only avatar validation** — server accepts any `avatar_url` string (arbitrarily large base64 or arbitrary URLs) via PUT `/profiles/me`.
14. **`clean` script is POSIX-only** (`rm -rf`) — fails on Windows CMD.
15. **`other` contact type** exists in the TS union but has no icon/color definition — always renders the gray fallback.
16. **Possible state-update-after-unmount** — pages fetch in `useEffect` without AbortController/cleanup flags.
17. Error handling in admin pages mixes `alert()` (ContactMethodsPage) and inline banners (ProfilePage) — inconsistent UX.

### 8.5 Security Concerns (ranked by severity)

1. ~~Hardcoded JWT fallback secret~~ — **RESOLVED**: the fallback was removed; `src/api.ts` now throws `'JWT_SECRET environment variable is required'` at module load if the variable is missing.
2. ~~Missing object-level authorization (IDOR)~~ — **RESOLVED**: all contact-method mutations (`PUT/DELETE /:id`, `/reorder`) now include `eq(contactMethods.userId, req.user.userId)` in their `where` clauses and return 404 on no match (no existence leak).
3. ~~Open registration~~ — **MITIGATED**: `POST /api/auth/register` now returns 403 (registration disabled), and the public `"default"` profile fallback is gated behind `DEFAULT_PROFILE_USER_ID` (or the single-profile rule). Follow-up: seed the first admin directly into the database.
4. **JWT stored in `localStorage`** — vulnerable to XSS token theft; no refresh tokens, rotation, or revocation (stateless 7-day JWTs). An httpOnly cookie would be safer.
5. **Raw error messages to clients** — every catch returns `res.status(500).json({ error: err.message })`, potentially leaking internal details (SQL errors, etc.).
6. **No server-side password policy** — the change-password endpoint does not exist yet; when credentials handling is next touched, add server-side validation (min length, email format).
7. **No rate limiting / brute-force protection** on `/auth/login` or `/auth/register`.
8. **Base64 avatars in the DB** — combined with the 10 MB JSON limit and unvalidated `avatar_url`, this enables storage-flooding of the `profiles` table.
9. **No security headers / HTTPS enforcement** in the server itself (no `helmet`, no `trust proxy` config).
10. *Positive notes:* public deep links correctly use `rel="noopener noreferrer"`, `tel:`/`mailto:`/social values are sanitized client-side, passwords are bcrypt-hashed, and login responses don't leak whether an email exists (uniform "Invalid credentials").

### 8.6 Overall Assessment

A compact, coherent, and genuinely functional MVP — the core "link-in-bio card" flow works end-to-end with clean separation (schema → API → services → pages) and thoughtful UX details (skeletons, optimistic updates, bilingual labels). The critical security holes identified in the original audit have been closed: registration disabled, `JWT_SECRET` required at startup, IDOR fixed, the public "default" profile guarded, the InstallGate PWA gate added, dead code/dependencies removed, and the type-check now passes with zero errors. Remaining priorities:

1. Seed the first admin account (registration is disabled — requires a DB-level seed script).
2. Implement real avatar file storage and the password-change endpoint.
3. Convert the `order` column to an integer and make reorder transactional (**still TEXT — known issue**).
4. Reduce the global 10 MB JSON body limit once avatars move out of the database.
5. Add ESLint, tests, rate limiting, and security headers (`helmet`).
6. Replace raw `err.message` 500 responses with generic messages + server-side logging.

---

*Report based on static analysis of the project, updated after the security-hardening, cleanup, and PWA-install-gate pass (sections 4, 7, 8 reflect the current state). Dependencies are now installed and verified: `npm run lint` passes with zero type errors and `npm run build` succeeds. No secrets, API keys, passwords, or `.env` values are contained in this report.*










