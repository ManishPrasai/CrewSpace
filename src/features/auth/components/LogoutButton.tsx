"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "../actions";

export function LogoutButton({ next, children = "Log out" }: { next?: string; children?: React.ReactNode }) {
  return (
    <form action={signOut}>
      {next && <input type="hidden" name="next" value={next} />}
      <Button type="submit" variant="outline">
        {children}
      </Button>
    </form>
  );
}
