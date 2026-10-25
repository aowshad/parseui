import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type PageItem = number | "ellipsis-start" | "ellipsis-end"

/**
 * Page numbers to show: first, last, `siblings` on each side of the current page, and an ellipsis
 * for each gap. The count stays constant while paging so the buttons don't jump around.
 */
function getPageItems(page: number, total: number, siblings = 1): PageItem[] {
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  const slots = siblings * 2 + 5
  if (total <= slots) return range(1, total)

  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, total)
  const showStart = left > 3
  const showEnd = right < total - 2

  if (!showStart) return [...range(1, slots - 2), "ellipsis-end", total]
  if (!showEnd) return [1, "ellipsis-start", ...range(total - (slots - 3), total)]
  return [1, "ellipsis-start", ...range(left, right), "ellipsis-end", total]
}

const itemClass =
  "grid h-[34px] min-w-[34px] cursor-pointer place-items-center rounded-md border-0 bg-transparent px-1.5 text-sm text-muted-foreground tabular-nums transition-colors outline-none select-none not-aria-[current=page]:hover:bg-muted not-aria-[current=page]:hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 aria-[current=page]:bg-primary-soft aria-[current=page]:font-semibold aria-[current=page]:text-primary-text [&_svg]:size-4"

type PaginationProps = Omit<React.ComponentProps<"nav">, "onChange"> & {
  /** Current page, 1-based. */
  page?: number
  /** Total page count. */
  total: number
  /** Pages shown each side of current. */
  siblings?: number
  onPageChange?: (page: number) => void
  /** Accessible names, for translation. */
  labels?: { nav?: string; previous?: string; next?: string; page?: (page: number) => string }
}

function Pagination({
  page = 1,
  total,
  siblings = 1,
  onPageChange,
  labels,
  className,
  ...props
}: PaginationProps) {
  const count = Math.max(1, Math.floor(total))
  const current = Math.min(Math.max(1, page), count)
  const pageLabel = labels?.page ?? ((p: number) => `Page ${p}`)
  const go = (p: number) => {
    if (p !== current && p >= 1 && p <= count) onPageChange?.(p)
  }

  return (
    <nav
      data-slot="pagination"
      aria-label={labels?.nav ?? "Pagination"}
      className={cn("flex", className)}
      {...props}
    >
      <ul className="m-0 flex list-none items-center gap-1 p-0">
        <li>
          <button
            type="button"
            data-slot="pagination-previous"
            className={itemClass}
            aria-label={labels?.previous ?? "Previous page"}
            disabled={current <= 1}
            onClick={() => go(current - 1)}
          >
            <ChevronLeft aria-hidden />
          </button>
        </li>
        {getPageItems(current, count, siblings).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                data-slot="pagination-page"
                className={itemClass}
                aria-label={pageLabel(item)}
                aria-current={item === current ? "page" : undefined}
                onClick={() => go(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden>
              <span
                data-slot="pagination-ellipsis"
                className="grid h-[34px] min-w-[34px] place-items-center px-1.5 text-sm text-muted-foreground/70 select-none"
              >
                …
              </span>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            data-slot="pagination-next"
            className={itemClass}
            aria-label={labels?.next ?? "Next page"}
            disabled={current >= count}
            onClick={() => go(current + 1)}
          >
            <ChevronRight aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export { Pagination, getPageItems, type PaginationProps, type PageItem }
