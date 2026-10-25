"use client"

import * as React from "react"
import { Toaster as Sonner, toast } from "sonner"
import { CircleCheck, CircleX, Info, Loader2, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Renders toasts fired with `toast()`. Mount once near the root of the app.
 *
 * Layout: icon | title + description | close, with action buttons under the text.
 * Sonner's own styles are turned off (`unstyled`); everything below comes from ParseUI tokens.
 */
function Toaster({
  position = "bottom-right",
  offset = 20,
  gap = 10,
  duration = 4000,
  closeButton = true,
  theme = "light",
  className,
  style,
  toastOptions,
  icons,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      position={position}
      offset={offset}
      gap={gap}
      duration={duration}
      closeButton={closeButton}
      // Only drives sonner's data attribute; colors come from tokens, which already follow the app theme.
      theme={theme}
      className={cn("toaster", className)}
      style={{ "--width": "360px", fontFamily: "inherit", ...style } as React.CSSProperties}
      icons={{
        success: <CircleCheck />,
        error: <CircleX />,
        info: <Info />,
        warning: <TriangleAlert />,
        loading: <Loader2 className="animate-spin motion-reduce:animate-none" />,
        close: <X />,
        ...icons,
      }}
      {...props}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          toast: cn(
            "group/toast grid w-(--width) grid-cols-[auto_auto_1fr_auto] items-start rounded-lg border bg-background p-3.5 text-left text-sm leading-[1.6] text-foreground shadow-lg",
            "[grid-template-areas:'icon_content_content_close'_'icon_cancel_action_.']",
            // Collapsed toasts behind the front one only show their edge.
            "data-[expanded=false]:data-[front=false]:*:opacity-0",
            "focus-visible:outline-2! focus-visible:outline-offset-2 focus-visible:outline-primary!",
            toastOptions?.classNames?.toast
          ),
          icon: cn(
            "relative mr-3 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground [grid-area:icon] [&_svg]:size-4",
            "group-data-[type=success]/toast:bg-success-soft group-data-[type=success]/toast:text-success",
            "group-data-[type=error]/toast:bg-destructive-soft group-data-[type=error]/toast:text-destructive",
            "group-data-[type=warning]/toast:bg-warning-soft group-data-[type=warning]/toast:text-warning",
            "group-data-[type=info]/toast:bg-primary-soft group-data-[type=info]/toast:text-primary-text",
            toastOptions?.classNames?.icon
          ),
          content: cn("min-w-0 text-[13.5px] text-muted-foreground [grid-area:content]", toastOptions?.classNames?.content),
          title: cn("text-[14px] font-semibold text-foreground", toastOptions?.classNames?.title),
          description: cn(toastOptions?.classNames?.description),
          closeButton: cn(
            "ml-3 inline-grid size-[18px] cursor-pointer place-items-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground/70 transition-colors outline-none [grid-area:close] hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary [&_svg]:size-4",
            toastOptions?.classNames?.closeButton
          ),
          actionButton: cn(
            "mt-2 cursor-pointer justify-self-start rounded-sm border-0 bg-transparent p-0 text-[13.5px] font-medium text-primary-text underline-offset-[3px] outline-none [grid-area:action] hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            toastOptions?.classNames?.actionButton
          ),
          cancelButton: cn(
            "mt-2 mr-3 cursor-pointer justify-self-start rounded-sm border-0 bg-transparent p-0 text-[13.5px] font-medium text-muted-foreground outline-none [grid-area:cancel] hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            toastOptions?.classNames?.cancelButton
          ),
        },
      }}
    />
  )
}

export { Toaster, toast, type ToasterProps }
