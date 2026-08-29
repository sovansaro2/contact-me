# TASK: Open contact methods in native apps first, fallback to web

Modify src/lib/links.ts (add a new export) and src/pages/public/PublicPage.tsx 
(where links are clicked).

## 1. In src/lib/links.ts, add:

export function getNativeUrl(type: string, value: string): string | null
- telegram: strip leading @ and extract handle → `tg://resolve?domain=<handle>`
- whatsapp: digits-only number → `whatsapp://send?phone=<digits>`
- messenger: extract the path from m.me/<x> → `fb-messenger://user-thread/<x>`
- facebook: extract handle → `fb://profile/<handle>`
- instagram: handle → `instagram://user?username=<handle>`
- line: handle → `line://ti/p/@<handle>`
- viber: number → `viber://chat?number=%2B<digits>`
- tiktok, youtube, gmail, email, phone, sms, website, other: return null
  (keep current getActionUrl behavior)
Reuse/extract the handle-parsing logic from getActionUrl — do not duplicate it.
Return null on parse failure.

## 2. Add an opener helper in links.ts:

export function openContactLink(type: string, value: string): void
- Compute nativeUrl = getNativeUrl(...) and webUrl = getActionUrl(...)
- If nativeUrl is null OR webUrl === '#': just set window.location.href = webUrl.
- Else: record Date.now(), set location.href = nativeUrl, and after 1500ms,
  if !document.hidden and less than 2000ms elapsed → location.href = webUrl
  (app not installed fallback).
- Wrap in try/catch → fallback to webUrl.

## 3. In PublicPage.tsx:
- Replace the anchor href usage for the card click with onClick handler
  calling openContactLink(type, value); keep preventDefault, keep
  rel="noopener noreferrer" semantics. Keep the card rendered as <a> with
  href={getActionUrl(...)} for accessibility/right-click, but intercept clicks.

## 4. Verify: npm run lint && npm run build. Fix only errors you introduce.
Confirm each step in one line.
