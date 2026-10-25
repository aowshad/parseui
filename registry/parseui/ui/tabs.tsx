import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tabsListVariants = cva("flex", {
  variants: {
    variant: {
      underline:
        "w-full gap-5 border-b border-border data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-0 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-l",
      pill: "inline-flex w-auto gap-1 rounded-[calc(var(--radius)+2px)] bg-muted p-[3px] data-[orientation=vertical]:flex-col",
    },
  },
  defaultVariants: { variant: "underline" },
})

const tabsTriggerVariants = cva(
  "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 bg-transparent text-sm font-medium text-muted-foreground/70 transition-colors outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        underline:
          "-mb-px border-b-2 border-solid border-transparent py-2.5 data-[state=active]:border-primary data-[orientation=vertical]:mb-0 data-[orientation=vertical]:-ml-px data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-l-2 data-[orientation=vertical]:px-3 data-[orientation=vertical]:py-2",
        pill: "rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
      },
    },
    defaultVariants: { variant: "underline" },
  }
)

type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>

const TabsVariantContext = React.createContext<TabsVariant>("underline")

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex w-full flex-col data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-4", className)}
      {...props}
    />
  )
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>

function TabsList({ className, variant, ...props }: TabsListProps) {
  const v = variant ?? "underline"
  return (
    <TabsVariantContext.Provider value={v}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={v}
        className={cn(tabsListVariants({ variant: v }), className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  /** Small count shown after the label, e.g. open orders. */
  count?: React.ReactNode
}

function TabsTrigger({ className, count, children, ...props }: TabsTriggerProps) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    >
      {children}
      {count != null && (
        <span
          data-slot="tabs-count"
          className="rounded-full bg-muted px-1.5 py-px text-[11.5px] leading-normal font-medium text-muted-foreground tabular-nums"
        >
          {count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "w-full px-0.5 py-4 text-left text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
  type TabsListProps,
  type TabsTriggerProps,
}
