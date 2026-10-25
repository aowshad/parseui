import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Field, useFieldControl } from "@/registry/parseui/ui/input"

/* -------------------------------------------------------------------------- */
/* Parts                                                                      */
/* -------------------------------------------------------------------------- */

const selectTriggerVariants = cva(
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background pr-2.5 pl-3 text-left text-foreground shadow-xs transition-[border-color,box-shadow] outline-none hover:border-[color-mix(in_oklab,var(--color-input)_60%,var(--color-muted-foreground))] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30 data-placeholder:text-muted-foreground/70 motion-reduce:transition-none [&>span]:truncate [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 text-[13.5px]",
        md: "h-[38px] text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const SelectRoot = SelectPrimitive.Root

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden className="size-4 text-muted-foreground/70" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={position === "popper" ? sideOffset : undefined}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[state=open]:duration-150 data-[state=closed]:duration-100 motion-reduce:animate-none",
          position === "popper" &&
            "max-h-[min(var(--radix-select-content-available-height),20rem)] w-full min-w-(--radix-select-trigger-width)",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton
          data-slot="select-scroll-up-button"
          className="flex h-6 cursor-default items-center justify-center text-muted-foreground"
        >
          <ChevronUp aria-hidden className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport data-slot="select-viewport" className="p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton
          data-slot="select-scroll-down-button"
          className="flex h-6 cursor-default items-center justify-center text-muted-foreground"
        >
          <ChevronDown aria-hidden className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-[7px] pr-2.5 pl-2.5 text-sm text-foreground outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="grid w-4 shrink-0 place-items-center">
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden className="text-primary-text" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2.5 pt-2 pb-1 text-xs font-medium text-muted-foreground/70", className)}
      {...props}
    />
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Select: root + trigger + content in one                                    */
/* -------------------------------------------------------------------------- */

type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root> &
  VariantProps<typeof selectTriggerVariants> & {
    /** Renders a Field label above the trigger. */
    label?: React.ReactNode
    hint?: React.ReactNode
    /** Error state; anything other than a boolean is also shown as the message. */
    error?: React.ReactNode | boolean
    /** Shown when no value is selected. */
    placeholder?: string
    id?: string
    className?: string
    triggerClassName?: string
    contentClassName?: string
    "aria-label"?: string
    "aria-describedby"?: string
  }

function Select(props: SelectProps) {
  const { label, hint, error, required, disabled, className } = props
  if (label != null || hint != null || (error != null && typeof error !== "boolean")) {
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={required}
        disabled={disabled}
        htmlFor={props.id}
        className={className}
      >
        <SelectControl {...props} className={undefined} />
      </Field>
    )
  }
  return <SelectControl {...props} />
}

function SelectControl({
  size,
  label: _label,
  hint: _hint,
  error,
  placeholder,
  id,
  className,
  triggerClassName,
  contentClassName,
  required,
  disabled,
  children,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...rootProps
}: SelectProps) {
  const field = useFieldControl({
    id,
    invalid: Boolean(error),
    required,
    disabled,
    "aria-describedby": ariaDescribedBy,
  })

  return (
    <SelectPrimitive.Root
      required={field.required}
      disabled={field.disabled}
      {...rootProps}
    >
      <SelectTrigger
        id={field.id}
        size={size}
        aria-label={ariaLabel}
        aria-invalid={field.invalid || undefined}
        aria-required={field.required || undefined}
        aria-describedby={field.describedBy}
        className={cn(className, triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>{children}</SelectContent>
    </SelectPrimitive.Root>
  )
}

export {
  Select,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  selectTriggerVariants,
  type SelectProps,
}
