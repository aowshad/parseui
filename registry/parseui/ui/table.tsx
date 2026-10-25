import * as React from "react"

import { cn } from "@/lib/utils"

type TableProps = React.ComponentProps<"table"> & {
  /** Row height. */
  density?: "compact" | "default"
  /** Keep the header visible while the container scrolls. Give the container a max height. */
  stickyHeader?: boolean
  /** Props for the bordered, horizontally scrolling container around the table. */
  containerProps?: React.ComponentProps<"div">
}

function Table({
  className,
  density = "default",
  stickyHeader = false,
  containerProps,
  ...props
}: TableProps) {
  const { className: containerClassName, ...restContainerProps } = containerProps ?? {}

  return (
    <div
      data-slot="table-container"
      {...restContainerProps}
      className={cn(
        "relative w-full overflow-x-auto rounded-lg border bg-background text-left",
        containerClassName
      )}
    >
      <table
        data-slot="table"
        data-density={density}
        data-sticky-header={stickyHeader || undefined}
        className={cn(
          "group/table w-full min-w-140 border-collapse text-[13.5px]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn(className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&>tr:hover>td]:bg-muted/50 [&>tr:last-child>td]:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium text-foreground [&>tr>td]:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors motion-reduce:transition-none data-[state=selected]:[&>td]:bg-primary-soft!",
        className
      )}
      {...props}
    />
  )
}

type TableCellAlign = "start" | "center" | "end"

const alignClass: Record<TableCellAlign, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right tabular-nums",
}

type TableHeadProps = Omit<React.ComponentProps<"th">, "align"> & {
  /** Text alignment. "end" also uses tabular numbers, for amounts. */
  align?: TableCellAlign
}

function TableHead({ className, align = "start", scope = "col", ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      data-align={align}
      scope={scope}
      className={cn(
        // The header fill is opaque (a mix, not an alpha) so a sticky header covers the rows under it.
        "bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--color-background))] px-3.5 py-2.5 text-[12.5px] font-medium whitespace-nowrap text-muted-foreground/70 shadow-[inset_0_-1px_0_var(--color-border)] group-data-[density=compact]/table:py-2 group-data-[sticky-header]/table:sticky group-data-[sticky-header]/table:top-0 group-data-[sticky-header]/table:z-10",
        alignClass[align],
        className
      )}
      {...props}
    />
  )
}

type TableCellProps = Omit<React.ComponentProps<"td">, "align"> & {
  /** Text alignment. "end" also uses tabular numbers, for amounts. */
  align?: TableCellAlign
}

function TableCell({ className, align = "start", ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      data-align={align}
      className={cn(
        "border-b px-3.5 py-3 whitespace-nowrap text-muted-foreground group-data-[density=compact]/table:py-2 [&_b]:font-medium [&_b]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground",
        alignClass[align],
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("caption-bottom py-3 text-[13px] text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  type TableProps,
  type TableHeadProps,
  type TableCellProps,
}
