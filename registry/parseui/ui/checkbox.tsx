import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** Clickable label shown next to the box. */
  label?: React.ReactNode
  /** Secondary text below the label. */
  description?: React.ReactNode
}

function Checkbox({
  className,
  label,
  description,
  id,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const autoId = React.useId()
  const boxId = id ?? autoId
  const descriptionId = `${boxId}-description`
  const labelled = label != null || description != null

  const box = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      id={boxId}
      disabled={disabled}
      aria-describedby={
        cn(ariaDescribedBy, description != null && descriptionId) || undefined
      }
      className={cn(
        "inline-flex size-[17px] shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--radius)*0.5)] border border-input bg-background text-primary-foreground shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary motion-reduce:transition-none",
        labelled ? "mt-0.5" : className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator flex items-center justify-center"
      >
        <Check
          aria-hidden
          strokeWidth={3.2}
          className="size-3 group-data-[state=indeterminate]/indicator:hidden"
        />
        <Minus
          aria-hidden
          strokeWidth={3.2}
          className="hidden size-3 group-data-[state=indeterminate]/indicator:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!labelled) return box

  return (
    <div
      data-slot="checkbox-field"
      data-disabled={disabled || undefined}
      className={cn("group/checkbox flex items-start gap-2.5 text-left text-sm", className)}
    >
      {box}
      <div className="grid">
        {label != null && (
          <label
            data-slot="checkbox-label"
            htmlFor={boxId}
            className={cn(
              "cursor-pointer text-foreground group-data-disabled/checkbox:cursor-not-allowed group-data-disabled/checkbox:opacity-50",
              description != null && "font-medium"
            )}
          >
            {label}
          </label>
        )}
        {description != null && (
          <span
            data-slot="checkbox-description"
            id={descriptionId}
            className="text-[13px] text-muted-foreground/70 group-data-disabled/checkbox:opacity-50"
          >
            {description}
          </span>
        )}
      </div>
    </div>
  )
}

export { Checkbox, type CheckboxProps }
