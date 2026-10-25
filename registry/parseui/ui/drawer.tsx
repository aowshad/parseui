import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/parseui/ui/button"

type DrawerSide = "right" | "left" | "bottom"

type DrawerContextValue = { side: DrawerSide; dismissible: boolean }
const DrawerContext = React.createContext<DrawerContextValue>({ side: "right", dismissible: true })

type DrawerProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  /** Edge the drawer slides from. At 640px and narrower, right and left drawers become bottom sheets. */
  side?: DrawerSide
  /** Close on Escape and overlay click. */
  dismissible?: boolean
}

function Drawer({ side = "right", dismissible = true, ...props }: DrawerProps) {
  return (
    <DrawerContext.Provider value={{ side, dismissible }}>
      <DialogPrimitive.Root data-slot="drawer" {...props} />
    </DrawerContext.Provider>
  )
}

function DrawerTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />
}

// Side panels become bottom sheets below 640px, so right and left repeat the bottom classes behind max-sm:.
const drawerVariants = cva(
  "fixed z-50 flex flex-col border-border bg-background text-left text-foreground shadow-2xl outline-none duration-[280ms] ease-[cubic-bezier(.2,.9,.3,1)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:ease-in motion-reduce:animate-none",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 w-[min(440px,100vw)] border-l sm:data-[state=open]:slide-in-from-right sm:data-[state=closed]:slide-out-to-right max-sm:inset-x-0 max-sm:top-auto max-sm:max-h-[85vh] max-sm:w-auto max-sm:rounded-t-xl max-sm:border-t max-sm:border-l-0 max-sm:pb-[env(safe-area-inset-bottom,0px)] max-sm:before:mt-2.5 max-sm:before:h-1 max-sm:before:w-10 max-sm:before:flex-none max-sm:before:self-center max-sm:before:rounded-full max-sm:before:bg-input max-sm:before:content-[''] max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom",
        left:
          "inset-y-0 left-0 w-[min(440px,100vw)] border-r sm:data-[state=open]:slide-in-from-left sm:data-[state=closed]:slide-out-to-left max-sm:inset-x-0 max-sm:top-auto max-sm:max-h-[85vh] max-sm:w-auto max-sm:rounded-t-xl max-sm:border-t max-sm:border-r-0 max-sm:pb-[env(safe-area-inset-bottom,0px)] max-sm:before:mt-2.5 max-sm:before:h-1 max-sm:before:w-10 max-sm:before:flex-none max-sm:before:self-center max-sm:before:rounded-full max-sm:before:bg-input max-sm:before:content-[''] max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom",
        bottom:
          "inset-x-0 bottom-0 max-h-[min(85vh,640px)] rounded-t-xl border-t pb-[env(safe-area-inset-bottom,0px)] before:mt-2.5 before:h-1 before:w-10 before:flex-none before:self-center before:rounded-full before:bg-input before:content-[''] data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
      },
    },
    defaultVariants: { side: "right" },
  }
)

type DrawerContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "title" | "onSubmit" | "onReset"
> & {
  /** Required. Labels the dialog through aria-labelledby. */
  title: React.ReactNode
  /** Shown under the title. */
  description?: React.ReactNode
  /** Shown next to the title, e.g. a status badge. */
  badge?: React.ReactNode
  /** Actions pinned to the bottom while the body scrolls. */
  footer?: React.ReactNode
  /** Render the body and footer inside a form, so footer buttons can submit and reset it. */
  as?: "div" | "form"
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  onReset?: React.FormEventHandler<HTMLFormElement>
  /** Element that receives focus on open. The panel itself by default, so screen readers announce the title first. */
  initialFocus?: React.RefObject<HTMLElement | null>
  /** Overrides the Drawer's side for this content. */
  side?: DrawerSide
  /** Overrides the Drawer's dismissible for this content. */
  dismissible?: boolean
  /** Label of the close button in the header. */
  closeLabel?: string
  bodyClassName?: string
}

function DrawerContent({
  className,
  bodyClassName,
  title,
  description,
  badge,
  footer,
  as = "div",
  onSubmit,
  onReset,
  initialFocus,
  side,
  dismissible,
  closeLabel = "Close",
  children,
  onOpenAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  ...props
}: DrawerContentProps) {
  const ctx = React.useContext(DrawerContext)
  const s = side ?? ctx.side
  const canDismiss = dismissible ?? ctx.dismissible

  const body = (
    <>
      <div
        data-slot="drawer-body"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pt-[18px] pb-[22px] text-sm",
          bodyClassName
        )}
      >
        {children}
      </div>
      {footer != null && <DrawerFooter>{footer}</DrawerFooter>}
    </>
  )

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="drawer-overlay"
        className="fixed inset-0 z-50 bg-black/45 duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
      />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        data-side={s}
        {...(description ? {} : { "aria-describedby": props["aria-describedby"] })}
        className={cn(drawerVariants({ side: s }), className)}
        onOpenAutoFocus={(e) => {
          onOpenAutoFocus?.(e)
          if (e.defaultPrevented) return
          e.preventDefault()
          const target = initialFocus?.current ?? (e.currentTarget as HTMLElement | null)
          target?.focus({ preventScroll: true })
        }}
        onEscapeKeyDown={(e) => {
          if (!canDismiss) e.preventDefault()
          onEscapeKeyDown?.(e)
        }}
        onPointerDownOutside={(e) => {
          if (!canDismiss) e.preventDefault()
          onPointerDownOutside?.(e)
        }}
        onInteractOutside={(e) => {
          if (!canDismiss) e.preventDefault()
          onInteractOutside?.(e)
        }}
        {...props}
      >
        <div
          data-slot="drawer-header"
          className="flex flex-none items-start gap-2.5 border-b border-border pt-[18px] pr-4 pb-4 pl-5"
        >
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title
              data-slot="drawer-title"
              className="m-0 text-[17px] leading-snug font-semibold tracking-[-0.01em]"
            >
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description
                data-slot="drawer-description"
                className="mt-0.5 mb-0 text-[13px] text-muted-foreground/70"
              >
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          {badge != null && (
            <div data-slot="drawer-badge" className="mt-1 flex-none">
              {badge}
            </div>
          )}
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="sm" iconOnly aria-label={closeLabel} className="-mt-0.5">
              <X aria-hidden />
            </Button>
          </DialogPrimitive.Close>
        </div>
        {as === "form" ? (
          <form
            data-slot="drawer-form"
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={onSubmit}
            onReset={onReset}
          >
            {body}
          </form>
        ) : (
          body
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "flex flex-none justify-end gap-2 border-t border-border bg-muted/50 px-5 py-3 max-sm:*:flex-1",
        className
      )}
      {...props}
    />
  )
}

type DrawerSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode
}

function DrawerSection({ className, title, children, ...props }: DrawerSectionProps) {
  const id = React.useId()
  return (
    <section
      data-slot="drawer-section"
      aria-labelledby={title != null ? id : undefined}
      className={cn("text-sm text-muted-foreground [&_p]:m-0", className)}
      {...props}
    >
      {title != null && (
        <h3 id={id} className="mt-0 mb-2.5 text-[12.5px] font-semibold text-muted-foreground/70">
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerSection,
  drawerVariants,
  type DrawerProps,
  type DrawerContentProps,
  type DrawerSectionProps,
  type DrawerSide,
}
