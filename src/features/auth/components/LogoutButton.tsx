"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "../actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Log out
      </Button>
    </form>
  );
}
