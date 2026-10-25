"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { ChevronRight, Ellipsis } from "lucide-react"

import { cn } from "@/lib/utils"

type BreadcrumbProps = React.ComponentProps<"nav"> & {
  /** Divider between items. */
  separator?: React.ReactNode
  /** Collapse the middle items behind an expand button when there are more than this many. */
  maxItems?: number
  /** Accessible name of the expand button shown when items are collapsed. */
  expandLabel?: string
}

function Breadcrumb({
  className,
  separator = <ChevronRight />,
  maxItems,
  expandLabel = "Show all breadcrumbs",
  "aria-label": ariaLabel = "Breadcrumb",
  children,
  ...props
}: BreadcrumbProps) {
  const [expanded, setExpanded] = React.useState(false)
  const listRef = React.useRef<HTMLOListElement>(null)
  const items = React.Children.toArray(children).filter(React.isValidElement)

  const collapse = !expanded && maxItems != null && maxItems >= 2 && items.length > maxItems
  const shown: React.ReactNode[] = collapse
    ? [
        items[0],
        <li key="__ellipsis" data-slot="breadcrumb-ellipsis" className="inline-flex items-center">
          <button
            type="button"
            aria-label={expandLabel}
            onClick={() => {
              setExpanded(true)
              // Keep focus in the trail once the button disappears.
              requestAnimationFrame(() =>
                listRef.current?.querySelectorAll<HTMLElement>("a, [aria-current]")[1]?.focus()
              )
            }}
            className="inline-grid h-5 w-6 cursor-pointer place-items-center rounded-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Ellipsis aria-hidden />
          </button>
        </li>,
        ...items.slice(items.length - (maxItems - 1)),
      ]
    : items

  return (
    <nav data-slot="breadcrumb" aria-label={ariaLabel} className={className} {...props}>
      <ol
        ref={listRef}
        className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm text-muted-foreground/70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
      >
        {shown.map((item, i) => (
          <React.Fragment key={React.isValidElement(item) && item.key != null ? item.key : i}>
            {i > 0 && (
              <li
                data-slot="breadcrumb-separator"
                role="presentation"
                aria-hidden
                className="inline-flex items-center"
              >
                {separator}
              </li>
            )}
            {item}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}

type BreadcrumbItemProps = React.ComponentProps<"a"> & {
  /** Marks the current page. Renders text instead of a link. */
  current?: boolean
  /** Leading icon. With no children the item is icon-only. */
  icon?: React.ReactNode
  /** Accessible name for an icon-only item. */
  label?: string
  /** Render your router's link component instead of `<a>`. */
  asChild?: boolean
}

function BreadcrumbItem({
  className,
  current = false,
  icon,
  label,
  asChild = false,
  href,
  children,
  ...props
}: BreadcrumbItemProps) {
  const iconOnly = children == null || children === false
  const content = (
    <>
      {icon != null && (
        <span aria-hidden className="inline-flex">
          {icon}
        </span>
      )}
      {iconOnly ? (
        <span className="sr-only">{label ?? "Home"}</span>
      ) : asChild ? (
        <Slot.Slottable>{children}</Slot.Slottable>
      ) : (
        children
      )}
    </>
  )

  if (current) {
    return (
      <li data-slot="breadcrumb-item" className="inline-flex items-center">
        <span
          data-slot="breadcrumb-page"
          aria-current="page"
          className={cn("inline-flex items-center gap-1 font-medium text-foreground", className)}
          {...(props as React.ComponentProps<"span">)}
        >
          {asChild ? children : content}
        </span>
      </li>
    )
  }

  const Comp = asChild ? Slot.Root : "a"
  return (
    <li data-slot="breadcrumb-item" className="inline-flex items-center">
      <Comp
        data-slot="breadcrumb-link"
        className={cn(
          "inline-flex items-center gap-1 rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        href={href}
        {...props}
      >
        {content}
      </Comp>
    </li>
  )
}

export { Breadcrumb, BreadcrumbItem, type BreadcrumbProps, type BreadcrumbItemProps }
