import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import {
  DayPicker,
  type DayButtonProps,
  type DayProps,
  type Formatters,
  type Labels,
  type Matcher,
} from "react-day-picker"
import { addMonths, isSameDay, startOfDay, startOfMonth } from "date-fns"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/registry/parseui/ui/button"

/* -------------------------------------------------------------------------- */
/* Intl formatting                                                            */
/* -------------------------------------------------------------------------- */

function createFormat(locale?: string) {
  const make = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options)
  const month = make({ month: "long", year: "numeric" })
  const long = make({ weekday: "long", month: "long", day: "numeric", year: "numeric" })
  const short = make({ month: "short", day: "numeric", year: "numeric" })
  const weekday = make({ weekday: "short" })
  const weekdayLong = make({ weekday: "long" })
  const day = make({ day: "numeric" })

  const formatters: Partial<Formatters> = {
    formatCaption: (date) => month.format(date),
    formatDay: (date) => day.format(date),
    // Two letters, like the site: "Su Mo Tu". The full name is the column's label.
    formatWeekdayName: (date) => weekday.format(date).slice(0, 2),
  }
  const labels: Partial<Labels> = {
    labelGrid: (date) => month.format(date),
    labelWeekday: (date) => weekdayLong.format(date),
    labelDayButton: (date, modifiers) =>
      `${modifiers.today ? "Today, " : ""}${long.format(date)}${modifiers.selected ? ", selected" : ""}`,
    labelPrevious: () => "Previous month",
    labelNext: () => "Next month",
  }

  return {
    formatters,
    labels,
    long: (d: Date) => long.format(d),
    short: (d: Date) => short.format(d),
    range: (a?: Date, b?: Date) =>
      a && b ? short.formatRange(a, b) : a ? `${short.format(a)} – …` : "",
  }
}

/* -------------------------------------------------------------------------- */
/* Calendar                                                                   */
/* -------------------------------------------------------------------------- */

