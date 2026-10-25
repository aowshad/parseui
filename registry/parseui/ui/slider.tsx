import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Field, useField } from "@/registry/parseui/ui/input"

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Renders a Field label with the current value at its end. */
  label?: React.ReactNode
  hint?: React.ReactNode
  /** Format the value label and the screen-reader value text. */
  formatValue?: (value: number) => string
  /** Show the formatted value next to the label. Defaults to true when there is a label. */
  showValue?: boolean
  /** Accessible names for each thumb, e.g. ["Minimum", "Maximum"] for a range. */
  thumbLabels?: string[]
}

function Slider({
  className,
  label,
  hint,
  formatValue,
  showValue,
  thumbLabels,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const [internal, setInternal] = React.useState<number[]>(
    () => defaultValue ?? [min]
  )
  const current = value ?? internal
  const format = formatValue ?? ((v: number) => String(v))

  const handleChange = (next: number[]) => {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  const control = (
    <SliderControl
      className={label == null && hint == null ? className : undefined}
      value={value}
      defaultValue={value === undefined ? (defaultValue ?? [min]) : undefined}
      onValueChange={handleChange}
      min={min}
      max={max}
      thumbCount={current.length}
      formatValue={format}
      current={current}
      thumbLabels={thumbLabels}
      {...props}
    />
  )

  if (label == null && hint == null) return control

  const output = showValue ?? label != null
  return (
    <Field
      className={className}
      hint={hint}
      label={
        label != null ? (
          <>
            {label}
            {output && (
              <span
                data-slot="slider-value"
                aria-hidden
                className="ml-auto text-muted-foreground/70 tabular-nums"
              >
                {current.map(format).join(" – ")}
              </span>
            )}
          </>
        ) : undefined
      }
    >
      {control}
    </Field>
  )
}

function SliderControl({
  className,
  thumbCount,
  formatValue,
  current,
  thumbLabels,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  thumbCount: number
  formatValue: (value: number) => string
  current: number[]
  thumbLabels?: string[]
}) {
  // the thumbs are the focusable parts, so the field label names each of them
  const field = useField()
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      disabled={props.disabled ?? field?.disabled}
      className={cn(
        "relative flex w-full max-w-[320px] touch-none items-center py-1.5 select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-1.5 data-[orientation=vertical]:py-0",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow cursor-pointer overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => {
        const name = thumbLabels?.[i] ?? (ariaLabel && thumbCount === 1 ? ariaLabel : undefined)
        return (
          <SliderPrimitive.Thumb
            key={i}
            data-slot="slider-thumb"
            aria-label={name ?? (ariaLabel ? `${ariaLabel} ${i + 1}` : undefined)}
            aria-labelledby={name || ariaLabel ? undefined : field?.labelId}
            aria-describedby={cn(field?.hintId, field?.errorId) || undefined}
            aria-valuetext={current[i] !== undefined ? formatValue(current[i]) : undefined}
            className="block size-[18px] shrink-0 cursor-grab rounded-full border-2 border-primary bg-background shadow-sm transition-[box-shadow] outline-none focus-visible:ring-4 focus-visible:ring-ring/40 active:cursor-grabbing data-disabled:cursor-not-allowed motion-reduce:transition-none"
          />
        )
      })}
    </SliderPrimitive.Root>
  )
}

export { Slider, type SliderProps }
