import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-[22px] w-fit shrink-0 items-center gap-[5px] whitespace-nowrap rounded-sm border border-transparent px-2 text-xs leading-none font-medium [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      color: {
        gray: "",
        brand: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
      },
      variant: {
        soft: "",
        outline: "bg-background",
        solid: "",
      },
      shape: {
        rounded: "rounded-sm",
        pill: "rounded-full",
      },
    },
    compoundVariants: [
      // soft
      { variant: "soft", color: "gray", class: "bg-muted text-muted-foreground" },
      { variant: "soft", color: "brand", class: "bg-primary-soft text-primary-text" },
      { variant: "soft", color: "success", class: "bg-success-soft text-success" },
      { variant: "soft", color: "warning", class: "bg-warning-soft text-warning" },
      { variant: "soft", color: "danger", class: "bg-destructive-soft text-destructive" },
      { variant: "soft", color: "info", class: "bg-info-soft text-info" },
      // outline
      { variant: "outline", color: "gray", class: "border-input text-muted-foreground" },
      { variant: "outline", color: "brand", class: "border-primary/35 text-primary-text" },
      { variant: "outline", color: "success", class: "border-success/35 text-success" },
      { variant: "outline", color: "warning", class: "border-warning/40 text-warning" },
      { variant: "outline", color: "danger", class: "border-destructive/35 text-destructive" },
      { variant: "outline", color: "info", class: "border-info/35 text-info" },
      // solid
      { variant: "solid", color: "gray", class: "bg-foreground text-background" },
      { variant: "solid", color: "brand", class: "bg-primary text-primary-foreground" },
      { variant: "solid", color: "success", class: "bg-success text-background" },
      { variant: "solid", color: "warning", class: "bg-warning text-background" },
      { variant: "solid", color: "danger", class: "bg-destructive text-white" },
      { variant: "solid", color: "info", class: "bg-info text-background" },
    ],
    defaultVariants: { color: "gray", variant: "soft", shape: "rounded" },
  }
)

type BadgeProps = Omit<React.ComponentProps<"span">, "color"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /** Leading status dot in the current text color. */
    dot?: boolean
  }

function Badge({
  className,
  color,
  variant,
  shape,
  dot = false,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"
  // The site's "solid" badge with no color is the brand fill.
  const resolvedColor = color ?? (variant === "solid" ? "brand" : "gray")

  return (
    <Comp
      data-slot="badge"
      data-color={resolvedColor}
      data-variant={variant ?? "soft"}
      className={cn(badgeVariants({ color: resolvedColor, variant, shape }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {dot && (
            <span
              data-slot="badge-dot"
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-current"
            />
          )}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Badge, badgeVariants, type BadgeProps }
