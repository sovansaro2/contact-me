# TASK: Implement dual-theme PublicPage — "Minimal Serene" (Light) + "Dark Elegance" (Dark)

Modify ONLY visual presentation in src/pages/public/PublicPage.tsx (and add a small
theme hook file if needed). Keep ALL logic untouched: language toggle, contact links,
deep links, admin routing, InstallGate separation.

## Theme system:

1. Create a `useTheme` hook (e.g. src/hooks/useTheme.ts):
   - State: 'light' | 'dark'.
   - Initial: localStorage('theme') if set, else matchMedia('(prefers-color-scheme: dark)').
   - Exposes [theme, toggleTheme]. On change → persist to localStorage AND toggle
     the 'dark' class on document.documentElement.
   - Use Tailwind's class-based dark mode: darkMode: 'class' in the Tailwind config
     (v4: use @custom-variant dark (&:where(.dark, .dark *)) in CSS if applicable —
     match whatever Tailwind version this project uses).

2. Theme toggle button on PublicPage: a small in the top corner (fixed or
   absolute, top-right, below safe-area) showing ☀️/🌙 icon (use lucide-react
   Sun/Moon icons — this project already has lucide). Subtle styling:
   `ring-1 ring-black/5 bg-white/70` in light, `ring-white/10 bg-white/5` in dark.
   No logic changes elsewhere.

## LIGHT theme = "Minimal Serene":
- Page background: `#fdfcfa`.
- Title `text-stone-800`, subtitle `text-stone-500`.
- Thin golden divider under header: 52px wide, 2px tall,
  linear-gradient(90deg, transparent, #d9a441, transparent), centered.
- Cards: white, `border border-[#eee7db]`, `shadow-[0_2px_10px_rgba(0,0,0,0.03)]`,
  rounded-2xl. Card title `text-stone-800`, value `text-stone-400`.
- Icon circles: `bg-[#f7f4ee]`.

## DARK theme = "Dark Elegance":
- Page background: `#1a1612` with a top radial golden glow:
  full-width ~380px element, absolute top, pointer-events-none,
  `background: radial-gradient(ellipse at center, rgba(217,164,65,0.22), transparent 65%)`.
- Title `text-[#f5ead3]`, subtitle `text-[#a89a80]`.
- Cards: `bg-white/[0.055] backdrop-blur border border-[#d9a441]/15`, rounded-2xl.
  Card title `text-[#f0e6d2]`, value `text-[#9a8b6f]`.
- Icon circles: `bg-[#d9a441]/12`.
- Avatar ring: golden ring (border `#d9a441`) in dark mode; plain in light.

## Shared:
- Keep platform brand-colored icons identical in both themes.
- Smooth theme transition: `transition-colors duration-300` on page bg + cards.
- All text contrast must remain readable (WCAG AA) in both themes.

## Do NOT change: admin pages, InstallGate, API logic, translations content.

## Verify: npm run lint && npm run build — fix only errors you introduce.
Confirm per step in one line.
