"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MyWorkspace } from "../queries";

export function WorkspaceSwitcher({
  current,
  workspaces,
}: {
  current: MyWorkspace;
  workspaces: MyWorkspace[];
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">{current.name}</Button>}
      />
      <DropdownMenuContent>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => router.push(`/w/${workspace.slug}`)}
          >
            {workspace.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => router.push("/workspaces")}>
          Manage workspaces
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
