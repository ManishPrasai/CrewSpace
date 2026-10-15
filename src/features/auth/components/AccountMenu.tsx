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

// handoff/03-components.md: Account settings, All workspaces, Create
// workspace, Log out. Appearance (System/Light/Dark) joins this menu in
// the dark-mode step (10) - omitted here rather than shipping a menu
// item with no working toggle behind it yet.
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
