import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardBodyVariants = cva("", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-[18px]",
      lg: "p-6",
    },
  },
  defaultVariants: { padding: "md" },
})

type CardPadding = NonNullable<VariantProps<typeof cardBodyVariants>["padding"]>

const CardContext = React.createContext<{ padding?: CardPadding }>({})

type CardProps = React.ComponentProps<"div"> & {
  asChild?: boolean
  /** Inner spacing of CardBody. */
  padding?: CardPadding
  /** Adds a larger shadow. */
  elevated?: boolean
}

function Card({ className, asChild = false, padding, elevated = false, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <CardContext.Provider value={{ padding }}>
      <Comp
        data-slot="card"
        data-elevated={elevated || undefined}
        className={cn(
          "flex flex-col rounded-xl border bg-background text-left text-foreground",
          elevated ? "shadow-lg" : "shadow-xs",
          className
        )}
        {...props}
      />
    </CardContext.Provider>
  )
}

type CardHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Content pinned to the right edge, such as a button or menu. */
  actions?: React.ReactNode
}

function CardHeader({
  className,
  title,
  description,
  actions,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-center gap-2.5 border-b px-[18px] py-4", className)}
      {...props}
    >
      {(title != null || description != null) && (
        <div className="min-w-0 flex-1">
          {title != null && <CardTitle>{title}</CardTitle>}
          {description != null && <CardDescription>{description}</CardDescription>}
        </div>
      )}
      {children}
      {actions != null && (
        <div data-slot="card-actions" className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

function CardTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h3"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "h3"
  return (
    <Comp
      data-slot="card-title"
      className={cn("m-0 text-[15px] leading-normal font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("mt-0.5 mb-0 text-[13px] leading-normal text-muted-foreground/70", className)}
      {...props}
    />
  )
}

function CardBody({
  className,
  padding,
  ...props
}: React.ComponentProps<"div"> & { padding?: CardPadding }) {
  const ctx = React.useContext(CardContext)
  return (
    <div
      data-slot="card-body"
      className={cn(cardBodyVariants({ padding: padding ?? ctx.padding }), className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-[18px] py-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  cardBodyVariants,
  type CardProps,
  type CardHeaderProps,
}
