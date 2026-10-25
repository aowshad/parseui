import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({
  className,
  asChild,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      asChild={asChild}
      className={cn(
        // Bare trigger (no asChild) wraps an avatar or icon: no chrome, just the focus ring.
        !asChild &&
          "inline-grid shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    />
  )
}

/** Lets DropdownMenuHeader name the menu instead of the trigger. */
const LabelIdContext = React.createContext<React.Dispatch<React.SetStateAction<string | undefined>> | null>(
  null
)

function DropdownMenuContent({
  className,
  align = "start",
  side = "bottom",
  sideOffset = 6,
  collisionPadding = 8,
  loop = true,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const [headerId, setHeaderId] = React.useState<string | undefined>()
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        loop={loop}
        {...(headerId && !props["aria-labelledby"] ? { "aria-labelledby": headerId } : {})}
        className={cn(
          "z-50 max-h-(--radix-dropdown-menu-content-available-height) max-w-[calc(100vw-16px)] min-w-[210px] origin-(--radix-dropdown-menu-content-transform-origin) overflow-y-auto overscroll-contain rounded-lg border border-border bg-background p-1 text-left text-foreground shadow-lg outline-none",
          "duration-150 ease-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100 motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <LabelIdContext.Provider value={setHeaderId}>{children}</LabelIdContext.Provider>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

const dropdownMenuItemVariants = cva(
  "relative flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-left text-sm leading-[1.35] whitespace-nowrap outline-none select-none focus-visible:inset-ring-2 focus-visible:inset-ring-primary data-disabled:cursor-default data-disabled:text-muted-foreground/70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "text-foreground data-highlighted:bg-muted [&_svg]:text-muted-foreground/70",
        // Same derivation as primary-text: readable on the menu and on its soft highlight.
        danger:
          "text-[color-mix(in_oklab,var(--color-destructive)_80%,var(--color-foreground))] data-highlighted:bg-destructive-soft",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const SHORTCUT_KEYS: Record<string, string> = {
  "⌘": "Meta",
  "⇧": "Shift",
  "⌥": "Alt",
  "⌃": "Control",
  "↵": "Enter",
  "⌫": "Backspace",
}

/** "⇧⌘P" → "Shift+Meta+P", for aria-keyshortcuts. */
function toKeyShortcuts(shortcut: string) {
  const parts: string[] = []
  for (const ch of Array.from(shortcut.replace(/\s+/g, ""))) {
    const key = SHORTCUT_KEYS[ch]
    if (key) parts.push(key)
    else if (parts.length && !Object.values(SHORTCUT_KEYS).includes(parts[parts.length - 1]))
      parts[parts.length - 1] += ch
    else parts.push(ch.length === 1 && /[a-z]/i.test(ch) ? ch.toUpperCase() : ch)
  }
  return parts.join("+")
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      aria-hidden
      className={cn("ml-auto pl-5 font-mono text-xs font-medium text-muted-foreground/70", className)}
      {...props}
    />
  )
}

type DropdownMenuItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> &
  VariantProps<typeof dropdownMenuItemVariants> & {
    icon?: React.ReactNode
    /** Shortcut hint shown on the right. Also set as aria-keyshortcuts. */
    shortcut?: string
  }

function DropdownMenuItem({
  className,
  variant,
  icon,
  shortcut,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant ?? "default"}
      aria-keyshortcuts={shortcut ? toKeyShortcuts(shortcut) : undefined}
      className={cn(dropdownMenuItemVariants({ variant }), className)}
      {...props}
    >
      {icon}
      {children}
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </DropdownMenuPrimitive.Item>
  )
}

type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  /** Close the menu after toggling. Off by default so several items can change in one go. */
  closeOnSelect?: boolean
}

function DropdownMenuCheckboxItem({
  className,
  children,
  closeOnSelect = false,
  onSelect,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(dropdownMenuItemVariants({ variant: "default" }), className)}
      onSelect={(e) => {
        onSelect?.(e)
        if (!closeOnSelect) e.preventDefault()
      }}
      {...props}
    >
      <span className="grid size-4 flex-none place-items-center" aria-hidden>
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="text-primary-text!" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-2.5 pt-2 pb-1 text-xs font-medium text-muted-foreground/70", className)}
      {...props}
    />
  )
}

type DropdownMenuHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
}

/** Names the menu for screen readers (aria-labelledby), e.g. the signed-in person in an account menu. */
function DropdownMenuHeader({ className, title, description, id, ...props }: DropdownMenuHeaderProps) {
  const autoId = React.useId()
  const headerId = id ?? autoId
  const setLabelId = React.useContext(LabelIdContext)
  React.useEffect(() => {
    setLabelId?.(headerId)
    return () => setLabelId?.(undefined)
  }, [headerId, setLabelId])

  return (
    <div
      data-slot="dropdown-menu-header"
      role="presentation"
      id={headerId}
      className={cn("px-2.5 py-2", className)}
      {...props}
    >
      <b className="block text-sm font-semibold">{title}</b>
      {description && <span className="block text-[12.5px] text-muted-foreground/70">{description}</span>}
    </div>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuHeader,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  dropdownMenuItemVariants,
  type DropdownMenuItemProps,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuHeaderProps,
}
