# React + Vite Application

A modern React 18 + TypeScript application powered by Vite and Tailwind CSS. The app bundles a rich landlord/tenant management experience including onboarding flows, dashboards, reporting tools and subscription management screens.

## 🚀 Features

- **Vite + React 18** – lightning fast dev server with the latest React runtime
- **TypeScript** – strict typing across the entire UI codebase
- **React Router** – client-side routing that mirrors the former Next.js app structure
- **Tailwind CSS** – utility-first styling with a fully customized design system
- **Supabase** – authentication and data fetching via the Supabase JavaScript client

## 📋 Prerequisites

- Node.js (v18.x or higher recommended)
- npm

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:4028](http://localhost:4028) in your browser.

## 📁 Project Structure

```
landlord_main/
├── public/                 # Static assets
├── src/
│   ├── app/                # Feature pages (formerly Next.js routes)
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── lib/                # Utility libraries (Supabase clients, etc.)
│   ├── styles/             # Global Tailwind styles
│   └── App.tsx             # React Router configuration
├── index.html              # Vite entry HTML
├── package.json            # Scripts and dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 📦 Available Scripts

- `npm run dev` – start the Vite dev server on port **4028**
- `npm run build` – type-check and create a production build
- `npm run start` – alias of `npm run dev`
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint across the project
- `npm run lint:fix` – run ESLint with automatic fixes
- `npm run format` – format source files with Prettier
- `npm run type-check` – run TypeScript without emitting output

## 📱 Deployment

1. Build the application for production:
   ```bash
   npm run build
   ```
2. Serve the `dist/` directory with your preferred static hosting service (e.g. Netlify, Vercel, Render, etc.).

## 🔐 Environment Variables

Create a `.env` file (or configure environment variables in your hosting provider) with the following values:

```
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_public_anon_key>
VITE_ALLOW_TEST_USERS=false
```

These values are required for the Supabase client and registration flows.

## 🧭 Routing Notes

Routing is now handled entirely on the client via React Router. Each folder inside `src/app` corresponds to a route (e.g. `src/app/tenant/dashboard/page.tsx` -> `/tenant/dashboard`). The logic and UI from the previous Next.js version remain unchanged—they now render as standard React components within the Vite runtime.
