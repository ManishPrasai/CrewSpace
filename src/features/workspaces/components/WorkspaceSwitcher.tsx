"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/app/RoleBadge";
import { WorkspaceMonogram } from "@/components/app/WorkspaceMonogram";
import type { MyWorkspace } from "../queries";

// handoff/03-components.md: trigger card (monogram, truncated name,
// role · plan). Items link to /w/[slug]; "Create workspace", "All
// workspaces". `compact` (AppRail, 768-1023) shows only the monogram.
export function WorkspaceSwitcher({
  current,
  workspaces,
  compact = false,
}: {
  current: MyWorkspace;
  workspaces: MyWorkspace[];
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // handoff/04-routes.md: switching workspaces keeps the current
  // sub-route (e.g. /members) when it exists on the target workspace too.
  const subRoute = pathname.startsWith(`/w/${current.slug}`)
    ? pathname.slice(`/w/${current.slug}`.length)
    : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          compact ? (
            <button type="button" aria-label={`Switch workspace, currently ${current.name}`}>
              <WorkspaceMonogram name={current.name} slug={current.slug} size={32} />
            </button>
          ) : (
            <button
              type="button"
              className="flex max-w-[232px] items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-background/60"
            >
              <WorkspaceMonogram name={current.name} slug={current.slug} size={32} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[14px] font-medium">{current.name}</span>
                <span className="flex items-center gap-1 text-[12px] text-muted-foreground capitalize">
                  {current.role} · {current.plan}
                </span>
              </span>
              <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </button>
          )
        }
      />
      <DropdownMenuContent className="w-64">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => router.push(`/w/${workspace.slug}${subRoute}`)}
          >
            <WorkspaceMonogram name={workspace.name} slug={workspace.slug} size={24} />
            <span className="flex-1 truncate">{workspace.name}</span>
            <RoleBadge role={workspace.role} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => router.push("/workspaces#create")}>
          <Plus className="size-4" strokeWidth={1.5} />
          Create workspace
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/workspaces")}>All workspaces</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
