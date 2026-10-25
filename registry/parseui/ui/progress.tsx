"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva("relative w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    size: {
      sm: "h-[5px]",
      md: "h-2",
    },
  },
  defaultVariants: { size: "md" },
})

function percent(value: number, max: number) {
  if (!Number.isFinite(value) || max <= 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

type ProgressProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> &
  VariantProps<typeof progressVariants> & {
    /** 0 to `max` (100 by default). */
    value?: number
    /** Visible label above the bar. Also names the progressbar. */
    label?: React.ReactNode
    /** Show the percentage above the bar. */
    showValue?: boolean
  }

function Progress({
  className,
  size,
  value = 0,
  max = 100,
  label,
  showValue = false,
  "aria-labelledby": labelledBy,
  ...props
}: ProgressProps) {
  const labelId = React.useId()
  const pct = percent(value, max)
  const hasHeader = label != null || showValue

  const bar = (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={Math.min(Math.max(value, 0), max)}
      max={max}
      aria-labelledby={labelledBy ?? (label != null ? labelId : undefined)}
      className={cn(progressVariants({ size }), !hasHeader && className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full rounded-[inherit] bg-primary transition-[width] duration-400 ease-out motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </ProgressPrimitive.Root>
  )

  if (!hasHeader) return bar

  return (
    <div data-slot="progress-field" className={cn("flex w-full flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-[13.5px]">
        {label != null && (
          <span id={labelId} data-slot="progress-label" className="font-medium text-foreground">
            {label}
          </span>
        )}
        {showValue && (
          <span
            data-slot="progress-value"
            aria-hidden
            className="ml-auto text-muted-foreground/70 tabular-nums"
          >
            {Math.round(pct)}%
          </span>
        )}
      </div>
      {bar}
    </div>
  )
}

type ProgressRingProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> & {
  value?: number
  /** Diameter in px. */
  size?: number
  /** Ring thickness in px. Defaults to 10% of the diameter. */
  thickness?: number
  /** Show the percentage in the middle. */
  showValue?: boolean
}

function ProgressRing({
  className,
  value = 0,
  max = 100,
  size = 64,
  thickness,
  showValue = true,
  style,
  ...props
}: ProgressRingProps) {
  const pct = percent(value, max)
  const stroke = thickness ?? size * 0.1
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  return (
    <ProgressPrimitive.Root
      data-slot="progress-ring"
      value={Math.min(Math.max(value, 0), max)}
      max={max}
      className={cn(
        "relative inline-grid shrink-0 place-items-center text-sm font-semibold text-foreground",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${size} ${size}`}
        className="col-start-1 row-start-1 size-full -rotate-90"
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <ProgressPrimitive.Indicator asChild>
          <circle
            data-slot="progress-ring-indicator"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            className="stroke-primary transition-[stroke-dashoffset] duration-400 ease-out motion-reduce:transition-none"
          />
        </ProgressPrimitive.Indicator>
      </svg>
      {showValue && (
        <span aria-hidden className="col-start-1 row-start-1 tabular-nums">
          {Math.round(pct)}%
        </span>
      )}
    </ProgressPrimitive.Root>
  )
}

export { Progress, ProgressRing, progressVariants, type ProgressProps, type ProgressRingProps }
