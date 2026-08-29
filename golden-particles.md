# TASK: Add animated golden light particles to the PublicPage background (both themes)

Modify ONLY src/pages/public/PublicPage.tsx visuals (may add a small component,
e.g. src/components/GoldenParticles.tsx). Keep ALL logic untouched.

## Implementation (CSS-only animation, no canvas needed for ~20 elements):

1. Create GoldenParticles component:
   - Renders an absolutely-positioned overlay: `position:absolute inset-0
     pointer-events-none overflow-hidden z-0` (behind content).
   - Render ~18 "mote" divs + ~8 "firefly" divs with randomized inline styles
     generated once with useMemo (deterministic per mount, no re-randomizing
     on re-render).
   - Motes: 2-6px circles, positioned bottom:-12px, left random 0-100%,
     background radial-gradient(rgba(255,220,140,.95), rgba(217,164,65,.55) 60%, transparent),
     box-shadow 0 0 8px 2px rgba(217,164,65,.35), CSS animations:
     `rise` (translateY from 0 to ~-105vh over 8-18s, linear, infinite,
     with slight X drift via CSS var) and `breathe` (brightness 1→1.6) in parallel.
   - Fireflies: 3px white-gold dots at random positions, `twinkle` animation
     (opacity 0→0.9, scale .6→1) 2-5s ease-in-out infinite, random delay.
   - Respect prefers-reduced-motion: disable animations entirely.

2. Sizing/tuning per theme:
   - Dark mode: opacity per mote 0.35-0.85 — more visible, magical.
   - Light mode: fewer (10) + lower opacity (0.15-0.3) — barely-there warmth.
   - Pass theme as prop to adjust.

3. Place the overlay as the FIRST child of the page container; all content
   (cards, header) must stay above it (z-10). Do not block clicks
   (pointer-events-none).

4. Performance: pure CSS keyframes only (no JS animation loop), total
   elements ≤ 30.

## Do NOT: touch InstallGate, admin pages, logic, or API code.

## Verify: npm run lint && npm run build. Confirm per step in one line.
