# dawgdecision
Helping UGA students make smarter financial decisions through scenario planning.

This is a temporary README file. Subject to change.

# Stack
- Next.js
- TailwindCSS
- HeroUI (Next.js UI Kit)
- Lucide Icons

# Layout
- `app/` - contains the main application code
- `components/` - contains reusable React components
- `config/` - contains configuration files like siteConfig
- `public/` - contains static assets like images and fonts
- `styles/` - contains global styles and TailwindCSS configuration
- `types/` - contains TypeScript type definitions

# How to run
- Install Git and Node.js
- Clone the repo
- Run `npm install` to install dependencies
- Run `npm run dev` to start the development server
- Open http://localhost:3000 in your browser to view the app

# Project Structure Guide

## Where to add new Pages
All new pages should be added as `page.tsx` files inside directories within the `app/` folder.
- Example: To create a page at `/dashboard`, create the file `app/dashboard/page.tsx`.

## Where to add new Components
Reusable components should be placed in the `components/` directory.
- Example: A custom navigation bar should go in `components/Navbar.tsx`.
- Highly specific, non-reusable components can be co-located with their respective pages, but placing them in `components/` is generally preferred to keep `app/` clean.

# Development Examples

## How to add HeroUI components
HeroUI components are provided via `@heroui/react` and typically imported directly.
```tsx
import { Button } from "@heroui/react";

export function MyComponent() {
  return <Button color="primary">Click Me!</Button>;
}
```

## How to add Icons (Lucide)
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

## How to use Tailwind CSS
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

### Common Tailwind Classes to Know
Here are a few frequently used utility classes:

- **Layout**
  - `flex`, `flex-col`, `flex-row` (Container and direction)
  - `items-center`, `justify-center`, `justify-between` (Alignment)
  - `grid`, `grid-cols-2`, `gap-4` (CSS Grid and spacing)
  - `hidden`, `block`, `inline-block` (Display properties)

- **Spacing (Margin & Padding):**
  - `p-4` (Padding all sides), `px-4` (Padding left/right), `py-4` (Padding top/bottom)
  - `m-4` (Margin all sides), `mx-auto` (Center horizontally)
  - `mt-2` (Margin top), `mb-4` (Margin bottom)

- **Typography:**
  - `text-sm`, `text-base`, `text-lg`, `text-2xl` (Font sizes)
  - `font-normal`, `font-semibold`, `font-bold` (Font weights)
  - `text-center`, `text-left`, `text-right` (Text alignment)
  - `text-gray-500`, `text-blue-600` (Text colors)

- **Borders, Backgrounds & Effects:**
  - `bg-white`, `bg-gray-100` (Background colors)
  - `rounded-md`, `rounded-full` (Border radius)
  - `border`, `border-gray-200` (Borders)
  - `shadow-sm`, `shadow-md`, `shadow-lg` (Box shadows)
  - `hover:bg-gray-50`, `focus:ring-2` (Interactive states)
