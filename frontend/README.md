# DawgDecision Frontend

This directory contains the Next.js frontend for DawgDecision.

## Local Development Setup

1. Copy `.env.example` to `.env`.
2. Run `npm install` to install dependencies.
3. Run `npx prisma dev` to automatically start a local PostgreSQL database (keep this running in its own terminal tab).
4. In a new terminal tab, run `npx prisma db push` to initialize the database schema.

*Note: You can run the development server from the project root using `npm run dev`, and the database using `npm run db`.*

## Layout & Architecture
- `app/` - Main Next.js App Router application code. Add new pages here (e.g. `app/dashboard/page.tsx`).
- `components/` - Reusable React components.
- `config/` - Configuration files like siteConfig.
- `lib/` - Utility functions and libraries (including `auth.ts` for BetterAuth).
- `lib/store/` - Zustand stores for global state management. We use Zustand's `persist` middleware with `sessionStorage` for form drafts.
- `prisma/` - Prisma schema and migrations (for database).
- `public/` - Static assets like images and fonts.
- `styles/` - Global styles and TailwindCSS configuration.
- `types/` - TypeScript type definitions (and Zod schemas).

## Authentication Architecture
We use **Better Auth** with strict **Database Sessions** for security.
- **Proxy (`proxy.ts`):** We use a full Node.js check `auth.api.getSession()` before loading secure pages to prevent unauthenticated access. 

## Development Examples

### How to add HeroUI components
HeroUI components are provided via `@heroui/react` and typically imported directly.
```tsx
import { Button } from "@heroui/react";

export function MyComponent() {
  return <Button color="primary">Click Me!</Button>;
}
```

### How to add Icons (Lucide)
We use `lucide-react` for all icons in the project. You can import icons directly from the library.
```tsx
import { Home, Settings } from "lucide-react";

export function IconExample() {
  return (
    <div className="flex gap-2">
      <Home className="w-5 h-5 text-gray-500" />
      <Settings className="w-5 h-5 text-gray-500" />
    </div>
  );
}
```

### How to use Tailwind CSS
We use Tailwind CSS for all custom styling. Instead of writing separate `.css` files, use Tailwind's utility classes directly in your React components' `className` props.
```tsx
export function TailwindExample() {
  return (
    <div className="p-4 m-2 bg-blue-100 rounded-lg shadow-md hover:bg-blue-200 transition-colors">
      <h1 className="text-2xl font-bold text-blue-900">Hello Tailwind!</h1>
      <p className="mt-2 text-sm text-blue-700">This is styled entirely with utility classes.</p>
    </div>
  );
}
```
