import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full bg-muted p-0.5 transition-colors duration-[180ms] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary motion-reduce:transition-none",
  {
    variants: {
      size: {
        sm: "h-4 w-[30px]",
        md: "h-5 w-9",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform duration-[180ms] data-[state=unchecked]:translate-x-0 motion-reduce:transition-none dark:bg-foreground",
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3.5",
        md: "size-4 data-[state=checked]:translate-x-4",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants> & {
    /** Clickable label shown after the track. */
    label?: React.ReactNode
  }

function Switch({ className, size, label, id, disabled, ...props }: SwitchProps) {
  const autoId = React.useId()
  const switchId = id ?? autoId

  const control = (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size ?? "md"}
      id={switchId}
      disabled={disabled}
      className={cn(switchVariants({ size }), label == null && className)}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={switchThumbVariants({ size })} />
    </SwitchPrimitive.Root>
  )

  if (label == null) return control

  return (
    <div
      data-slot="switch-field"
      className={cn("inline-flex items-center gap-2.5 text-sm text-foreground", className)}
    >
      {control}
      <label
        data-slot="switch-label"
        htmlFor={switchId}
        className="cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  )
}

export { Switch, switchVariants, type SwitchProps }
