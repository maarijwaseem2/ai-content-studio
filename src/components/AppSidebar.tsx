import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { getCreditLimit } from "@/lib/plans";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Sparkles,
  BookmarkCheck,
  FileText,
  LayoutTemplate,
  History,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const main = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard, end: true },
  { title: "Generator", url: "/app/generate", icon: Sparkles },
  { title: "Saved", url: "/app/saved", icon: BookmarkCheck },
  { title: "Templates", url: "/app/templates", icon: LayoutTemplate },
  { title: "History", url: "/app/history", icon: History },
];

const account = [
  { title: "Pricing", url: "/app/pricing", icon: CreditCard },
  { title: "Settings", url: "/app/settings", icon: Settings },
  { title: "Admin", url: "/app/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { user, credits, logout } = useStore();
  const creditLimit = getCreditLimit(
    credits,
    user?.subscriptionTier,
    user?.creditLimit,
  );

  const handleLogout = () => {
    logout();
    toast.success("Signed out.");
    nav("/login");
  };

  const isActive = (url: string, end?: boolean) =>
    end ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-4 py-5">
        <NavLink
          to={user?.role === "ADMIN" ? "/app/admin" : "/app"}
          className="flex items-center gap-2"
        >
          <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-background text-sm font-semibold">L</span>
          </div>
          {!collapsed && (
            <span className="font-semibold tracking-tight">Lexicon.</span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="label-eyebrow">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main
                .filter(() => user?.role !== "ADMIN")
                .map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url, item.end)}
                    >
                      <NavLink to={item.url} end={item.end}>
                        <item.icon className="size-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="label-eyebrow">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {account
                .filter((item) =>
                  item.title === "Admin" ? user?.role === "ADMIN" : true,
                )
                .map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="size-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="size-4 text-muted-foreground" />
                  {!collapsed && <span>Sign Out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-xs">
            <div className="label-eyebrow mb-1">
              Account: {user?.role === "ADMIN" ? "Admin" : "User"}
            </div>
            <div className="font-medium">
              {user?.role === "ADMIN"
                ? "Premium Admin"
                : user?.subscriptionStatus === "ACTIVE"
                  ? user?.subscriptionTier
                  : "Free"}
            </div>
            {user?.role !== "ADMIN" && (
              <div className="text-muted-foreground mt-1">
                {credits} of {creditLimit} credits left
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
