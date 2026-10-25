import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type ModalContextValue = { dismissible: boolean }
const ModalContext = React.createContext<ModalContextValue>({ dismissible: true })

type ModalProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  /** Close on overlay click and Escape. */
  dismissible?: boolean
}

function Modal({ dismissible = true, ...props }: ModalProps) {
  return (
    <ModalContext.Provider value={{ dismissible }}>
      <DialogPrimitive.Root data-slot="modal" {...props} />
    </ModalContext.Provider>
  )
}

function ModalTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />
}

function ModalClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="modal-close" {...props} />
}

const modalVariants = cva(
  "relative w-full max-w-full rounded-xl border border-border bg-background text-left text-foreground shadow-2xl outline-none duration-200 ease-[cubic-bezier(.2,.9,.3,1.1)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-96 data-[state=open]:slide-in-from-bottom-1.5 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-96 data-[state=closed]:duration-150 motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "sm:w-[380px]",
        md: "sm:w-[440px]",
        lg: "sm:w-[560px]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const modalIconVariants = cva(
  "grid size-11 shrink-0 place-items-center rounded-full ring-6 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      color: {
        brand: "bg-primary-soft text-primary-text ring-primary-soft/50",
        danger: "bg-destructive-soft text-destructive ring-destructive-soft/50",
        success: "bg-success-soft text-success ring-success-soft/50",
        warning: "bg-warning-soft text-warning ring-warning-soft/50",
      },
    },
    defaultVariants: { color: "brand" },
  }
)

const overlayClass =
  "fixed inset-0 z-50 bg-black/45 duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150 motion-reduce:animate-none"

type ModalContentProps = Omit<React.ComponentProps<typeof DialogPrimitive.Content>, "title" | "color"> &
  VariantProps<typeof modalVariants> &
  VariantProps<typeof modalIconVariants> & {
    /** Icon shown in a soft circle above the title. */
    icon?: React.ReactNode
    /** Required. Labels the dialog. */
    title: React.ReactNode
    description?: React.ReactNode
    /** Actions row. Buttons share the width equally. */
    footer?: React.ReactNode
    /** Overrides the Modal's dismissible for this content. */
    dismissible?: boolean
    overlayClassName?: string
  }

function ModalContent({
  className,
  overlayClassName,
  size,
  color,
  icon,
  title,
  description,
  footer,
  dismissible,
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  ...props
}: ModalContentProps) {
  const ctx = React.useContext(ModalContext)
  const canDismiss = dismissible ?? ctx.dismissible

  return (
    <DialogPrimitive.Portal>
      {/* Content inside Overlay so the overlay centers and scrolls it. */}
      <DialogPrimitive.Overlay
        data-slot="modal-overlay"
        className={cn(overlayClass, "grid place-items-center overflow-y-auto p-5", overlayClassName)}
      >
        <DialogPrimitive.Content
          data-slot="modal-content"
          {...(description ? {} : { "aria-describedby": props["aria-describedby"] })}
          className={cn(modalVariants({ size }), className)}
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
          <div data-slot="modal-body" className="p-[22px]">
            {icon && (
              <div data-slot="modal-icon" aria-hidden className={modalIconVariants({ color })}>
                {icon}
              </div>
            )}
            <DialogPrimitive.Title
              data-slot="modal-title"
              className={cn("mb-1.5 text-[17px] leading-snug font-semibold", icon && "mt-3.5")}
            >
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description
                data-slot="modal-description"
                className="m-0 text-sm text-muted-foreground"
              >
                {description}
              </DialogPrimitive.Description>
            )}
            {children != null && <div className={cn(description && "mt-4", "flex flex-col gap-3")}>{children}</div>}
          </div>
          {footer != null && <ModalFooter>{footer}</ModalFooter>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn("flex gap-2.5 px-[22px] pt-3.5 pb-[22px] *:flex-1", className)}
      {...props}
    />
  )
}

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalFooter,
  modalVariants,
  modalIconVariants,
  type ModalProps,
  type ModalContentProps,
}
