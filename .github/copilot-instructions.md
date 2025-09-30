# Copilot Instructions for joker-sun-stock-main

## Project Overview

- **Architecture:** Vite + React + TypeScript + shadcn-ui + Tailwind CSS. UI components are modularized under `src/components`, with feature-specific folders (e.g., `inventory`, `layout`, `ui`).
- **State & Auth:** Context-based authentication (`src/contexts/AuthContext.tsx`), with protected routes and custom hooks for mobile and toast notifications.
- **Data & Services:** Data flows through service modules in `src/services` (e.g., `inventory.ts`, `sales.ts`, `auth.ts`). Supabase integration is handled via `src/lib/supabase.ts` and `src/services/supabaseClient.ts`.
- **Pages:** Route-level components are in `src/pages`, with admin-specific pages in `src/pages/admin`.

## Developer Workflows

- **Start Dev Server:** `npm run dev` (uses Vite for hot-reloading)
- **Build:** `npm run build` or `npm run build:dev` (development mode)
- **Lint:** `npm run lint` (uses ESLint)
- **Preview:** `npm run preview` (serves production build)
- **Dependencies:** Managed via npm. Lockfile is `bun.lockb` (Bun support possible, but npm is primary).

## Project-Specific Conventions

- **Component Aliases:** See `components.json` for path aliases (e.g., `@/components`, `@/lib/utils`). Use these for imports.
- **UI Patterns:** Prefer shadcn-ui and Radix UI primitives for new components. Tailwind CSS is used for styling; see `tailwind.config.ts` and `src/index.css`.
- **Forms:** Use `react-hook-form` for form state and validation. Zod is used for schema validation.
- **Notifications:** Use `sonner` and custom toast hooks (`src/hooks/use-toast.ts`).
- **Charts:** Use `recharts` for data visualization.

## Integration Points

- **Supabase:** All backend data access is via Supabase. Connection logic is in `src/lib/supabase.ts`.
- **Routing:** Uses `react-router-dom` v6. Route protection via context and `ProtectedRoute` components.
- **Admin Features:** Admin pages are isolated in `src/pages/admin` and use the same service/data patterns as user pages.

## Examples

- To add a new inventory feature, create a component in `src/components/inventory`, a service in `src/services/inventory.ts`, and update relevant pages in `src/pages/Inventory.tsx`.
- For new UI primitives, add to `src/components/ui` and update `components.json` aliases if needed.

## References

- **Key files:**
  - `src/contexts/AuthContext.tsx` (auth logic)
  - `src/lib/supabase.ts` (Supabase client)
  - `src/services/` (feature services)
  - `src/components/ui/` (UI primitives)
  - `components.json` (aliases)
  - `tailwind.config.ts` (styling)
  - `package.json` (scripts)

---

If any section is unclear or missing, please provide feedback to improve these instructions.
