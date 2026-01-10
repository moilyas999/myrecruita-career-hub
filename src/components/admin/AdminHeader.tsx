import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  RefreshCw, 
  Search,
} from 'lucide-react';
import { BUILD_VERSION, forceRefresh } from '@/lib/version';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CommandPalette from './CommandPalette';
import OfflineIndicator from './OfflineIndicator';
import NotificationCenter from './NotificationCenter';

interface AdminHeaderProps {
  user: User;
  onSignOut: () => void;
  updateAvailable?: boolean;
}

export default function AdminHeader({ user, onSignOut, updateAvailable = false }: AdminHeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [showCommandHint, setShowCommandHint] = useState(true);

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Memoized keyboard handler to prevent re-creation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setCommandOpen((open) => !open);
    }
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Hide command hint after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowCommandHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          {/* Sidebar Toggle */}
          <SidebarTrigger className="-ml-2" />

          {/* Search Bar / Command Palette Trigger */}
          <div className="flex-1 flex items-center">
            <Button 
              variant="outline" 
              className="w-full max-w-md justify-start text-muted-foreground h-9 px-3 hidden sm:flex"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left text-sm">Search...</span>
              {showCommandHint && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              )}
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Build Version */}
            <span className="text-[10px] text-muted-foreground/50 hidden lg:inline font-mono">
              {BUILD_VERSION}
            </span>

            {/* Refresh Button */}
            <Button 
              variant={updateAvailable ? "default" : "ghost"}
              size="icon"
              onClick={forceRefresh} 
              title={updateAvailable ? "Update available - click to refresh" : "Force refresh to clear cache"}
              className={updateAvailable 
                ? "h-9 w-9 bg-primary text-primary-foreground animate-pulse" 
                : "text-muted-foreground hover:text-foreground h-9 w-9"
              }
            >
              <RefreshCw className={`w-4 h-4 ${updateAvailable ? 'animate-spin' : ''}`} />
            </Button>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-9 px-2 gap-2 hover:bg-accent"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs text-muted-foreground">{getGreeting()}</p>
                    <p className="text-sm font-medium leading-none truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={forceRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </>
  );
}
