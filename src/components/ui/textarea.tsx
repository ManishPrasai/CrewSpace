import { cn } from "cn"

// handoff/03-components.md: matches Input's states. field-sizing: content
// auto-grows the textarea (Chrome/Edge 123+); `rows` is the fallback for
// browsers that don't support it yet.
function Textarea({
  className,
  minRows = 4,
  maxRows = 16,
  style,
  ...props
}: React.ComponentProps<"textarea"> & { minRows?: number; maxRows?: number }) {
  return (
    <textarea
      data-slot="textarea"
      rows={minRows}
      className={cn(
        "w-full min-w-0 resize-none overflow-y-auto rounded-md border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-placeholder hover:border-input-hover focus:border-brand focus:ring-[3px] focus:ring-brand-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-inset disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm",
        className,
      )}
      style={{ fieldSizing: "content", maxHeight: `${maxRows * 1.6}em`, ...style } as React.CSSProperties}
      {...props}
    />
  )
}

export { Textarea }
