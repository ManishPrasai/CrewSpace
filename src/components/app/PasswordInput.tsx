"use client";

import { useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";

// handoff/08-authentication.md: the show/hide toggle renders only after
// hydration; without JS the field is just a working password input, and
// it never changes autocomplete.
export function PasswordInput({
  id,
  name,
  autoComplete,
  required,
  defaultValue,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: {
  id?: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  defaultValue?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  // Renders only after hydration (handoff/08-authentication.md) - without
  // JS this is a plain password input with no toggle in the markup.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      <Input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={mounted ? "pr-16" : undefined}
      />
      {mounted && (
        <button
          type="button"
          aria-pressed={visible}
          aria-controls={inputId}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {visible ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}
