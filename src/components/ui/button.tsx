import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// handoff/03-components.md: variant default·outline·ghost·destructive·
// destructiveSolid·link (secondary is an alias for outline). Destructive
// defaults to the soft style in context; destructiveSolid is reserved
// for a ConfirmDialog's final confirm (handoff/02-visual-design-spec.md).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:text-disabled-foreground aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-busy:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border-input bg-background hover:bg-muted hover:border-input-hover aria-expanded:bg-muted",
        secondary: "border-input bg-background hover:bg-muted hover:border-input-hover aria-expanded:bg-muted",
        ghost: "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent",
        destructive: "bg-destructive-soft text-destructive hover:bg-destructive/15",
        destructiveSolid: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-brand-ink underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-9 gap-1.5 px-3",
        lg: "h-11 gap-2 rounded-lg px-4 text-[0.95rem]",
        icon: "size-9",
        "icon-xs": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
