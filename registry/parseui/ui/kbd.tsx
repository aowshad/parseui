import * as React from "react"

import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-block min-w-[22px] rounded-[5px] border border-input bg-background px-1.5 py-1 text-center font-mono text-xs leading-none font-medium text-muted-foreground shadow-[0_1px_0_var(--color-input)] select-none [&_svg]:inline-block [&_svg]:size-3 [&_svg]:align-[-1px]",
        className
      )}
      {...props}
    />
  )
}

/** Lays out the keys of one shortcut, e.g. ⌘ K. */
function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1 font-sans", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
