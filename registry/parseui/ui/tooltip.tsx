"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root> & {
  /** Tooltip text. When set, `children` is the trigger. Leave it out to compose TooltipTrigger and TooltipContent yourself. */
  content?: React.ReactNode
  /** Preferred placement. */
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>["side"]
  /** Alignment against the trigger. */
  align?: React.ComponentProps<typeof TooltipPrimitive.Content>["align"]
  /** Open delay in ms. */
  delay?: number
}

function Tooltip({
  content,
  side = "top",
  align,
  delay = 300,
  delayDuration,
  children,
  ...props
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration ?? delay}>
      <TooltipPrimitive.Root data-slot="tooltip" delayDuration={delayDuration ?? delay} {...props}>
        {content === undefined ? (
          children
        ) : (
          <>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side={side} align={align}>
              {content}
            </TooltipContent>
          </>
        )}
      </TooltipPrimitive.Root>
    </TooltipProvider>
  )
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 3,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        side={side}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          "z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-sm bg-foreground px-[9px] py-1.5 text-[12.5px] leading-snug font-medium text-balance text-background shadow-md",
          "animate-in duration-150 fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          "motion-reduce:animate-none motion-reduce:data-[state=closed]:animate-none",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          data-slot="tooltip-arrow"
          width={10}
          height={5}
          className="fill-foreground"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, type TooltipProps }
