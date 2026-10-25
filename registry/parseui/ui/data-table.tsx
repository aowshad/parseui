import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Check, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/parseui/ui/button"
import { Checkbox } from "@/registry/parseui/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/parseui/ui/table"

type DataTableColumn<T> = {
  /** Field to read from each row; also the column id. */
  key: string
  header: React.ReactNode
  sortable?: boolean
  align?: "start" | "end"
  /** Custom cell content. Defaults to the field's value. */
  cell?: (row: T) => React.ReactNode
  /** Allow hiding from the Columns menu. The first column can never be hidden. */
  hideable?: boolean
}

type DataTableBulkContext = {
  clearSelection: () => void
}

type DataTableProps<T> = {
  /** Rows to show. */
  data: T[]
  columns: DataTableColumn<T>[]
  /** Stable id, so selection survives sorting and paging. */
  getRowId?: (row: T) => string | number
  /** Initial sort. The sorted header gets aria-sort. */
  defaultSort?: { key: string; direction: "asc" | "desc" }
  /** Adds row checkboxes and a select-all for the current page. */
  selectable?: boolean
  /** Names a row for its checkbox, e.g. (o) => `order #${o.id}`. Defaults to the row id. */
  rowLabel?: (row: T) => string
  /** Replaces the toolbar while rows are selected. */
  bulkActions?: (rows: T[], context: DataTableBulkContext) => React.ReactNode
  /** Choices for rows per page. */
  pageSizeOptions?: number[]
  /** Adds a Columns menu. */
  columnVisibility?: boolean
  /** Keeps the header visible while the body scrolls. */
  stickyHeader?: boolean
  /** Shows skeleton rows and sets aria-busy. */
  loading?: boolean
  /** Skeleton rows shown while loading. */
  skeletonRows?: number
  /** Shown in place of rows when data is empty. */
  empty?: React.ReactNode
  /** Accessible name for the table and its scroll region, shown as the toolbar title. */
  caption?: string
  /** Line under the caption. Defaults to the row count. */
  description?: React.ReactNode
  /** Extra toolbar content, placed before the Columns menu. */
  actions?: React.ReactNode
  className?: string
}

const SKELETON_WIDTHS = [46, 70, 110, 58, 72, 20, 56]

function pageList(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i)
  const pages = new Set([0, count - 1, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 0 && p < count).sort((a, b) => a - b)
  const out: (number | "gap")[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap")
    out.push(p)
  })
  return out
}

function headerText(header: React.ReactNode, key: string) {
  return typeof header === "string" || typeof header === "number" ? String(header) : key
}

