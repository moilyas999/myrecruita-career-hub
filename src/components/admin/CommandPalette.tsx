import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  FileText, 
  Briefcase, 
  Users, 
  Star, 
  BarChart3, 
  Settings, 
  UserCog,
  Upload,
  Plus,
  Mail,
  Home,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { adminRole } = useAuth();
  const isFullAdmin = adminRole === 'admin';

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  const navigationItems = [
    { label: 'Dashboard', icon: Home, href: '/admin', shortcut: 'D' },
    { label: 'CV Database', icon: FileText, href: '/admin?tab=submissions', shortcut: 'C' },
    { label: 'Add New CV', icon: Plus, href: '/admin?tab=add-cv', shortcut: 'N' },
    { label: 'Bulk Import', icon: Upload, href: '/admin?tab=bulk-import', shortcut: 'B' },
  ];

  const adminOnlyItems = [
    { label: 'Analytics', icon: BarChart3, href: '/admin?tab=stats', shortcut: 'A' },
    { label: 'Jobs Management', icon: Briefcase, href: '/admin?tab=jobs', shortcut: 'J' },
    { label: 'Featured Talent', icon: Star, href: '/admin?tab=talent', shortcut: 'T' },
    { label: 'Job Applications', icon: Users, href: '/admin?tab=applications' },
    { label: 'Contact Forms', icon: Mail, href: '/admin?tab=contact' },
    { label: 'Staff Management', icon: UserCog, href: '/admin?tab=admins' },
    { label: 'Settings', icon: Settings, href: '/admin?tab=settings' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => navigate(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        {isFullAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              {adminOnlyItems.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => runCommand(() => navigate(item.href))}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {item.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
