"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRootManagePage = pathname === "/manage";
  const formUrlRegex = /\/manage\/(?!edit\/)([^\/]+)/;
  const formUrlMatch = formUrlRegex.exec(pathname);
  const formUrl =
    formUrlMatch && formUrlMatch[1] !== "edit" ? formUrlMatch[1] : null;

  const navItems = [
    {
      title: "Form Dashboard",
      href: formUrl ? `/manage/${formUrl}` : "/",
      icon: LayoutDashboard,
    },
    {
      title: "Edit Form",
      href: formUrl ? `/manage/edit/${formUrl}` : "/create",
      icon: PlusCircle,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-white px-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-black"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-black">
              Form Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-black md:hidden"
                >
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <h2 className="mb-4 text-lg font-semibold text-black">
                    Navigation
                  </h2>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-black",
                            pathname === item.href && "bg-muted text-white",
                          )}
                        >
                          <item.icon className="mr-2 h-5 w-5" />
                          {item.title}
                        </Button>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        {!isRootManagePage && formUrl && (
          <div className="mb-6 hidden md:block">
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-1",
                      pathname !== item.href && "text-black",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
            <Separator className="mt-6" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
