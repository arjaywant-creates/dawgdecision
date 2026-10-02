"use client";

import { Button, Dropdown, Avatar, Label } from "@heroui/react";
import { LogOut, LayoutDashboard } from "lucide-react";

import clsx from "clsx";
import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";

import posthog from "posthog-js";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/logo";
import { MobileBottomNav } from "@/components/mobile-nav";

import { useSession, signOut } from "@/lib/auth-client";

export const Navbar = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) return;

    posthog.reset();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
        <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex h-full items-center gap-4">
            <NextLink className="flex items-center gap-1" href="/">
              <Logo />
              <p className="font-bold whitespace-nowrap text-inherit">
                DawgDecision
              </p>
            </NextLink>
            <ul className="hidden sm:flex h-full gap-5 ml-6">
              {siteConfig.navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <li
                    key={item.href}
                    className="h-full relative flex items-center"
                  >
                    <NextLink
                      className={clsx(
                        "text-sm font-medium transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-default-500 hover:text-foreground",
                      )}
                      href={item.href}
                    >
                      {item.label}
                    </NextLink>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-t-full" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch />

            {isPending ? (
              <div className="flex gap-2 items-center ml-2">
                <div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
              </div>
            ) : !session ? (
              <div className="flex gap-2 items-center ml-2">
                <Button
                  className="hidden sm:flex"
                  size="sm"
                  variant="primary"
                  onPress={() => router.push("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="hidden sm:flex"
                  size="sm"
                  onPress={() => router.push("/signup")}
                >
                  Sign Up
                </Button>

                {/* Mobile sign in/up */}
                <Button
                  className="sm:hidden"
                  size="sm"
                  variant="primary"
                  onPress={() => router.push("/login")}
                >
                  Login
                </Button>
              </div>
            ) : session ? (
              <Dropdown>
                <Dropdown.Trigger>
                  <Avatar className="w-8 h-8 rounded-full cursor-pointer ml-2 transition-transform">
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
        </header>
      </nav>

      <MobileBottomNav />
    </>
  );
};