function DataTable<T>({
  data,
  columns,
  getRowId,
  defaultSort,
  selectable = false,
  rowLabel,
  bulkActions,
  pageSizeOptions = [10, 20, 50],
  columnVisibility: showColumnMenu = false,
  stickyHeader = false,
  loading = false,
  skeletonRows = 5,
  empty,
  caption,
  description,
  actions,
  className,
}: DataTableProps<T>) {
  const captionId = React.useId()
  const noun = caption ? caption.toLowerCase() : "rows"
  const [sorting, setSorting] = React.useState<SortingState>(
    defaultSort ? [{ id: defaultSort.key, desc: defaultSort.direction === "desc" }] : []
  )
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [visibility, setVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  })
  const [status, setStatus] = React.useState("")
  const rootRef = React.useRef<HTMLDivElement>(null)

  const columnDefs = React.useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = columns.map((col, i) => ({
      id: col.key,
      accessorFn: (row) => (row as Record<string, unknown>)[col.key],
      header: () => col.header,
      cell: ({ row, getValue }) =>
        col.cell ? col.cell(row.original) : (getValue() as React.ReactNode) ?? null,
      enableSorting: Boolean(col.sortable),
      enableHiding: i > 0 && col.hideable !== false,
      meta: { align: col.align ?? "start", label: headerText(col.header, col.key) },
    }))
    if (selectable) {
      defs.unshift({
        id: "__select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            aria-label={`Select all ${noun} on this page`}
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${rowLabel ? rowLabel(row.original) : `row ${row.id}`}`}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(v === true)}
          />
        ),
      })
    }
    return defs
  }, [columns, selectable, rowLabel, noun])

  const table = useReactTable<T>({
    data,
    columns: columnDefs,
    state: { sorting, rowSelection, columnVisibility: visibility, pagination },
    getRowId: getRowId ? (row) => String(getRowId(row)) : undefined,
    enableRowSelection: selectable,
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Announce when rows arrive after loading.
  const wasLoading = React.useRef(loading)
  React.useEffect(() => {
    if (loading) setStatus(`Loading ${noun}.`)
    else if (wasLoading.current) setStatus(`${data.length} ${noun} loaded.`)
    wasLoading.current = loading
  }, [loading, data.length, noun])

  const labelOf = (id: string) =>
    (table.getColumn(id)?.columnDef.meta as { label?: string } | undefined)?.label ?? id

  const selectedRows = table.getSelectedRowModel().flatRows.map((r) => r.original)
  const selectedCount = selectedRows.length
  const clearSelection = () => {
    table.resetRowSelection()
    setStatus("Selection cleared.")
    // The bulk bar is about to unmount; keep focus in the table.
    requestAnimationFrame(() =>
      rootRef.current?.querySelector<HTMLElement>('thead [data-slot="checkbox"]')?.focus()
    )
  }

  const visibleColumns = table.getVisibleLeafColumns()
  const pageRows = table.getRowModel().rows
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = Math.max(1, table.getPageCount())
  const total = data.length
  const from = total ? pageIndex * pageSize + 1 : 0
  const to = pageIndex * pageSize + pageRows.length
  const showFooter = !loading && total > (pageSizeOptions[0] ?? 10)

  const goTo = (index: number) => {
    table.setPageIndex(index)
    setStatus(`Page ${index + 1}.`)
    // Prev/Next can become disabled; keep focus on the current page button.
    if (index === 0 || index === pageCount - 1) {
      requestAnimationFrame(() =>
        rootRef.current?.querySelector<HTMLElement>('[data-slot="data-table-pagination"] [aria-current="page"]')?.focus()
      )
    }
  }

  const toolbar =
    caption != null || actions != null || showColumnMenu ? (
      <div
        data-slot="data-table-toolbar"
        className="flex min-h-14 flex-wrap items-center gap-2 border-b py-2.5 pr-3 pl-4"
      >
        {caption != null && (
          <div data-slot="data-table-title">
            <b id={captionId} className="block text-[15px] font-semibold text-foreground">
              {caption}
            </b>
            <span className="text-[12.5px] text-muted-foreground/70">
              {description ?? (loading ? "Loading…" : `${total} ${total === 1 ? noun.replace(/s$/, "") : noun}`)}
            </span>
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {actions}
          {showColumnMenu && (
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<SlidersHorizontal aria-hidden />}
                  trailingIcon={<ChevronDown aria-hidden />}
                >
                  Columns
                </Button>
              </DropdownMenuPrimitive.Trigger>
              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                  data-slot="data-table-columns-menu"
                  align="end"
                  sideOffset={6}
                  collisionPadding={8}
                  className="z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[210px] overflow-y-auto overscroll-contain rounded-lg border bg-background p-1 text-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
                >
                  <DropdownMenuPrimitive.Label className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground/70">
                    Show columns
                  </DropdownMenuPrimitive.Label>
                  {table
                    .getAllLeafColumns()
                    .filter((c) => c.id !== "__select")
                    .map((column) => (
                      <DropdownMenuPrimitive.CheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        disabled={!column.getCanHide()}
                        onCheckedChange={(v) => column.toggleVisibility(v === true)}
                        onSelect={(e) => e.preventDefault()}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-sm leading-[1.35] whitespace-nowrap text-foreground outline-none select-none data-disabled:cursor-default data-disabled:opacity-50 data-highlighted:bg-muted"
                      >
                        <span className="grid size-4 place-items-center text-primary-text">
                          <DropdownMenuPrimitive.ItemIndicator>
                            <Check aria-hidden className="size-4" />
                          </DropdownMenuPrimitive.ItemIndicator>
                        </span>
                        {labelOf(column.id)}
                      </DropdownMenuPrimitive.CheckboxItem>
                    ))}
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          )}
        </div>
      </div>
    ) : null

  const bulkBar = (
    <div
      data-slot="data-table-bulk-bar"
      role="region"
      aria-label="Bulk actions"
      className="flex min-h-14 flex-wrap items-center gap-2 rounded-t-[calc(var(--radius-lg)-1px)] border-b bg-primary-soft py-2.5 pr-3 pl-4"
    >
      <b className="mr-auto text-sm font-semibold text-primary-text">{selectedCount} selected</b>
      {bulkActions?.(selectedRows, { clearSelection })}
      <Button variant="ghost" size="sm" onClick={clearSelection}>
        Clear selection
      </Button>
    </div>
  )

  return (
    <div
      ref={rootRef}
      data-slot="data-table"
      className={cn("rounded-lg border bg-background text-left", className)}
    >
      {selectable && selectedCount > 0 ? bulkBar : toolbar}
      <Table
        stickyHeader={stickyHeader}
        aria-labelledby={caption != null ? captionId : undefined}
        aria-busy={loading || undefined}
        className="min-w-190"
        containerProps={{
          tabIndex: 0,
          role: "region",
          "aria-labelledby": caption != null ? captionId : undefined,
          className: cn(
            "rounded-none border-0 bg-transparent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
            stickyHeader && "max-h-[420px] overflow-auto overscroll-contain",
            !toolbar && !(selectable && selectedCount > 0) && "rounded-t-lg",
            !showFooter && "rounded-b-lg"
          ),
        }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const column = header.column
                const align = (column.columnDef.meta as { align?: "start" | "end" } | undefined)?.align ?? "start"
                const sorted = column.getIsSorted()
                const isSelect = column.id === "__select"
                return (
                  <TableHead
                    key={header.id}
                    align={align}
                    aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined}
                    data-sorted={sorted || undefined}
                    className={cn(isSelect && "w-11 pr-0", sorted && "text-foreground")}
                  >
                    {column.getCanSort() ? (
                      <button
                        type="button"
                        data-slot="data-table-sort"
                        onClick={() => {
                          const desc = sorted ? sorted === "asc" : column.getFirstSortDir() === "desc"
                          table.setSorting([{ id: column.id, desc }])
                          table.setPageIndex(0)
                          setStatus(`Sorted by ${labelOf(column.id)}, ${desc ? "descending" : "ascending"}.`)
                        }}
                        className={cn(
                          "group/sort -mx-1.5 -my-1 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-1 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
                          align === "end" && "flex-row-reverse"
                        )}
                      >
                        {flexRender(column.columnDef.header, header.getContext())}
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "size-3.5 opacity-0 transition-[transform,opacity] group-hover/sort:opacity-50 group-focus-visible/sort:opacity-50 motion-reduce:transition-none",
                            sorted && "opacity-100! ",
                            sorted === "asc" && "rotate-180"
                          )}
                        />
                      </button>
                    ) : header.isPlaceholder ? null : (
                      flexRender(column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }, (_, r) => (
              <TableRow key={`skeleton-${r}`} aria-hidden>
                {visibleColumns.map((column, i) => {
                  const align = (column.columnDef.meta as { align?: "start" | "end" } | undefined)?.align ?? "start"
                  return (
                    <TableCell key={column.id} align={align} className={cn(column.id === "__select" && "w-11 pr-0")}>
                      <span
                        className="inline-block h-2.5 max-w-full animate-pulse rounded-full bg-muted align-middle motion-reduce:animate-none"
                        style={{ width: column.id === "__select" ? 17 : SKELETON_WIDTHS[i % SKELETON_WIDTHS.length] }}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : pageRows.length === 0 ? (
            <TableRow className="[&>td]:bg-transparent!">
              <TableCell colSpan={visibleColumns.length} className="px-5 py-10 text-center whitespace-normal">
                {empty ?? <span className="text-sm text-muted-foreground">No {noun}.</span>}
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: "start" | "end" } | undefined)?.align ?? "start"
                  return (
                    <TableCell
                      key={cell.id}
                      align={align}
                      className={cn(cell.column.id === "__select" && "w-11 pr-0 [&>button]:align-middle")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {showFooter && (
        <div
          data-slot="data-table-footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t py-2.5 pr-3 pl-4 text-[13.5px] text-muted-foreground"
        >
          <label className="flex items-center gap-2">
            Rows per page
            <span className="relative inline-flex">
              <select
                value={pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                  table.setPageIndex(0)
                  setStatus(`Showing ${e.target.value} rows per page.`)
                }}
                className="h-8 cursor-pointer appearance-none rounded-md border border-input bg-background pr-8 pl-3 text-[13.5px] text-foreground shadow-xs outline-none focus:border-primary focus:ring-[3px] focus:ring-ring/40"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground/70"
              />
            </span>
          </label>
          <span className="tabular-nums max-sm:ml-0 sm:ml-auto">
            {from}–{to} of {total}
          </span>
          <nav
            data-slot="data-table-pagination"
            aria-label={caption != null ? `${caption} pages` : "Pages"}
            className="flex items-center gap-1 max-sm:w-full max-sm:flex-wrap"
          >
            <PageButton aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => goTo(pageIndex - 1)}>
              <ChevronLeft aria-hidden />
            </PageButton>
            {pageList(pageIndex, pageCount).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} aria-hidden className="grid h-[34px] min-w-[34px] place-items-center">
                  …
                </span>
              ) : (
                <PageButton
                  key={p}
                  aria-label={`Page ${p + 1}`}
                  aria-current={p === pageIndex ? "page" : undefined}
                  onClick={() => goTo(p)}
                >
                  {p + 1}
                </PageButton>
              )
            )}
            <PageButton aria-label="Next page" disabled={!table.getCanNextPage()} onClick={() => goTo(pageIndex + 1)}>
              <ChevronRight aria-hidden />
            </PageButton>
          </nav>
        </div>
      )}
      <span data-slot="data-table-status" role="status" className="sr-only">
        {status}
      </span>
    </div>
  )
}

function PageButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-[34px] min-w-[34px] px-1.5 font-normal text-muted-foreground disabled:opacity-40 aria-[current=page]:bg-primary-soft aria-[current=page]:font-semibold aria-[current=page]:text-primary-text",
        className
      )}
      {...props}
    />
  )
}

export { DataTable, type DataTableProps, type DataTableColumn, type DataTableBulkContext }