function CalendarDay({ day: _day, modifiers, className, ...props }: DayProps) {
  // Data attributes drive the range band that sits behind the day buttons.
  const end = modifiers.range_end
  const start = modifiers.range_start
  return (
    <td
      data-range-start={(start && !end) || undefined}
      data-range-end={(end && !start) || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      className={cn(
        "p-0 py-px text-center data-range-middle:bg-primary-soft data-range-start:bg-[linear-gradient(90deg,transparent_50%,var(--color-primary-soft)_50%)] data-range-end:bg-[linear-gradient(90deg,var(--color-primary-soft)_50%,transparent_50%)]",
        className
      )}
      {...props}
    />
  )
}

function CalendarDayButton({
  day: _day,
  modifiers,
  className,
  disabled,
  "aria-disabled": ariaDisabled,
  ...props
}: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const state = modifiers.range_middle
    ? "range-middle"
    : modifiers.selected
      ? "selected"
      : undefined

  return (
    <button
      ref={ref}
      data-slot="calendar-day"
      data-state={state}
      data-today={modifiers.today || undefined}
      // Disabled days stay in the accessibility tree as aria-disabled; DayPicker ignores clicks on them.
      aria-disabled={disabled || ariaDisabled || undefined}
      aria-current={modifiers.today ? "date" : undefined}
      className={cn(
        "relative grid size-9 cursor-pointer place-items-center rounded-md p-0 text-sm text-foreground tabular-nums outline-none hover:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
        "data-today:font-semibold data-today:after:absolute data-today:after:bottom-[5px] data-today:after:left-1/2 data-today:after:-ml-0.5 data-today:after:size-1 data-today:after:rounded-full data-today:after:bg-primary",
        "data-[state=selected]:bg-primary data-[state=selected]:font-medium data-[state=selected]:text-primary-foreground data-[state=selected]:after:bg-primary-foreground",
        "data-[state=range-middle]:rounded-none data-[state=range-middle]:bg-transparent data-[state=range-middle]:text-primary-text",
        "aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground/70 aria-disabled:opacity-55 aria-disabled:hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function CalendarChevron({
  orientation,
  className,
}: {
  orientation?: "up" | "down" | "left" | "right"
  className?: string
}) {
  const Icon = orientation === "left" ? ChevronLeft : orientation === "right" ? ChevronRight : ChevronDown
  return <Icon aria-hidden className={cn("size-4", className)} />
}

type CalendarProps = React.ComponentProps<typeof DayPicker>

/** Month grid on react-day-picker, styled like the ParseUI date picker. */
function Calendar({ className, classNames, components, ...props }: CalendarProps) {
  const navButton = cn(
    buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }),
    "row-start-1 aria-disabled:pointer-events-none aria-disabled:opacity-50"
  )

  return (
    <DayPicker
      data-slot="calendar"
      navLayout="around"
      className={cn("w-fit", className)}
      classNames={{
        months: "flex gap-6",
        month: "grid grid-cols-[32px_1fr_32px] content-start items-center gap-y-1.5",
        month_caption: "col-start-2 row-start-1 flex h-8 items-center justify-center",
        caption_label: "text-sm font-semibold",
        button_previous: cn(navButton, "col-start-1"),
        button_next: cn(navButton, "col-start-3"),
        chevron: "size-4",
        month_grid: "col-span-3 row-start-2 border-collapse",
        weekday: "h-7 w-9 p-0 text-center text-xs font-medium text-muted-foreground/70",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Day: CalendarDay,
        DayButton: CalendarDayButton,
        Chevron: CalendarChevron,
        ...components,
      }}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* DatePicker                                                                 */
/* -------------------------------------------------------------------------- */

type DateRangeValue = [Date, Date]

type DatePickerPreset = {
  label: string
  range: () => DateRangeValue
}

type DatePickerBaseProps = {
  /** Visible label. Also names the calendar dialog. */
  label?: React.ReactNode
  /** Help text under the trigger. */
  description?: React.ReactNode
  /** Trigger text while nothing is chosen. */
  placeholder?: string
  /** Earliest selectable date. Earlier days are aria-disabled. */
  min?: Date
  /** Latest selectable date. */
  max?: Date
  /** Disable individual days, e.g. weekends. */
  disabled?: (date: Date) => boolean
  /** First day of the week. 0 is Sunday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Months shown side by side. Two months become one on narrow screens. */
  numberOfMonths?: 1 | 2
  /** Passed to Intl.DateTimeFormat for month, weekday and date labels. */
  locale?: string
  /** Render the calendar without a popover. */
  inline?: boolean
  /** Accessible name when there is no visible label. */
  "aria-label"?: string
  id?: string
  className?: string
}

type DatePickerSingleProps = DatePickerBaseProps & {
  mode?: "single"
  value?: Date | null
  defaultValue?: Date | null
  /** Called when a date is chosen. */
  onValueChange?: (value: Date) => void
  presets?: never
}

type DatePickerRangeProps = DatePickerBaseProps & {
  mode: "range"
  value?: DateRangeValue | null
  defaultValue?: DateRangeValue | null
  /** Called when a range is applied. */
  onValueChange?: (value: DateRangeValue) => void
  /** Quick ranges shown beside the calendar. */
  presets?: DatePickerPreset[]
}

type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

type Draft = { from?: Date; to?: Date }

const NARROW_QUERY = "(min-width: 801px)"

function useWideScreen() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(NARROW_QUERY)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => true
  )
}

function DatePicker(props: DatePickerProps) {
  const {
    label,
    description,
    placeholder,
    min,
    max,
    disabled,
    weekStartsOn = 0,
    numberOfMonths = 1,
    locale,
    inline = false,
    id,
    className,
    "aria-label": ariaLabel,
  } = props
  const isRange = props.mode === "range"
  const presets = (isRange && props.presets) || []

  const autoId = React.useId()
  const baseId = id ?? autoId
  const labelId = `${baseId}-label`
  const triggerId = `${baseId}-trigger`
  const descriptionId = `${baseId}-description`

  const fmt = React.useMemo(() => createFormat(locale), [locale])
  const wide = useWideScreen()
  const months = numberOfMonths === 2 && wide ? 2 : 1

  // Controlled or uncontrolled value.
  const [innerValue, setInnerValue] = React.useState<Date | DateRangeValue | null>(
    props.defaultValue ?? null
  )
  const value = props.value !== undefined ? props.value : innerValue
  const single = !isRange ? ((value as Date | null) ?? undefined) : undefined
  const range = isRange ? ((value as DateRangeValue | null) ?? undefined) : undefined

  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<Draft>({})
  const [draftPreset, setDraftPreset] = React.useState<number | "custom">("custom")
  const [status, setStatus] = React.useState("")
  const contentRef = React.useRef<HTMLDivElement>(null)

  const isOff = React.useCallback(
    (d: Date) =>
      Boolean(
        (min && startOfDay(d) < startOfDay(min)) ||
          (max && startOfDay(d) > startOfDay(max)) ||
          disabled?.(d)
      ),
    [min, max, disabled]
  )

  // Where focus lands when nothing is chosen: today, or the nearest allowed bound.
  const fallbackDay = React.useCallback(() => {
    const today = new Date()
    if (min && startOfDay(today) < startOfDay(min)) return min
    if (max && startOfDay(today) > startOfDay(max)) return max
    return today
  }, [min, max])

  const viewFor = React.useCallback(
    (focus: Date) => {
      const first = startOfMonth(focus)
      // Range pickers with two months show the previous month beside the current one.
      return isRange && months === 2 ? addMonths(first, -1) : first
    },
    [isRange, months]
  )

  const [month, setMonth] = React.useState<Date>(() =>
    viewFor(range?.[1] ?? single ?? fallbackDay())
  )

  const matchPreset = (r?: Draft | DateRangeValue) => {
    const [a, b] = Array.isArray(r) ? r : [r?.from, r?.to]
    if (!a || !b) return -1
    return presets.findIndex((p) => {
      const [pa, pb] = p.range()
      return isSameDay(pa, a) && isSameDay(pb, b)
    })
  }

  const commit = (next: Date | DateRangeValue) => {
    if (props.value === undefined) setInnerValue(next)
    ;(props.onValueChange as ((v: Date | DateRangeValue) => void) | undefined)?.(next)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const focus = isRange ? (range?.[1] ?? range?.[0]) : single
      setMonth(viewFor(focus ?? fallbackDay()))
      if (isRange) {
        setDraft(range ? { from: range[0], to: range[1] } : {})
        const i = matchPreset(range)
        setDraftPreset(i === -1 ? "custom" : i)
      }
    }
    setOpen(next)
  }

  const disabledMatchers: Matcher[] = []
  if (min) disabledMatchers.push({ before: min })
  if (max) disabledMatchers.push({ after: max })
  if (disabled) disabledMatchers.push(disabled)

  const pickSingle = (d: Date) => {
    if (isOff(d)) return
    commit(d)
    setStatus(`Selected ${fmt.long(d)}.`)
    if (!inline) setOpen(false)
  }

  const pickRangeDay = (d: Date) => {
    if (isOff(d)) return
    let { from, to } = draft
    if (!from || to) {
      from = d
      to = undefined
    } else if (d < startOfDay(from)) {
      from = d
    } else {
      to = d
    }
    setDraft({ from, to })
    setDraftPreset("custom")
    setStatus(
      to
        ? inline
          ? `Selected ${fmt.long(from)} to ${fmt.long(to)}.`
          : `Selected ${fmt.long(from)} to ${fmt.long(to)}. Press Apply to use this range.`
        : `Start date ${fmt.long(from)}. Choose an end date.`
    )
    // Inline range pickers have no Apply step.
    if (inline && from && to) commit([from, to])
  }

  const choosePreset = (i: number) => {
    const [a, b] = presets[i].range()
    setDraft({ from: a, to: b })
    setDraftPreset(i)
    setMonth(viewFor(b))
    setStatus(`${presets[i].label}: ${fmt.range(a, b)}.`)
  }

  const chooseCustom = () => {
    setDraftPreset("custom")
    contentRef.current
      ?.querySelector<HTMLButtonElement>('[data-slot="calendar-day"][tabindex="0"]')
      ?.focus()
  }

  const apply = () => {
    if (!draft.from || !draft.to) return
    commit([draft.from, draft.to])
    setStatus(`Showing ${fmt.range(draft.from, draft.to)}.`)
    setOpen(false)
  }

  const shownRange: Draft = inline && isRange && !draft.from && range ? { from: range[0], to: range[1] } : draft

  const calendar = isRange ? (
    <Calendar
      mode="range"
      selected={shownRange.from ? { from: shownRange.from, to: shownRange.to ?? shownRange.from } : undefined}
      onSelect={(_, day) => pickRangeDay(day)}
      month={month}
      onMonthChange={setMonth}
      numberOfMonths={months}
      weekStartsOn={weekStartsOn}
      disabled={disabledMatchers}
      formatters={fmt.formatters}
      labels={fmt.labels}
      lang={locale}
    />
  ) : (
    <Calendar
      mode="single"
      required
      selected={single}
      onSelect={(_, day) => pickSingle(day)}
      month={month}
      onMonthChange={setMonth}
      numberOfMonths={months}
      weekStartsOn={weekStartsOn}
      disabled={disabledMatchers}
      formatters={fmt.formatters}
      labels={fmt.labels}
      lang={locale}
    />
  )

  const statusRegion = (
    <span data-slot="date-picker-status" role="status" className="sr-only">
      {status}
    </span>
  )

  if (inline) {
    const picked = isRange
      ? range
        ? fmt.range(range[0], range[1])
        : "No dates chosen"
      : single
        ? fmt.short(single)
        : "No date chosen"
    return (
      <div
        data-slot="date-picker"
        data-inline=""
        role="group"
        aria-labelledby={label != null ? labelId : undefined}
        aria-label={label == null ? ariaLabel : undefined}
        className={cn(
          "inline-block rounded-lg border bg-background p-3 text-left text-foreground shadow-xs",
          className
        )}
      >
        <div data-slot="date-picker-header" className="mx-1 mb-2.5 flex justify-between gap-3 text-[13.5px]">
          {label != null && (
            <b id={labelId} className="font-semibold">
              {label}
            </b>
          )}
          <span className="text-muted-foreground">{picked}</span>
        </div>
        {calendar}
        {statusRegion}
      </div>
    )
  }

  const triggerValue = isRange ? (
    range ? (
      <>
        {presets.length > 0 && (
          <b className="mr-2 font-medium">
            {matchPreset(range) === -1 ? "Custom" : presets[matchPreset(range)].label}
          </b>
        )}
        {fmt.range(range[0], range[1])}
      </>
    ) : null
  ) : single ? (
    fmt.short(single)
  ) : null

  return (
    <div
      data-slot="date-picker"
      className={cn("flex w-full max-w-[340px] flex-col gap-1.5 text-left", className)}
    >
      {label != null && (
        <span id={labelId} className="flex gap-1 text-[13.5px] font-medium text-foreground">
          {label}
        </span>
      )}
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} modal>
        <PopoverPrimitive.Trigger
          data-slot="date-picker-trigger"
          id={triggerId}
          aria-labelledby={label != null ? `${labelId} ${triggerId}` : undefined}
          aria-label={label == null ? ariaLabel : undefined}
          aria-describedby={description != null ? descriptionId : undefined}
          className="flex h-[38px] w-full cursor-pointer items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-left text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none hover:border-[color-mix(in_oklab,var(--color-input)_60%,var(--color-muted-foreground))] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground/70"
        >
          <CalendarDays aria-hidden />
          <span
            data-slot="date-picker-value"
            className={cn(
              "min-w-0 flex-1 truncate",
              triggerValue == null && "text-muted-foreground/70"
            )}
          >
            {triggerValue ?? placeholder ?? (isRange ? "Pick a date range" : "Pick a date")}
          </span>
          {isRange && <ChevronDown aria-hidden />}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={contentRef}
            data-slot="date-picker-content"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            aria-labelledby={label != null ? labelId : undefined}
            aria-label={label == null ? (ariaLabel ?? "Choose date") : undefined}
            onOpenAutoFocus={(e) => {
              // Focus the selected day (or today), not the first button.
              e.preventDefault()
              contentRef.current
                ?.querySelector<HTMLButtonElement>('[data-slot="calendar-day"][tabindex="0"]')
                ?.focus()
            }}
            className={cn(
              "z-50 max-h-(--radix-popover-content-available-height) max-w-[calc(100vw-16px)] overflow-auto overscroll-contain rounded-lg border bg-background p-3 text-left text-foreground shadow-lg outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none",
              isRange && "grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[auto_auto]"
            )}
          >
            {isRange && presets.length > 0 && (
              <div
                data-slot="date-picker-presets"
                role="group"
                aria-label="Presets"
                className="flex flex-row flex-wrap gap-0.5 border-b pb-2.5 sm:min-w-[132px] sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0 sm:pr-3 sm:pb-0"
              >
                {[...presets.map((p) => p.label), "Custom"].map((text, i) => {
                  const isCustom = i === presets.length
                  return (
                    <button
                      key={text + i}
                      type="button"
                      aria-pressed={isCustom ? draftPreset === "custom" : draftPreset === i}
                      onClick={() => (isCustom ? chooseCustom() : choosePreset(i))}
                      className="cursor-pointer rounded-sm px-[9px] py-1.5 text-left text-[13px] whitespace-nowrap text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary aria-pressed:bg-primary-soft aria-pressed:font-medium aria-pressed:text-primary-text sm:px-2.5 sm:py-[7px] sm:text-sm"
                    >
                      {text}
                    </button>
                  )
                })}
              </div>
            )}
            <div data-slot="date-picker-body" className={cn(isRange && presets.length === 0 && "sm:col-span-2")}>
              {calendar}
            </div>
            {isRange && (
              <div
                data-slot="date-picker-footer"
                className="flex items-center justify-end gap-2 border-t pt-3 sm:col-span-2"
              >
                <span aria-hidden className="mr-auto text-[13px] text-muted-foreground">
                  {fmt.range(draft.from, draft.to) || "Pick a start date"}
                </span>
                <PopoverPrimitive.Close asChild>
                  <Button variant="secondary" size="sm">
                    Cancel
                  </Button>
                </PopoverPrimitive.Close>
                <Button size="sm" disabled={!(draft.from && draft.to)} onClick={apply}>
                  Apply
                </Button>
              </div>
            )}
            {/* The modal popover hides everything outside it from screen readers, so it announces here. */}
            <span role="status" className="sr-only">
              {status}
            </span>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {description != null && (
        <span id={descriptionId} className="text-[12.5px] text-muted-foreground/70">
          {description}
        </span>
      )}
      {statusRegion}
    </div>
  )
}

export {
  DatePicker,
  Calendar,
  type DatePickerProps,
  type DatePickerPreset,
  type DateRangeValue,
  type CalendarProps,
}
