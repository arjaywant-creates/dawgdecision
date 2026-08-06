export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "DawgDecision",
  description: "Helping UGA students make smarter financial decisions through scenario planning.",
  navItems: [
    {
      label: "Home",
      href: "/",
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
  navMenuItems: [
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
