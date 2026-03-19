import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, ChevronUp, ArrowLeft, Settings } from 'lucide-react';
import { adminNav } from '@/config/navigation';
import type { NavItem } from '@/types';

/* Admin sidebar sections */
const NAV_SECTIONS: { label: string; hrefs: string[] }[] = [
  { label: 'Overview', hrefs: ['/admin'] },
  { label: 'Catalog & Sales', hrefs: ['/admin/products', '/admin/categories', '/admin/pricing', '/admin/orders', '/admin/customers', '/admin/tickets'] },
  { label: 'Payments & Providers', hrefs: ['/admin/payments', '/admin/supplier-import', '/admin/supplier-sync'] },
  { label: 'Growth & Marketing', hrefs: ['/admin/analytics', '/admin/social-media', '/admin/seo', '/admin/blog', '/admin/ai-blog'] },
  { label: 'Automation', hrefs: ['/admin/automation', '/admin/integrations', '/admin/sync-logs'] },
  { label: 'System', hrefs: ['/admin/audit-logs', '/admin/compliance', '/admin/settings'] },
];

function buildSections(nav: NavItem[]) {
  return NAV_SECTIONS.map((section) => ({
    label: section.label,
    items: section.hrefs.map((href) => nav.find((n) => n.href === href)).filter(Boolean) as NavItem[],
  })).filter((s) => s.items.length > 0);
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const currentTitle = adminNav.find((n) => location.pathname.startsWith(n.href) && n.href !== '/admin')?.title
    || (location.pathname === '/admin' ? 'Overview' : 'Admin');

  const sections = buildSections(adminNav);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                A
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">Admin Panel</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {sections.map((section) => (
              <SidebarGroup key={section.label}>
                {section.label !== 'Overview' && (
                  <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">{section.label}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            item.href === '/admin'
                              ? location.pathname === '/admin'
                              : location.pathname.startsWith(item.href)
                          }
                          tooltip={item.title}
                        >
                          <Link to={item.href}>
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Back to app">
                      <Link to="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to App</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left text-xs leading-tight">
                        <span className="font-medium truncate max-w-[120px]">{user?.name}</span>
                        <span className="text-sidebar-foreground/60 text-[10px]">Administrator</span>
                      </div>
                      <ChevronUp className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-4 sm:h-14">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-sm font-medium text-foreground truncate">
              {currentTitle}
            </h1>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
