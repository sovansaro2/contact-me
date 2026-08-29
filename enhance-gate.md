# TASK Improve InstallGate in-app browser handling

Modify src/components/Install.tsx. Keep everything else unchanged (desktop passthrough,
standalone passthrough, ?gate=off bypass, normal Safari/Chrome gate).

## . ANDROID in-app browser (UA contains fbav/fban/line/instagram/twitter/snapchat/micromessenger AND /android/i):
- Attempt automatic redirect to Chrome ONCE (useRef guard to prevent loops):
  window.location.href = 'intent://' + location.host + location.pathname + '#Intent;scheme=https;package=com.android.chrome;end';
- While redirecting, show "កំពុងបើកក្នុង Chrome..." message.
- After 2.5s, if still on page (redirect failed), fall back to:
  a white button "📋 ចម្លង Link" (copies location.href, clipboard API with
  execCommand textarea fallback) + Khmer instruction to open Chrome manually.

## 2. iOS in-app browser:
- Show a white button "📋 ចម្លង Link" → navigator.clipboard.writeText(location.href)
  with execCommand fallback → change label to "✅ ចម្លងរួចរាល់!" for 2 seconds.
- Instructions below (Khmer):
  "1. ចុច \"ចម្លង Link\" ខាងលើ។
   2. បើកកម្មវិធី Safari → ចុច address bar → paste → បើក។
   3. បន្ទាប់មកអ្នកនឹងឃើញការណែនាំដំឡើង។"
- If UA contains 'telegram', add hint: "ក្នុង Telegram៖ ចុច ⋯ មុំខាងស្តាំលើ → Open in Safari"

## 3. Verify: npm run lint && npm run build — fix only errors you introduce.
