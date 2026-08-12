export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "DawgDecision",
  description: "Helping UGA students make smarter financial decisions through scenario planning.",
  navItems: [

    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Compare",
      href: "/compare",
    },
    {
      label: "Financial Plan",
      href: "/plan",
    },
    {
      label: "Test Backend",
      href: "/test-backend",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Compare",
      href: "/compare",
    },
    {
      label: "Financial Plan",
      href: "/plan",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Test Backend",
      href: "/test-backend",
    },
  ],
};
