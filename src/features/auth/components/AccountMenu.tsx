"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Plus, SunMoon, UserCircle } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { signOut } from "../actions";

const THEME_LABEL: Record<Theme, string> = { system: "System", light: "Light", dark: "Dark" };

// handoff/03-components.md: Account settings, Appearance (System/Light/
// Dark), All workspaces, Create workspace, Log out.
export function AccountMenu({
  user,
  slug,
  compact = false,
}: {
  user: { name: string | null; email: string | null };
  slug: string;
  compact?: boolean;
}) {
  const router = useRouter();
  // Read after mount, not during render: the stored theme lives in a
  // cookie the server already resolved for <html>'s class, but this
  // label is purely for which radio item shows checked - no SSR need.
  const [theme, setThemeState] = useState<Theme>("system");
  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  function handleThemeChange(next: Theme) {
    setThemeState(next);
    applyTheme(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" aria-label="Account menu" className="shrink-0">
            <Avatar id={user.email ?? "unknown"} name={user.name} size={compact ? 32 : 30} />
          </button>
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        {!compact && user.email && (
          <div className="truncate px-1.5 py-1 text-[13px] text-muted-foreground">{user.email}</div>
        )}
        <DropdownMenuItem onClick={() => router.push(`/w/${slug}/settings#account`)}>
          <UserCircle className="size-4" strokeWidth={1.5} />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon className="size-4" strokeWidth={1.5} />
            <span className="flex-1">Appearance</span>
            <span className="text-muted-foreground">{THEME_LABEL[theme]}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => handleThemeChange(value as Theme)}>
              <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/workspaces")}>All workspaces</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/workspaces#create")}>
          <Plus className="size-4" strokeWidth={1.5} />
          Create workspace
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <LogOut className="size-4" strokeWidth={1.5} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
