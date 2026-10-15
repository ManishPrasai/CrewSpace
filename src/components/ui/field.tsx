import { cloneElement, isValidElement } from "react"
import { cn } from "cn"

// handoff/03-components.md: label 13/500, 6px gap; the error replaces
// the hint. role="alert" + aria-describedby wire the field to its error
// for screen readers - threaded onto the single form-control child via
// cloneElement so every call site doesn't have to repeat it.
function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
  className?: string;
}) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: htmlFor,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error),
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      {control}
      {error ? (
        <p id={describedBy} role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export { Field }
