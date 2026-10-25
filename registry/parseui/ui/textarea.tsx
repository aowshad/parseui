import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldError, useFieldControl } from "@/registry/parseui/ui/input"

type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Grow height with content. */
  autoResize?: boolean
  /** Show a character count when maxLength is set. */
  showCount?: boolean
  /** Error state; anything other than a boolean is also shown as the message. */
  error?: React.ReactNode | boolean
}

function Textarea({
  className,
  autoResize = true,
  showCount = false,
  error,
  id,
  required,
  disabled,
  maxLength,
  value,
  defaultValue,
  onChange,
  ref,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const autoId = React.useId()
  const innerRef = React.useRef<HTMLTextAreaElement>(null)
  const [length, setLength] = React.useState(
    () => String(value ?? defaultValue ?? "").length
  )

  const showMessage = error != null && typeof error !== "boolean" && error !== ""
  const messageId = showMessage ? `${autoId}-message` : undefined
  const counting = showCount && maxLength != null
  const countId = counting ? `${autoId}-count` : undefined
  const field = useFieldControl({
    id,
    invalid: Boolean(error),
    required,
    disabled,
    "aria-describedby": cn(ariaDescribedBy, countId, messageId) || undefined,
  })

  const resize = React.useCallback(() => {
    const el = innerRef.current
    if (!el || !autoResize) return
    el.style.height = "auto"
    // + border, so the last line is never clipped
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`
  }, [autoResize])

  React.useLayoutEffect(() => {
    if (value !== undefined) setLength(String(value).length)
    resize()
  }, [value, resize])

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const control = (
    <textarea
      data-slot="textarea"
      ref={setRefs}
      id={field.id}
      required={field.required || undefined}
      disabled={field.disabled || undefined}
      aria-invalid={field.invalid || undefined}
      aria-describedby={field.describedBy}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        setLength(event.target.value.length)
        resize()
        onChange?.(event)
      }}
      className={cn(
        "block min-h-24 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-normal text-foreground shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/70 hover:border-[color-mix(in_oklab,var(--color-input)_60%,var(--color-muted-foreground))] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30 motion-reduce:transition-none",
        autoResize ? "resize-none overflow-hidden" : "resize-y",
        className
      )}
      {...props}
    />
  )

  if (!counting && !showMessage) return control

  return (
    <div data-slot="textarea-group" className="flex w-full flex-col gap-1.5">
      {control}
      {(counting || showMessage) && (
        <div className="flex items-start gap-3">
          {showMessage && <FieldError id={messageId}>{error}</FieldError>}
          {counting && (
            <p
              data-slot="textarea-count"
              id={countId}
              className={cn(
                "ml-auto shrink-0 text-[12.5px] text-muted-foreground/70 tabular-nums",
                length >= maxLength && "text-destructive"
              )}
            >
              {length}/{maxLength}
              <span className="sr-only"> characters</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export { Textarea, type TextareaProps }
