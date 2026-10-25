import * as React from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

type CommandFilterItem = { value: string; keywords: string[] }

type CommandContextValue = {
  query: string
  dialog: boolean
  /** Set by CommandDialog: closes it after an item runs. */
  onItemSelected?: () => void
}

const CommandContext = React.createContext<CommandContextValue>({ query: "", dialog: false })

/** Case-insensitive "contains" across the item's value and keywords. */
function defaultFilter(item: CommandFilterItem, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return `${item.value} ${item.keywords.join(" ")}`.toLowerCase().includes(q)
}

type CommandMenuProps = Omit<
  React.ComponentProps<typeof CommandPrimitive>,
  "value" | "defaultValue" | "onValueChange" | "filter" | "label"
> & {
  /** Accessible name for the search input (and the dialog). */
  label?: string
  placeholder?: string
  /** Controlled search text. */
  value?: string
  defaultValue?: string
  /** Called as the search changes. */
  onValueChange?: (value: string) => void
  /** Custom matching. Defaults to: label and keywords contain the query. */
  filter?: (item: CommandFilterItem, query: string) => boolean
  /** Show the keyboard hints footer. Hidden below 640px either way. */
  showHints?: boolean
  inputClassName?: string
}

type CommandMenuRootProps = CommandMenuProps & {
  dialog?: boolean
  onItemSelected?: () => void
}

function CommandMenuRoot({
  className,
  inputClassName,
  label = "Command menu",
  placeholder,
  value,
  defaultValue = "",
  onValueChange,
  filter = defaultFilter,
  loop = true,
  showHints = true,
  dialog = false,
  onItemSelected,
  children,
  ...props
}: CommandMenuRootProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const query = value ?? uncontrolled
  const setQuery = (next: string) => {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const cmdkFilter = React.useCallback(
    (v: string, search: string, keywords?: string[]) =>
      filter({ value: v, keywords: keywords ?? [] }, search) ? 1 : 0,
    [filter]
  )

  return (
    <CommandContext.Provider value={{ query, dialog, onItemSelected }}>
      <CommandPrimitive
        data-slot="command-menu"
        label={label}
        loop={loop}
        filter={cmdkFilter}
        className={cn(
          "group/command flex w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-border bg-background text-left text-foreground shadow-lg transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
          dialog
            ? "max-w-none shadow-2xl"
            : "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/40",
          className
        )}
        {...props}
      >
        <div
          data-slot="command-input-wrapper"
          className="flex h-[52px] flex-none items-center gap-2.5 border-b border-border pr-3.5 pl-4 text-muted-foreground/70"
        >
          <Search aria-hidden className="size-5 shrink-0" />
          <CommandPrimitive.Input
            data-slot="command-input"
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => {
              // Inline: Escape clears the search. In the dialog, Escape closes it instead.
              if (e.key === "Escape" && !dialog && query) {
                e.preventDefault()
                e.stopPropagation()
                setQuery("")
              }
            }}
            className={cn(
              "h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70",
              inputClassName
            )}
          />
          {dialog && <Kbd className="max-sm:hidden">Esc</Kbd>}
        </div>
        {children}
        <CommandStatus />
        {showHints && (
          <div
            data-slot="command-hints"
            aria-hidden
            className="flex flex-none gap-4 border-t border-border bg-muted/50 px-3.5 py-[9px] text-xs text-muted-foreground/70 max-sm:hidden"
          >
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> Run
            </span>
            {dialog && (
              <span className="flex items-center gap-1">
                <Kbd>Esc</Kbd> Close
              </span>
            )}
          </div>
        )}
      </CommandPrimitive>
    </CommandContext.Provider>
  )
}

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      aria-hidden
      className={cn(
        "inline-block min-w-[18px] rounded-[5px] border border-input bg-background px-[5px] py-0.5 text-center font-mono text-[11px] leading-none font-medium text-muted-foreground shadow-[0_1px_0_var(--color-input)]",
        className
      )}
      {...props}
    />
  )
}

/** Announces the result count while searching. */
function CommandStatus() {
  const { query } = React.useContext(CommandContext)
  const count = useCommandState((state) => state.filtered.count)
  const q = query.trim()
  return (
    <span role="status" className="sr-only">
      {q ? (count ? `${count} ${count === 1 ? "result" : "results"}` : `No results for ${q}`) : ""}
    </span>
  )
}

function CommandMenu(props: CommandMenuProps) {
  return <CommandMenuRoot {...props} />
}

