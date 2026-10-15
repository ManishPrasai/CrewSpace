"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"

// handoff/03-components.md: underline·segmented variants, arrow-key
// tablist semantics (built into base-ui's Tabs).
function Tabs({ ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

function TabsList({
  className,
  variant = "underline",
  ...props
}: TabsPrimitive.List.Props & { variant?: "underline" | "segmented" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "relative flex",
        variant === "underline" && "gap-5 border-b border-border",
        variant === "segmented" && "gap-1 rounded-lg bg-muted p-1",
        className,
      )}
      {...props}
    />
  )
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "relative px-1 py-2.5 text-[14px] font-medium text-muted-foreground outline-none transition-colors",
        "data-[selected]:text-foreground",
        "in-data-[variant=segmented]:rounded-md in-data-[variant=segmented]:px-3 in-data-[variant=segmented]:py-1.5 in-data-[variant=segmented]:data-[selected]:bg-background in-data-[variant=segmented]:data-[selected]:shadow-raised",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

function TabsIndicator({ className, ...props }: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        "absolute bottom-0 left-0 h-[2px] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] bg-brand transition-all duration-[160ms]",
        className,
      )}
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("pt-4 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel }
