import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Field: label, hint and error around any form control                       */
/* -------------------------------------------------------------------------- */

type FieldContextValue = {
  controlId: string
  labelId: string
  hintId?: string
  errorId?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

/** The surrounding Field, or null outside one. */
function useField() {
  return React.useContext(FieldContext)
}

type FieldControlOptions = {
  id?: string
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  "aria-describedby"?: string
}

/**
 * Wires a control to the surrounding Field: id for the label, described-by for
 * the hint and error, and the invalid, required and disabled states.
 */
function useFieldControl({
  id,
  invalid,
  required,
  disabled,
  "aria-describedby": describedBy,
}: FieldControlOptions = {}) {
  const field = useField()
  const isInvalid = Boolean(invalid || field?.invalid)
  return {
    id: id ?? field?.controlId,
    labelId: field?.labelId,
    describedBy: cn(describedBy, field?.hintId, field?.errorId) || undefined,
    invalid: isInvalid,
    required: required ?? field?.required ?? false,
    disabled: disabled ?? field?.disabled ?? false,
  }
}

const hasMessage = (error: unknown): error is React.ReactNode =>
  error != null && typeof error !== "boolean" && error !== ""

type FieldProps = React.ComponentProps<"div"> & {
  label?: React.ReactNode
  /** Help text below the control. Replaced by the error message when there is one. */
  hint?: React.ReactNode
  /** Error state; anything other than a boolean is also shown as the message. */
  error?: React.ReactNode | boolean
  /** Marks the label with an asterisk and the control as required. */
  required?: boolean
  /** Disables the control inside. */
  disabled?: boolean
  /** Id of the control, when it sets its own. Generated otherwise. */
  htmlFor?: string
}

function Field({
  className,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  htmlFor,
  children,
  ...props
}: FieldProps) {
  const autoId = React.useId()
  const controlId = htmlFor ?? `${autoId}-control`
  const showError = hasMessage(error)
  const showHint = !showError && hint != null
  const context: FieldContextValue = {
    controlId,
    labelId: `${autoId}-label`,
    hintId: showHint ? `${autoId}-hint` : undefined,
    errorId: showError ? `${autoId}-error` : undefined,
    invalid: Boolean(error),
    required,
    disabled,
  }

  return (
    <FieldContext.Provider value={context}>
      <div
        data-slot="field"
        data-invalid={context.invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn("flex w-full max-w-[340px] flex-col gap-1.5 text-left", className)}
        {...props}
      >
        {label != null && (
          <FieldLabel id={context.labelId} htmlFor={controlId} required={required}>
            {label}
          </FieldLabel>
        )}
        {children}
        {showHint && <FieldHint id={context.hintId}>{hint}</FieldHint>}
        {showError && <FieldError id={context.errorId}>{error}</FieldError>}
      </div>
    </FieldContext.Provider>
  )
}

function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label
      data-slot="field-label"
      className={cn("flex gap-1 text-[13.5px] font-medium text-foreground", className)}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
    </label>
  )
}

function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-hint"
      className={cn("text-[12.5px] text-muted-foreground/70", className)}
      {...props}
    />
  )
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      className={cn("text-[12.5px] text-destructive", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

const inputVariants = cva(
  "flex w-full cursor-text items-center gap-2 rounded-md border border-input bg-background px-3 text-muted-foreground/70 shadow-xs transition-[border-color,box-shadow] hover:border-[color-mix(in_oklab,var(--color-input)_60%,var(--color-muted-foreground))] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/40 data-invalid:border-destructive data-invalid:hover:border-destructive data-invalid:focus-within:border-destructive data-invalid:focus-within:ring-destructive/30 data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:opacity-70 data-disabled:hover:border-input motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-[38px]",
        lg: "h-11",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type InputProps = Omit<React.ComponentProps<"input">, "size" | "prefix"> &
  VariantProps<typeof inputVariants> & {
    /** Icon inside the start of the field. */
    leadingIcon?: React.ReactNode
    /** Icon or content inside the end of the field. */
    trailingIcon?: React.ReactNode
    /** Fixed text addon at the start, e.g. a URL scheme. */
    prefix?: React.ReactNode
    /** Fixed text addon at the end, e.g. a unit. */
    suffix?: React.ReactNode
    /** Error state; anything other than a boolean is also shown as the message. */
    error?: React.ReactNode | boolean
    /** Class for the inner <input>. `className` styles the visible box. */
    inputClassName?: string
  }

function Input({
  className,
  inputClassName,
  size,
  leadingIcon,
  trailingIcon,
  prefix,
  suffix,
  error,
  id,
  required,
  disabled,
  type = "text",
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const autoId = React.useId()
  const showMessage = hasMessage(error)
  const messageId = showMessage ? `${autoId}-message` : undefined
  const field = useFieldControl({
    id,
    invalid: Boolean(error),
    required,
    disabled,
    "aria-describedby": cn(ariaDescribedBy, messageId) || undefined,
  })

  const box = (
    <div
      data-slot="input-group"
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      className={cn(inputVariants({ size }), className)}
      onMouseDown={(event) => {
        // clicking the padding, icon or addon focuses the field
        const target = event.target as HTMLElement
        if (target.closest("input, button, a, [tabindex]")) return
        event.preventDefault()
        event.currentTarget.querySelector("input")?.focus()
      }}
    >
      {prefix != null && <InputAddon side="start">{prefix}</InputAddon>}
      {leadingIcon}
      <input
        data-slot="input"
        type={type}
        id={field.id}
        required={field.required || undefined}
        disabled={field.disabled || undefined}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        className={cn(
          "h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed",
          inputClassName
        )}
        {...props}
      />
      {trailingIcon}
      {suffix != null && <InputAddon side="end">{suffix}</InputAddon>}
    </div>
  )

  if (!showMessage) return box

  return (
    <div data-slot="input-with-message" className="flex w-full flex-col gap-1.5">
      {box}
      <FieldError id={messageId}>{error}</FieldError>
    </div>
  )
}

function InputAddon({
  className,
  side = "start",
  ...props
}: React.ComponentProps<"span"> & { side?: "start" | "end" }) {
  return (
    <span
      data-slot="input-addon"
      className={cn(
        "flex h-full shrink-0 items-center border-border text-sm whitespace-nowrap text-muted-foreground/70",
        side === "start" ? "border-r pr-2.5" : "border-l pl-2.5",
        className
      )}
      {...props}
    />
  )
}

export {
  Field,
  FieldLabel,
  FieldHint,
  FieldError,
  Input,
  InputAddon,
  inputVariants,
  useField,
  useFieldControl,
  type FieldProps,
  type InputProps,
}
