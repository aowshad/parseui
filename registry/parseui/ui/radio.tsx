import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { useField } from "@/registry/parseui/ui/input"

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>

function RadioGroup({
  className,
  orientation = "vertical",
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioGroupProps) {
  // inside a Field, the field label names the group and its hint describes it
  const field = useField()
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      orientation={orientation}
      aria-labelledby={ariaLabelledBy ?? (props["aria-label"] ? undefined : field?.labelId)}
      aria-describedby={cn(ariaDescribedBy, field?.hintId, field?.errorId) || undefined}
      aria-invalid={field?.invalid || undefined}
      aria-required={props.required ?? field?.required}
      disabled={props.disabled ?? field?.disabled}
      className={cn(
        "flex gap-3",
        orientation === "horizontal" ? "flex-row flex-wrap gap-x-6" : "flex-col",
        className
      )}
      {...props}
    />
  )
}

type RadioProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  /** Clickable label shown next to the circle. */
  label?: React.ReactNode
  /** Secondary text below the label. */
  description?: React.ReactNode
}

function Radio({
  className,
  label,
  description,
  id,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioProps) {
  const autoId = React.useId()
  const itemId = id ?? autoId
  const descriptionId = `${itemId}-description`
  const labelled = label != null || description != null

  const item = (
    <RadioGroupPrimitive.Item
      data-slot="radio"
      id={itemId}
      disabled={disabled}
      aria-describedby={
        cn(ariaDescribedBy, description != null && descriptionId) || undefined
      }
      className={cn(
        "size-[17px] shrink-0 cursor-pointer rounded-full border border-input bg-background shadow-xs transition-[border-color,border-width] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-[5px] data-[state=checked]:border-primary motion-reduce:transition-none",
        labelled ? "mt-0.5" : className
      )}
      {...props}
    />
  )

  if (!labelled) return item

  return (
    <div
      data-slot="radio-field"
      data-disabled={disabled || undefined}
      className={cn("group/radio flex items-start gap-2.5 text-left text-sm", className)}
    >
      {item}
      <div className="grid">
        {label != null && (
          <label
            data-slot="radio-label"
            htmlFor={itemId}
            className={cn(
              "cursor-pointer text-foreground group-data-disabled/radio:cursor-not-allowed group-data-disabled/radio:opacity-50",
              description != null && "font-medium"
            )}
          >
            {label}
          </label>
        )}
        {description != null && (
          <span
            data-slot="radio-description"
            id={descriptionId}
            className="text-[13px] text-muted-foreground/70 group-data-disabled/radio:opacity-50"
          >
            {description}
          </span>
        )}
      </div>
    </div>
  )
}

export { RadioGroup, Radio, type RadioGroupProps, type RadioProps }
