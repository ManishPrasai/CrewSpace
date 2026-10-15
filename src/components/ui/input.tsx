import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

const inputBase =
  "w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-placeholder hover:border-input-hover focus:border-brand focus:ring-[3px] focus:ring-brand-soft read-only:bg-inset disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-inset disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm"

// handoff/03-components.md: size default 40 · lg 42/44. `prefix` renders
// a fixed slug-style label (e.g. "crewspace.app/") inside the field.
function Input({
  className,
  type,
  size = "default",
  prefix,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & { size?: "default" | "lg"; prefix?: string }) {
  const heightClass = size === "lg" ? "h-11" : "h-10";

  if (prefix) {
    return (
      <div
        className={cn(
          inputBase,
          heightClass,
          "flex items-center gap-1 py-0 has-[input:disabled]:opacity-50",
          className,
        )}
      >
        <span className="shrink-0 text-placeholder">{prefix}</span>
        <InputPrimitive
          type={type}
          data-slot="input"
          className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 outline-none"
          {...props}
        />
      </div>
    );
  }

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputBase, heightClass, className)}
      {...props}
    />
  )
}

export { Input }
