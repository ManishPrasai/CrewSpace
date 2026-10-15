import { cn } from "cn"

const toneClasses = {
  info: "bg-brand-soft text-brand-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-destructive-soft text-destructive",
} as const;

// handoff/03-components.md: inline alert above the submit button for
// form-level errors. role="alert" for error/warning (interrupts),
// role="status" for info/success (announced politely).
function FormAlert({
  tone,
  children,
  className,
}: {
  tone: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn("rounded-md px-3 py-2 text-[13.5px] leading-snug", toneClasses[tone], className)}
    >
      {children}
    </p>
  )
}

export { FormAlert }
