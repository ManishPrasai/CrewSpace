"use client";

import { useRouter } from "next/navigation";
import { LogOut, Plus, UserCircle } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "../actions";

// handoff/03-components.md: Account settings, Appearance (System/Light/
// Dark), All workspaces, Create workspace, Log out. The Appearance
// toggle is built (src/lib/theme.ts) but intentionally not shown here -
// the user's own call (2026-10-15): dark is the default for everyone
// for now, no switcher, until asked to bring it back.
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
