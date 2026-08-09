# Contact Me (ទំនាក់ទំនងមកខ្ញុំ)

A digital contact card Progressive Web Application (PWA) designed to provide a fast, clean, mobile-first experience for visitors to easily contact you across multiple communication platforms.

## Hosting & Routing (SPA Fallback)

This application is built as a Single Page Application (SPA) using React and React Router.
For deep-linking and direct navigation (e.g. refreshing `/contact` or `/admin`) to work correctly in production, **the hosting provider must be configured to serve `index.html` for all unknown routes.**

If this fallback is not configured, direct visits to paths like `/contact` or `/admin` will result in a `404 Not Found` error.

**Examples:**
- **Netlify / Cloudflare Pages:** Add a `public/_redirects` file with `/* /index.html 200`
- **Vercel:** Create a `vercel.json` with `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`
- **Firebase Hosting:** Add `"rewrites": [ { "source": "**", "destination": "/index.html" } ]` to `firebase.json`
- **Apache:** Use `.htaccess` with `FallbackResource /index.html`
- **Nginx:** Use `try_files $uri $uri/ /index.html;`

## Open Graph (Social Previews)

Dynamic profile-specific social previews require server-side rendering or pre-generated metadata and are intentionally deferred. 
The current application uses static fallback Open Graph tags (defined in `index.html`) to ensure a polished preview on platforms like Facebook and Telegram.
