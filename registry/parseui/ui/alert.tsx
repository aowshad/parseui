import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "flex w-full gap-3 rounded-lg border px-4 py-3.5 text-left text-sm leading-[1.6] shadow-xs",
  {
    variants: {
      color: {
        info: "border-info/22 bg-info-soft [&>[data-slot=alert-icon]]:text-info",
        success: "border-success/22 bg-success-soft [&>[data-slot=alert-icon]]:text-success",
        warning: "border-warning/25 bg-warning-soft [&>[data-slot=alert-icon]]:text-warning",
        danger:
          "border-destructive/22 bg-destructive-soft [&>[data-slot=alert-icon]]:text-destructive",
      },
    },
    defaultVariants: { color: "info" },
  }
)

const ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleX } as const

type AlertProps = Omit<React.ComponentProps<"div">, "color" | "title"> &
  VariantProps<typeof alertVariants> & {
    /** Bold first line. */
    title?: React.ReactNode
    /** Buttons or links below the text. */
    actions?: React.ReactNode
    /** Replaces the color's default icon. Pass `null` to hide it. */
    icon?: React.ReactNode
    /** Shows a close button that calls this. */
    onDismiss?: () => void
    /** Accessible name of the close button. */
    dismissLabel?: string
  }

function Alert({
  className,
  color,
  title,
  actions,
  icon,
  onDismiss,
  dismissLabel = "Dismiss",
  role,
  children,
  ...props
}: AlertProps) {
  const resolved = color ?? "info"
  const Icon = ICONS[resolved]
  const urgent = resolved === "danger" || resolved === "warning"

  return (
    <div
      data-slot="alert"
      data-color={resolved}
      role={role ?? (urgent ? "alert" : "status")}
      className={cn(alertVariants({ color: resolved }), className)}
      {...props}
    >
      {icon !== null && (
        <span
          data-slot="alert-icon"
          aria-hidden
          className="mt-0.5 flex shrink-0 [&_svg]:size-4 [&_svg]:stroke-[1.8]"
        >
          {icon ?? <Icon />}
        </span>
      )}
      <div data-slot="alert-content" className="min-w-0 flex-1 text-muted-foreground">
        {title != null && <AlertTitle>{title}</AlertTitle>}
        {children != null && <AlertDescription>{children}</AlertDescription>}
        {actions != null && <AlertActions>{actions}</AlertActions>}
      </div>
      {onDismiss && (
        <button
          type="button"
          data-slot="alert-dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="mt-0.5 inline-grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-sm text-muted-foreground/70 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-4"
        >
          <X aria-hidden />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("mb-0.5 font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn(className)} {...props} />
}

function AlertActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-actions"
      className={cn("mt-2.5 flex flex-wrap items-center gap-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertActions, alertVariants, type AlertProps }
