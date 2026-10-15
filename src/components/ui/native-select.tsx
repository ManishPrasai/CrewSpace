import { cn } from "cn"

// handoff/03-components.md: replaces the unstyled <select>. Stays native
// (not a listbox-pattern component) for no-JS forms and mobile.
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-10 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-3 pr-9 text-base transition-colors outline-none hover:border-input-hover focus:border-brand focus:ring-[3px] focus:ring-brand-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-inset disabled:opacity-50 md:text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export { NativeSelect }
