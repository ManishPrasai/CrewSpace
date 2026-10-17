"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Plus, UserCircle } from "lucide-react";
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
  expanded = false,
}: {
  user: { name: string | null; email: string | null };
  slug: string;
  compact?: boolean;
  /** D1/D4/D5's sidebar account control: full name + email + chevron,
      not just the avatar - the whole row is the trigger. */
  expanded?: boolean;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          expanded ? (
            <button
              type="button"
              aria-label="Account menu"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-background/60"
            >
              <Avatar id={user.email ?? "unknown"} name={user.name} size={30} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[14px] font-medium text-foreground">{user.name ?? user.email}</span>
                {user.email && <span className="truncate text-[12.5px] text-muted-foreground">{user.email}</span>}
              </span>
              <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </button>
          ) : (
            <button type="button" aria-label="Account menu" className="shrink-0">
              <Avatar id={user.email ?? "unknown"} name={user.name} size={compact ? 32 : 30} />
            </button>
          )
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5">
          <Avatar id={user.email ?? "unknown"} name={user.name} size={32} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[14px] font-medium text-foreground">{user.name ?? "Account"}</span>
            {user.email && <span className="truncate text-[12.5px] text-muted-foreground">{user.email}</span>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/w/${slug}/settings#profile`)}>
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
