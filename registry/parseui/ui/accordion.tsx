import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

type AccordionSingleProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "single" },
  "type" | "collapsible"
> & {
  type?: "single"
  /** Allow closing the open item. */
  collapsible?: boolean
}

type AccordionMultipleProps = React.ComponentProps<typeof AccordionPrimitive.Root> & {
  type: "multiple"
}

type AccordionProps = AccordionSingleProps | AccordionMultipleProps

const rootClass =
  "w-full max-w-[560px] overflow-hidden rounded-lg border border-border bg-background text-left"

function Accordion(props: AccordionProps) {
  if (props.type === "multiple") {
    const { className, ...rest } = props
    return <AccordionPrimitive.Root data-slot="accordion" className={cn(rootClass, className)} {...rest} />
  }
  const { className, type: _type, collapsible = true, ...rest } = props
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      type="single"
      collapsible={collapsible}
      className={cn(rootClass, className)}
      {...(rest as Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "single" }, "type">)}
    />
  )
}

type AccordionItemProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Item>, "title"> & {
  /** Shortcut: renders the trigger with this label and wraps children in AccordionContent. */
  title?: React.ReactNode
}

function AccordionItem({ className, title, children, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border last:border-b-0", className)}
      {...props}
    >
      {title != null ? (
        <>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </>
      ) : (
        children
      )}
    </AccordionPrimitive.Item>
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="m-0 flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 cursor-pointer items-center justify-between gap-2.5 border-0 bg-transparent px-4 py-3.5 text-left text-[14.5px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-180 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("px-4 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
  type AccordionItemProps,
}
