## Prasanna Kulal — Portfolio (Three.js Solar System)

A professional portfolio with a cinematic 4K solar‑system background (Three.js) and React UI. Includes parallax motion, immersive starfield, tasteful shooting stars, and a contact form that emails via a serverless function.

### Live Demo

- Live: https://your-project-url.vercel.app

### Features
- Solar system background (Sun, Mercury → Neptune, Earth + Moon) with smooth orbital motion
- Cinematic look: tone mapping, soft glows, subtle vignette, starfield, occasional shooting stars
- Parallax on scroll with eased motion; respects prefers‑reduced‑motion
- 60fps target on desktop, graceful performance scaling
- Responsive layout and accessible markup
- Contact form sends email using Resend via a Vercel serverless function
- Project cards with images, tags, and Live/Code links

### Tech Stack
- React + Vite + TypeScript
- Three.js (WebGL2)
- Vercel (hosting + serverless functions)
- Resend (email API)

---

## Project Structure
```
portfolio/
  ├─ api/
  │  └─ contact.ts              # Serverless function (email via Resend)
  ├─ public/
  │  └─ styles.css              # Global/public styles
  ├─ src/
  │  ├─ assets/                 # Project images used in Projects section
  │  ├─ ui/
  │  │  ├─ App.tsx
  │  │  ├─ Header.tsx
  │  │  ├─ Hero.tsx
  │  │  ├─ Projects.tsx         # Update Live/Code links here
  │  │  ├─ Contact.tsx          # Contact form calls /api/contact
  │  │  └─ SolarSystemBackground.tsx
  │  ├─ styles.css              # Main app styles
  │  └─ main.tsx
  ├─ types.d.ts                 # Image/asset type declarations
  ├─ package.json
  ├─ tsconfig.json
  ├─ vite.config.ts
  └─ vercel.json                # Vercel build and functions config
```

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+ and npm

### Install and Run
```bash
# 1) Go to the project folder
cd portfolio

# 2) Install dependencies
npm install

# 3) Start dev server
npm run dev
# Open the printed local URL (e.g., http://localhost:5173)
```

### Build and Preview Production
```bash
npm run build
npm run preview
# Preview will run on a local port and serve the built app from dist/
```

---

## Email (Contact Form)
Email sending is handled by a Vercel serverless function at `api/contact.ts` using Resend.

### On Vercel (recommended)
1. Create a Resend account and generate an API key.
2. In your Vercel project settings → Environment Variables, add:
   - `RESEND_API_KEY` = your‑resend‑api‑key
3. Deploy (see Deployment section). The contact form will POST to `/api/contact` on your domain.

### Local Testing (optional)
For the serverless function locally, use Vercel CLI:
```bash
npm install -g vercel
cd portfolio
vercel dev
# Visit the local URL printed by Vercel (it will serve both the app and /api/contact)
```
The function allows requests from localhost and your Vercel domain by default.

---

## Deployment (Vercel)
This repo is pre‑configured for Vercel using `vercel.json`.

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. In Vercel → Settings → Environment Variables, add `RESEND_API_KEY`.
4. Build settings: use defaults. We provide `"vercel-build"` in `package.json` and `vercel.json` with `outputDirectory` set to `dist`.
5. Deploy. After the first deployment, copy the live URL into the README Live section above.

---

## Editing Projects (Live/Code links)
- Add images to `src/assets/`.
- Open `src/ui/Projects.tsx` and update the projects array:
  - `img`: imported image
  - `live`: project live URL
  - `code`: GitHub repository URL

Example snippet:
```tsx
{
  title: 'GenCl — AI‑Powered Chat Platform',
  desc: 'React + Node.js chat app...',
  tags: ['React','Node.js','LLM'],
  img: GenclImg,
  live: 'https://gencl.netlify.app',
  code: 'https://github.com/Prasannakulal/GenCl-AI-Powered-Chat-Platform'
}
```

---

## Performance & Accessibility
- The background respects `prefers-reduced-motion` and scales effects for lower‑end devices.
- Device pixel ratio is capped for performance; animations use `requestAnimationFrame`.
- Typography and UI avoid excessive bloom to keep text crisp.

---

## Scripts
```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check + build production bundle
npm run preview   # Preview the production build locally
```

---

## Troubleshooting
- “npm run dev not found” at repo root: run commands inside `portfolio/`.
- Contact form 403/500:
  - Ensure you are using your Vercel domain or localhost.
  - On Vercel, set `RESEND_API_KEY`.
- TypeScript cannot import images: `types.d.ts` is already included for asset imports.

---

## License
This is a personal portfolio project. If you wish to reuse parts of it, please credit the author.
