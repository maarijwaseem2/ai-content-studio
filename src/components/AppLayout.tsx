import { Outlet, useLocation, NavLink } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useStore } from "@/lib/store";
import { getCreditLimit } from "@/lib/plans";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

const titles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/generate": "Generator",
  "/app/saved": "Saved Content",
  "/app/templates": "Templates",
  "/app/history": "Generation History",
  "/app/pricing": "Plans & Credits",
  "/app/settings": "Account Settings",
  "/app/admin": "Admin",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const { user, credits } = useStore();
  const creditLimit = getCreditLimit(
    credits,
    user?.subscriptionTier,
    user?.creditLimit,
  );
  const title =
    titles[pathname] ||
    (pathname.startsWith("/app/content/") ? "Content Editor" : "Lexicon");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-paper">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-surface/60 backdrop-blur-md px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="w-px h-5 bg-border" />
              <h1 className="text-sm font-medium tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              {user?.role !== "ADMIN" && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-xs">
                  <span className="size-1.5 rounded-full bg-highlight" />
                  <span className="font-mono tabular-nums">
                    {credits}
                    <span className="text-muted-foreground font-normal">
                      /{creditLimit}
                    </span>
                  </span>
                  <span className="text-muted-foreground">credits</span>
                </div>
              )}
              {user?.role !== "ADMIN" && (
                <Button asChild size="sm" className="rounded-full">
                  <NavLink to="/app/generate">
                    <Sparkles className="size-3.5" />
                    Generate
                  </NavLink>
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
