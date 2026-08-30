"use client";

import { useState } from "react";
import { Link, Button, Dropdown, Avatar, Label } from "@heroui/react";
import { LogOut, LayoutDashboard } from "lucide-react";
import clsx from "clsx";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/logo";
import { useSession, signOut } from "@/lib/auth-client";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <NextLink className="flex items-center gap-1" href="/">
            <Logo />
            <p className="font-bold whitespace-nowrap text-inherit">
              DawgDecision
            </p>
          </NextLink>
          <ul className="hidden lg:flex gap-4 ml-2">
            {siteConfig.navItems.map((item) => (
              <li key={item.href}>
                <NextLink
                  className={clsx(
                    "text-foreground hover:text-accent transition-colors",
                    "data-[active=true]:text-accent data-[active=true]:font-medium",
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <ThemeSwitch />

          {!isPending && !session ? (
            <div className="flex gap-2 items-center ml-2">
              <Button
                size="sm"
                variant="primary"
                onPress={() => router.push("/login")}
              >
                Sign In
              </Button>
              <Button size="sm" onPress={() => router.push("/signup")}>
                Sign Up
              </Button>
            </div>
          ) : session ? (
            <Dropdown>
              <Dropdown.Trigger className="rounded-full cursor-pointer ml-2">
                <Avatar className="w-8 h-8">
                  {session.user.image && (
                    <Avatar.Image
                      alt={session.user.name}
                      src={session.user.image}
                    />
                  )}
                  <Avatar.Fallback>
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar.Fallback>
                </Avatar>
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <div className="px-3 pt-3 pb-2 border-b border-separator/50 mb-1">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      {session.user.image && (
                        <Avatar.Image
                          alt={session.user.name}
                          src={session.user.image}
                        />
                      )}
                      <Avatar.Fallback>
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col gap-0 pr-4">
                      <p className="text-sm leading-5 font-medium">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === "logout") handleSignOut();
                    if (key === "dashboard") router.push("/dashboard");
                  }}
                >
                  <Dropdown.Item id="dashboard" textValue="Dashboard">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Label>Dashboard</Label>
                      <LayoutDashboard className="size-3.5 text-muted-foreground" />
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="logout"
                    textValue="Logout"
                    variant="danger"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <Label>Log Out</Label>
                      <LogOut className="size-3.5 text-danger" />
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          ) : null}
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <ThemeSwitch />
          <button
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              ) : (
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="border-t border-separator sm:hidden">
          <ul className="flex flex-col gap-2 px-4 py-4">
            {siteConfig.navMenuItems.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <Link
                  className={clsx(
                    "block py-2 text-lg no-underline",
                    index === 2
                      ? "text-accent"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "text-danger"
                        : "text-foreground",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {!isPending && !session ? (
              <>
                <li className="mt-2 border-t border-separator/50 pt-2">
                  <NextLink
                    className="block py-2 text-lg text-foreground w-full hover:opacity-80"
                    href="/login"
                  >
                    Sign In
                  </NextLink>
                </li>
                <li>
                  <NextLink
                    className="block py-2 text-lg text-primary w-full hover:opacity-80"
                    href="/signup"
                  >
                    Sign Up
                  </NextLink>
                </li>
              </>
            ) : session ? (
              <li className="mt-2 border-t border-separator pt-2">
                <button
                  className="block py-2 text-lg text-danger w-full text-left"
                  onClick={handleSignOut}
                >
                  Log Out
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      )}
    </nav>
  );
};
