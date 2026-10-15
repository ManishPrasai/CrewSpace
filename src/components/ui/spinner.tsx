import { cn } from "cn"

// handoff/03-components.md: size 11-14, 2px border ring, 800ms. Respects
// prefers-reduced-motion via the slower duration set on .animate-spin in
// globals.css's reduced-motion media query.
function Spinner({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-70", className)}
      style={{ width: size, height: size, animationDuration: "800ms" }}
    />
  )
}

export { Spinner }
