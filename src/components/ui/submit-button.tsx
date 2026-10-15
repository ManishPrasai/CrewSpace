"use client";

import { useFormStatus } from "react-dom";
import { Button, type buttonVariants } from "./button";
import { Spinner } from "./spinner";
import type { VariantProps } from "class-variance-authority";

// handoff/03-components.md: reads useFormStatus() so every form drops
// its own `pending`-state plumbing. pendingLabel keeps this session's
// existing copy ("Posting...", "Saving...", "Redirecting...", etc.)
// rather than a generic "Loading...".
function SubmitButton({
  children,
  pendingLabel,
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    pendingLabel?: React.ReactNode;
  }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending || props.disabled}
      aria-busy={pending}
      {...props}
    >
      {pending && <Spinner size={14} />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}

export { SubmitButton };
