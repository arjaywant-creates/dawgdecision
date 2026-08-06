# Agent Instructions for dawgdecision

This file provides instructions and context for AI coding agents working on the `dawgdecision` repository.

## Project Overview
`dawgdecision` is a web application designed to help UGA students make smarter financial decisions through scenario planning.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** TailwindCSS
- **UI Library:** HeroUI (Next.js UI Kit)
- **Icons:** Lucide Icons (`lucide-react`)
- **Language:** TypeScript
- **Authentication:** BetterAuth
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Docker:** Docker Compose (for running database and backend services)

## Directory Structure
- `app/` - Next.js App Router pages and layouts.
- `components/` - Reusable React components.
- `config/` - Configuration files (e.g., site config).
- `lib/` - Utility functions and libraries (including `auth.ts` for BetterAuth).
- `prisma/` - Prisma schema and migrations (for database).
- `public/` - Static assets.
- `styles/` - Global styles and Tailwind config.
- `types/` - TypeScript type definitions.

## Guidelines for Agents
1. **Component Design:** Prioritize creating reusable components in the `components/` directory.
2. **Styling:** Use TailwindCSS utility classes for styling. Avoid writing custom CSS unless absolutely necessary.
3. **UI Components:** Leverage HeroUI components whenever possible to maintain a consistent design language.
4. **Icons:** Use `lucide-react` for all icons.
5. **Type Safety:** Always use TypeScript. Define interfaces or types in the `types/` directory or alongside the component if they are highly specific to it.
6. **Aesthetics:** Ensure a premium, modern design with appropriate use of layout, colors, and micro-interactions.
7. **Development & Running from Scratch:**
   - **Setup Environment**: Navigate to `frontend/`, and copy `.env.example` to `.env` (if not already done).
   - **Install Dependencies**: Run `npm install`.
   - **Start Local Database**: Run `npx prisma dev` in a dedicated terminal to spin up the persistent Prisma Postgres development server.
   - **Sync Database Schema**: Run `npx prisma db push` to initialize the database tables.
   - **Run Dev Server**: In a new terminal, run `npm run dev`.
