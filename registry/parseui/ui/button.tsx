import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent font-medium transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-xs inset-shadow-[0_1px_0_rgb(255_255_255/0.14)] hover:bg-primary-hover",
        secondary:
          "border-input bg-background text-foreground shadow-xs hover:bg-muted/60",
        soft: "bg-primary-soft text-primary-text hover:bg-primary-soft-hover",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        danger:
          "bg-destructive text-white shadow-xs hover:bg-destructive-hover",
        link: "h-auto! border-0 px-0! text-primary-text underline-offset-[3px] hover:underline",
      },
      size: {
        xs: "h-7 rounded-sm px-2.5 text-[13px]",
        sm: "h-8 px-3 text-[13.5px]",
        md: "h-9 px-3.5 text-sm",
        lg: "h-11 px-4.5 text-[15px]",
      },
      iconOnly: { true: "px-0" },
      fullWidth: { true: "w-full" },
    },
    compoundVariants: [
      { iconOnly: true, size: "xs", class: "w-7" },
      { iconOnly: true, size: "sm", class: "w-8" },
      { iconOnly: true, size: "md", class: "w-9" },
      { iconOnly: true, size: "lg", class: "w-11" },
    ],
    defaultVariants: { variant: "primary", size: "md" },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    leadingIcon?: React.ReactNode
    trailingIcon?: React.ReactNode
  }

function Button({
  className,
  variant,
  size,
  iconOnly,
  fullWidth,
  asChild = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  type,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "primary"}
      type={asChild ? undefined : (type ?? "button")}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      className={cn(buttonVariants({ variant, size, iconOnly, fullWidth }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 aria-hidden className="animate-spin" /> : leadingIcon}
          {children}
          {!loading && trailingIcon}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants, type ButtonProps }
