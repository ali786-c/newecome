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
import { LogOut, ChevronUp, Settings } from 'lucide-react';
import { customerNav } from '@/config/navigation';

export function CustomerLayout() {
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

  const currentTitle = customerNav.find((n) => n.href === location.pathname)?.title || 'Page';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                U
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">UpgraderCX</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {customerNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.href}
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
                        <span className="text-sidebar-foreground/60 text-[10px] truncate max-w-[120px]">{user?.email}</span>
                      </div>
                      <ChevronUp className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
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