type CommandDialogProps = CommandMenuProps & {
  /** Controlled open state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  contentClassName?: string
}

function CommandDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  contentClassName,
  label = "Command menu",
  ...props
}: CommandDialogProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="command-dialog-overlay"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pt-[12vh] pb-4 duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
        >
          <DialogPrimitive.Content
            data-slot="command-dialog"
            aria-describedby={undefined}
            className={cn(
              "w-[600px] max-w-full outline-none duration-200 ease-[cubic-bezier(.2,.9,.3,1.1)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-96 data-[state=open]:slide-in-from-bottom-1.5 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-96 data-[state=closed]:duration-100 motion-reduce:animate-none",
              contentClassName
            )}
          >
            <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
            <CommandMenuRoot label={label} dialog onItemSelected={() => setOpen(false)} {...props} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  const { dialog } = React.useContext(CommandContext)
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      label="Commands"
      className={cn(
        "overflow-y-auto overscroll-contain p-1.5",
        dialog ? "max-h-[min(380px,55vh)]" : "max-h-[320px]",
        className
      )}
      {...props}
    />
  )
}

type CommandGroupProps = React.ComponentProps<typeof CommandPrimitive.Group> & {
  /** Show the group only while the search is empty, or only while searching. */
  showWhen?: "always" | "empty" | "query"
}

function CommandGroup({ className, showWhen = "always", ...props }: CommandGroupProps) {
  const { query } = React.useContext(CommandContext)
  const searching = query.trim() !== ""
  if ((showWhen === "empty" && searching) || (showWhen === "query" && !searching)) return null
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground/70",
        className
      )}
      {...props}
    />
  )
}

/** Wraps the first match of `query` in <mark>. */
function highlight(text: string, query: string) {
  const q = query.trim()
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-primary-soft-hover font-semibold text-inherit">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  )
}

type CommandItemProps = Omit<React.ComponentProps<typeof CommandPrimitive.Item>, "onSelect"> & {
  icon?: React.ReactNode
  /** Secondary text after the label, e.g. the kind of result. Also searchable. */
  description?: React.ReactNode
  /** Hint shown on the right. */
  shortcut?: React.ReactNode
  /** Runs on Enter or click. */
  onSelect?: () => void
}

function CommandItem({
  className,
  icon,
  description,
  shortcut,
  value,
  keywords,
  onSelect,
  children,
  ...props
}: CommandItemProps) {
  const { query, onItemSelected } = React.useContext(CommandContext)
  const label = typeof children === "string" ? children : undefined
  const allKeywords = typeof description === "string" ? [...(keywords ?? []), description] : keywords

  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      value={value ?? label}
      keywords={allKeywords}
      onSelect={() => {
        onSelect?.()
        onItemSelected?.()
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-[9px] text-sm text-muted-foreground outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted data-[selected=true]:text-foreground group-focus-within/command:data-[selected=true]:inset-ring-2 group-focus-within/command:data-[selected=true]:inset-ring-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground/70 [&_svg:not([class*='size-'])]:size-4 data-[selected=true]:[&_svg]:text-primary-text",
        className
      )}
      {...props}
    >
      {icon}
      <span data-slot="command-item-label" className="min-w-0 truncate">
        {label != null ? highlight(label, query) : children}
        {description != null && (
          <span className="ml-2 text-[12.5px] text-muted-foreground/70">{description}</span>
        )}
      </span>
      {shortcut != null && (
        <span
          data-slot="command-item-shortcut"
          className="ml-auto pl-3 font-mono text-xs font-medium whitespace-nowrap text-muted-foreground/70 max-sm:hidden"
        >
          {shortcut}
        </span>
      )}
    </CommandPrimitive.Item>
  )
}

type CommandEmptyProps = Omit<React.ComponentProps<typeof CommandPrimitive.Empty>, "children"> & {
  /** Content, or a function of the current search. */
  children?: React.ReactNode | ((query: string) => React.ReactNode)
}

function CommandEmpty({ className, children = "No results.", ...props }: CommandEmptyProps) {
  const { query } = React.useContext(CommandContext)
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        "px-5 py-8 text-center text-sm leading-relaxed text-muted-foreground/70 [&_b]:font-semibold [&_b]:text-foreground",
        className
      )}
      {...props}
    >
      {typeof children === "function" ? children(query.trim()) : children}
    </CommandPrimitive.Empty>
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  CommandMenu,
  CommandDialog,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
  defaultFilter as commandDefaultFilter,
  type CommandMenuProps,
  type CommandDialogProps,
  type CommandGroupProps,
  type CommandItemProps,
  type CommandEmptyProps,
  type CommandFilterItem,
}
