import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { Command as CommandPrimitive } from "cmdk"
import { Check, ChevronDown, Plus, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Field, inputVariants, useFieldControl } from "@/registry/parseui/ui/input"

type ComboboxOption = { value: string; label: string; disabled?: boolean }

type ComboboxBaseProps = {
  /** Items to filter. */
  options: ReadonlyArray<string | ComboboxOption>
  /** Renders a Field label above the input. */
  label?: React.ReactNode
  hint?: React.ReactNode
  /** Error state; anything other than a boolean is also shown as the message. */
  error?: React.ReactNode | boolean
  placeholder?: string
  /** Offer Create "<text>" when nothing matches. */
  creatable?: boolean
  /** Called with the typed text when a new option is created. */
  onCreate?: (text: string) => void
  /** Custom matching. Defaults to a case-insensitive "contains" on the label. */
  filter?: (option: ComboboxOption, query: string) => boolean
  /** Shown when nothing matches. */
  emptyMessage?: React.ReactNode | ((query: string) => React.ReactNode)
  /** Submits the selected value(s) with a form under this name. */
  name?: string
  id?: string
  required?: boolean
  disabled?: boolean
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

type ComboboxSingleProps = ComboboxBaseProps & {
  multiple?: false
  /** Selected value; "" for none. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type ComboboxMultipleProps = ComboboxBaseProps & {
  /** Select several values, shown as removable chips. */
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

const CREATE_VALUE = "parseui-combobox-create"

const toArray = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value : value ? [value] : []

const defaultFilter = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.toLowerCase())

function Combobox(props: ComboboxProps) {
  const { label, hint, error, required, disabled, id, className } = props
  if (label != null || hint != null || (error != null && typeof error !== "boolean")) {
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={required}
        disabled={disabled}
        htmlFor={id}
        className={className}
      >
        <ComboboxControl {...props} className={undefined} />
      </Field>
    )
  }
  return <ComboboxControl {...props} />
}

