"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { User } from "lucide-react"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative inline-grid shrink-0 place-items-center font-semibold text-white ring-2 ring-background select-none",
  {
    variants: {
      size: {
        sm: "size-7 text-[11px]",
        md: "size-9 text-[13px]",
        lg: "size-12 text-base",
        xl: "size-16 text-xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: { size: "md", shape: "circle" },
  }
)

/** Fixed fills for initials, in the same order as the docs site so a name gets the same color everywhere. */
const AVATAR_COLORS = [
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-orange-600",
  "bg-blue-600",
  "bg-pink-600",
  "bg-cyan-600",
  "bg-violet-600",
  "bg-yellow-600",
] as const

function avatarColor(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const STATUS_LABEL = { online: "Online", away: "Away", offline: "Offline" } as const

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>
type AvatarStatusValue = keyof typeof STATUS_LABEL

const AvatarGroupContext = React.createContext<{ size?: AvatarSize } | null>(null)

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants> & {
    /** Used for initials, fill color and alt text. */
    name?: string
    /** Image URL. Falls back to initials while loading or on error. */
    src?: string
    /** Presence indicator in the bottom-right corner. */
    status?: AvatarStatusValue
  }

function Avatar({
  className,
  size,
  shape,
  name,
  src,
  status,
  children,
  ...props
}: AvatarProps) {
  const group = React.useContext(AvatarGroupContext)
  const resolvedSize = size ?? group?.size ?? "md"

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={resolvedSize}
      className={cn(
        avatarVariants({ size: resolvedSize, shape }),
        name ? avatarColor(name) : "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {src && <AvatarImage src={src} alt={name ?? ""} />}
          <AvatarFallback delayMs={src ? 600 : undefined}>
            {name ? (
              <>
                <span aria-hidden>{initials(name)}</span>
                <span className="sr-only">{name}</span>
              </>
            ) : (
              <User aria-hidden className="size-[45%]" />
            )}
          </AvatarFallback>
        </>
      )}
      {status && <AvatarStatus status={status} />}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("col-start-1 row-start-1 size-full rounded-[inherit] object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "col-start-1 row-start-1 grid size-full place-items-center rounded-[inherit] leading-none",
        className
      )}
      {...props}
    />
  )
}

function AvatarStatus({
  status,
  className,
  ...props
}: React.ComponentProps<"span"> & { status: AvatarStatusValue }) {
  return (
    <span
      data-slot="avatar-status"
      data-status={status}
      className={cn(
        "absolute right-0 bottom-0 size-[28%] rounded-full ring-2 ring-background",
        status === "online" && "bg-success",
        status === "away" && "bg-warning",
        status === "offline" && "bg-muted-foreground/70",
        className
      )}
      {...props}
    >
      <span className="sr-only">{STATUS_LABEL[status]}</span>
    </span>
  )
}

type AvatarGroupProps = React.ComponentProps<"div"> & {
  /** Avatars shown before the rest collapse into a "+N" chip. */
  max?: number
  /** Size applied to every avatar in the group and the overflow chip. */
  size?: AvatarSize
}

function AvatarGroup({ className, max, size = "md", children, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const visible = max != null && items.length > max ? items.slice(0, max) : items
  const hidden = items.length - visible.length

  return (
    <AvatarGroupContext.Provider value={{ size }}>
      <div
        data-slot="avatar-group"
        role="group"
        className={cn("flex items-center *:not-first:-ml-2", className)}
        {...props}
      >
        {visible}
        {hidden > 0 && (
          <span
            data-slot="avatar-group-count"
            className={cn(avatarVariants({ size }), "bg-muted text-muted-foreground")}
          >
            <span aria-hidden>+{hidden}</span>
            <span className="sr-only">{hidden} more</span>
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  AvatarGroup,
  avatarVariants,
  type AvatarProps,
  type AvatarGroupProps,
}