function ComboboxControl(props: ComboboxProps) {
  const {
    options,
    error,
    placeholder,
    creatable = false,
    onCreate,
    filter = defaultFilter,
    emptyMessage = "No results",
    name,
    className,
  } = props
  const multiple = props.multiple === true
  const field = useFieldControl({
    id: props.id,
    invalid: Boolean(error),
    required: props.required,
    disabled: props.disabled,
    "aria-describedby": props["aria-describedby"],
  })

  /* options, including ones created here */
  const [created, setCreated] = React.useState<ComboboxOption[]>([])
  const allOptions = React.useMemo(() => {
    const list = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o))
    return [...list, ...created.filter((c) => !list.some((o) => o.value === c.value))]
  }, [options, created])
  const labelOf = (value: string | undefined) =>
    value ? (allOptions.find((o) => o.value === value)?.label ?? value) : ""

  /* selection, controlled or not */
  const controlled = props.value !== undefined
  const [internal, setInternal] = React.useState<string[]>(() => toArray(props.defaultValue))
  const selected = controlled ? toArray(props.value) : internal
  const commit = (next: string[]) => {
    if (!controlled) setInternal(next)
    if (props.multiple === true) props.onValueChange?.(next)
    else props.onValueChange?.(next[0] ?? "")
  }

  /* list state */
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [inputText, setInputText] = React.useState(() =>
    multiple ? "" : labelOf(selected[0])
  )
  const [active, setActive] = React.useState("")
  const [status, setStatus] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const [listNode, setListNode] = React.useState<HTMLDivElement | null>(null)
  const [activeId, setActiveId] = React.useState<string>()

  const matches = (q: string) => allOptions.filter((o) => !q || filter(o, q))
  const canCreateFor = (q: string) =>
    creatable && q !== "" && !allOptions.some((o) => o.label.toLowerCase() === q.toLowerCase())
  const filtered = matches(query)
  const canCreate = canCreateFor(query)
  const emptyContent =
    typeof emptyMessage === "function" ? emptyMessage(query) : emptyMessage

  // single: while closed, the input shows the chosen option
  const selectedLabel = multiple ? "" : labelOf(selected[0])
  React.useEffect(() => {
    if (!open && !multiple) setInputText(selectedLabel)
  }, [open, multiple, selectedLabel])

  // focus stays in the input, so it points at the highlighted option
  React.useEffect(() => {
    if (!listNode) {
      setActiveId(undefined)
      return
    }
    const sync = () =>
      setActiveId(listNode.querySelector<HTMLElement>('[cmdk-item][data-selected="true"]')?.id)
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(listNode, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-selected"],
    })
    return () => observer.disconnect()
  }, [listNode])

  const announceResults = (q: string) => {
    const hits = matches(q).length
    const create = canCreateFor(q)
    if (!hits && !create) {
      const empty = typeof emptyMessage === "function" ? emptyMessage(q) : emptyMessage
      setStatus(typeof empty === "string" ? empty : "No results")
    } else {
      setStatus(
        `${hits} ${hits === 1 ? "result" : "results"}${create ? `, or create “${q}”` : ""}`
      )
    }
  }

  const show = (highlight = "") => {
    if (field.disabled) return
    if (!open) announceResults(query)
    setOpen(true)
    setActive(highlight)
  }

  const hide = () => {
    setOpen(false)
    setQuery("")
    setActive("")
    if (!multiple) setInputText(labelOf(selected[0]))
  }

  const pick = (value: string) => {
    let picked = value
    if (value === CREATE_VALUE) {
      picked = query
      setCreated((list) => [...list, { value: picked, label: picked }])
      onCreate?.(picked)
    }
    const pickedLabel = value === CREATE_VALUE ? picked : labelOf(picked)

    if (multiple) {
      const adding = !selected.includes(picked)
      const next = adding ? [...selected, picked] : selected.filter((v) => v !== picked)
      commit(next)
      setInputText("")
      setQuery("")
      setActive(picked)
      setStatus(`${adding ? "Added" : "Removed"} ${pickedLabel}. ${next.length} selected.`)
    } else {
      commit([picked])
      setOpen(false)
      setQuery("")
      setActive("")
      setInputText(pickedLabel)
      setStatus(`${pickedLabel} selected.`)
    }
  }

  const remove = (value: string) => {
    const next = selected.filter((v) => v !== value)
    commit(next)
    setStatus(`Removed ${labelOf(value)}. ${next.length} selected.`)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (open) return // cmdk moves the highlight
        event.preventDefault()
        event.stopPropagation()
        const list = [...filtered.filter((o) => !o.disabled).map((o) => o.value)]
        if (canCreate) list.push(CREATE_VALUE)
        const current = !multiple && selected[0] && list.includes(selected[0]) ? selected[0] : undefined
        show(current ?? (event.key === "ArrowDown" ? list[0] : list[list.length - 1]) ?? "")
        return
      }
      case "Home":
      case "End":
        // move the text cursor, not the highlight
        event.stopPropagation()
        return
      case "Enter":
        // let a closed combobox submit its form; cmdk would swallow the key
        if (!open || !active) event.stopPropagation()
        return
      case "Escape":
        if (open) {
          event.preventDefault()
          event.stopPropagation()
          hide()
        } else if (inputText || (!multiple && selected.length)) {
          event.preventDefault()
          event.stopPropagation()
          setInputText("")
          setQuery("")
          if (!multiple) commit([])
          setStatus("Cleared.")
        }
        return
      case "Backspace":
        if (multiple && inputText === "" && selected.length) {
          event.preventDefault()
          remove(selected[selected.length - 1])
        }
        return
      case "Tab":
        if (open) hide()
        return
    }
  }

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    const q = text.trim()
    setInputText(text)
    setQuery(q)
    setOpen(true)
    announceResults(q)
    const first = matches(q).find((o) => !o.disabled)?.value
    setActive(q ? (first ?? (canCreateFor(q) ? CREATE_VALUE : "")) : "")
  }

  const hasItems = filtered.length > 0 || canCreate
  const listLabelledBy = field.labelId

  return (
    <CommandPrimitive
      data-slot="combobox"
      shouldFilter={false}
      loop
      value={active}
      onValueChange={setActive}
      className={cn("relative w-full", className)}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={(next) => !next && hide()}>
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={anchorRef}
            data-slot="combobox-control"
            data-invalid={field.invalid || undefined}
            data-disabled={field.disabled || undefined}
            className={cn(
              inputVariants({ size: "md" }),
              multiple && "h-auto min-h-[38px] flex-wrap gap-1 px-1.5 py-1"
            )}
            onMouseDown={(event) => {
              const target = event.target as HTMLElement
              if (target.closest("input, button")) return
              event.preventDefault()
              inputRef.current?.focus()
              if (!open) show()
            }}
          >
            {multiple ? (
              selected.map((value) => (
                <span
                  key={value}
                  data-slot="combobox-chip"
                  className="inline-flex h-[26px] items-center gap-0.5 rounded-sm bg-muted pr-0.5 pl-2 text-[13px] font-medium whitespace-nowrap text-foreground"
                >
                  {labelOf(value)}
                  <button
                    type="button"
                    data-slot="combobox-chip-remove"
                    aria-label={`Remove ${labelOf(value)}`}
                    disabled={field.disabled}
                    onClick={() => {
                      remove(value)
                      inputRef.current?.focus()
                    }}
                    className="grid size-5 cursor-pointer place-items-center rounded-[4px] text-muted-foreground/70 outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none [&_svg]:size-3!"
                  >
                    <X aria-hidden />
                  </button>
                </span>
              ))
            ) : (
              <Search aria-hidden />
            )}
            <input
              ref={inputRef}
              data-slot="combobox-input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={open && listNode ? listNode.id : undefined}
              aria-activedescendant={open ? activeId : undefined}
              aria-label={props["aria-label"]}
              aria-invalid={field.invalid || undefined}
              aria-required={field.required || undefined}
              aria-describedby={field.describedBy}
              id={field.id}
              disabled={field.disabled || undefined}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={placeholder}
              value={inputText}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              onClick={() => {
                if (!open) show()
              }}
              className={cn(
                "h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed",
                multiple && "h-7 min-w-24 pl-1"
              )}
            />
            <button
              type="button"
              tabIndex={-1}
              data-slot="combobox-toggle"
              aria-label={open ? "Hide options" : "Show all"}
              disabled={field.disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (open) hide()
                else show()
                inputRef.current?.focus()
              }}
              className={cn(
                "grid size-[26px] shrink-0 cursor-pointer place-items-center rounded-sm text-muted-foreground/70 hover:bg-muted hover:text-foreground disabled:pointer-events-none",
                multiple ? "ml-auto" : "-mr-1.5"
              )}
            >
              <ChevronDown
                aria-hidden
                className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")}
              />
            </button>
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            data-slot="combobox-content"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (anchorRef.current?.contains(event.target as Node)) event.preventDefault()
            }}
            // keep focus in the input while pressing an option
            onMouseDown={(event) => event.preventDefault()}
            className={cn(
              "z-50 max-h-[min(var(--radix-popover-content-available-height),18rem)] w-(--radix-popover-trigger-width) overflow-y-auto overscroll-contain rounded-lg border border-border bg-background p-1 text-left text-foreground shadow-lg outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100 motion-reduce:animate-none"
            )}
          >
            <CommandPrimitive.List
              ref={setListNode}
              data-slot="combobox-list"
              aria-labelledby={listLabelledBy}
              aria-multiselectable={multiple || undefined}
              hidden={!hasItems}
            >
              {filtered.map((option) => {
                const checked = selected.includes(option.value)
                return (
                  <CommandPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={pick}
                    data-slot="combobox-option"
                    data-checked={checked || undefined}
                    aria-checked={multiple ? checked : undefined}
                    className={optionClass}
                  >
                    <span className="grid w-4 shrink-0 place-items-center">
                      <Check
                        aria-hidden
                        className={cn("text-primary-text", !checked && "invisible")}
                      />
                    </span>
                    <Highlight text={option.label} query={query} />
                  </CommandPrimitive.Item>
                )
              })}
              {canCreate && (
                <CommandPrimitive.Item
                  value={CREATE_VALUE}
                  onSelect={pick}
                  data-slot="combobox-create"
                  className={cn(optionClass, "font-medium text-primary-text")}
                >
                  <Plus aria-hidden />
                  Create “{query}”
                </CommandPrimitive.Item>
              )}
            </CommandPrimitive.List>
            {!hasItems && (
              <div
                data-slot="combobox-empty"
                className="px-2.5 py-3 text-[13.5px] text-muted-foreground/70"
              >
                {emptyContent}
              </div>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      <span data-slot="combobox-status" role="status" className="sr-only">
        {status}
      </span>
      {name != null &&
        (selected.length ? selected : [""]).map((value) => (
          <input key={value || "empty"} type="hidden" name={name} value={value} />
        ))}
    </CommandPrimitive>
  )
}

const optionClass =
  "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-[7px] text-sm text-foreground outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted data-[selected=true]:shadow-[inset_0_0_0_2px_var(--color-primary)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (index < 0) return <span className="truncate">{text}</span>
  return (
    <span className="truncate">
      {text.slice(0, index)}
      <mark className="rounded-[3px] bg-primary-soft-hover font-semibold text-inherit">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </span>
  )
}

export {
  Combobox,
  type ComboboxProps,
  type ComboboxOption,
  type ComboboxSingleProps,
  type ComboboxMultipleProps,
}
