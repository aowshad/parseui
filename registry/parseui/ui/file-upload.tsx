import * as React from "react"
import { CircleAlert, CircleCheck, File as FileIcon, Plus, Trash2, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/parseui/ui/button"

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type FileRejectReason = "type" | "size" | "count"

type FileUploadContext = {
  /** Report progress from 0 to 100. */
  onProgress: (percent: number) => void
  /** Aborted when the file is removed or the component unmounts. */
  signal: AbortSignal
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1048576).toFixed(1).replace(/\.0$/, "")} MB`
}

function accepts(accept: string[] | undefined, file: File) {
  if (!accept?.length) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept.some((raw) => {
    const a = raw.trim().toLowerCase()
    if (a.startsWith(".")) return name.endsWith(a)
    if (a.endsWith("/*")) return type.startsWith(a.slice(0, -1))
    return type === a
  })
}

type UploadState = {
  status: "uploading" | "done" | "error"
  progress: number
  error?: string
}

type Rejected = { id: number; file: File; reason: FileRejectReason; message: string }

/* -------------------------------------------------------------------------- */
/* FileUpload                                                                 */
/* -------------------------------------------------------------------------- */

type FileUploadProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue" | "ref"> & {
  /** Allowed MIME types or extensions, e.g. "image/*" or ".csv". */
  accept?: string[]
  /** Largest file in bytes. */
  maxSize?: number
  /** Allow choosing or dropping several files. */
  multiple?: boolean
  /** Stop accepting files after this many. */
  maxFiles?: number
  /** Layout. */
  variant?: "dropzone" | "images" | "compact"
  /** Accepted files, controlled. */
  value?: File[]
  /** Accepted files to start with, uncontrolled. */
  defaultValue?: File[]
  /** Called for each accepted file. Report progress from 0 to 100; reject to show an error. */
  onUpload?: (file: File, context: FileUploadContext) => Promise<void>
  /** Called for files that fail the accept, maxSize or maxFiles checks. */
  onReject?: (file: File, reason: FileRejectReason) => void
  /** Called when files are added or removed, with every accepted file. */
  onFilesChange?: (files: File[]) => void
  /** Visible label. Used by the compact variant. */
  label?: React.ReactNode
  /** Help text, e.g. allowed types and size. */
  hint?: React.ReactNode
  disabled?: boolean
}

function FileUpload({
  accept,
  maxSize,
  multiple = false,
  maxFiles,
  variant = "dropzone",
  value,
  defaultValue,
  onUpload,
  onReject,
  onFilesChange,
  label,
  hint,
  disabled = false,
  id,
  className,
  ...props
}: FileUploadProps) {
  const autoId = React.useId()
  const baseId = id ?? autoId
  const labelId = `${baseId}-label`
  const nameId = `${baseId}-name`
  const hintId = `${baseId}-hint`

  const [innerFiles, setInnerFiles] = React.useState<File[]>(defaultValue ?? [])
  const files = value ?? innerFiles
  const [rejected, setRejected] = React.useState<Rejected[]>([])
  const [uploads, setUploads] = React.useState<Map<File, UploadState>>(() => new Map())
  const [dragging, setDragging] = React.useState(false)
  const [status, setStatus] = React.useState("")

  const inputRef = React.useRef<HTMLInputElement>(null)
  const browseRef = React.useRef<HTMLButtonElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const controllers = React.useRef(new Map<File, AbortController>())
  const nextId = React.useRef(0)
  const pendingFocus = React.useRef<number | null>(null)

  // Abort every running upload on unmount.
  React.useEffect(() => {
    const running = controllers.current
    return () => {
      running.forEach((c) => c.abort())
      running.clear()
    }
  }, [])

  // After a remove, move focus to the next remove button, or back to Browse.
  React.useLayoutEffect(() => {
    if (pendingFocus.current == null) return
    const buttons = rootRef.current?.querySelectorAll<HTMLButtonElement>(
      '[data-slot="file-upload-remove"]'
    )
    const target = buttons?.[Math.min(pendingFocus.current, buttons.length - 1)]
    pendingFocus.current = null
    ;(target ?? browseRef.current)?.focus()
  })

  const setFiles = (next: File[]) => {
    if (value === undefined) setInnerFiles(next)
    onFilesChange?.(next)
  }

  const patchUpload = (file: File, patch: UploadState | null) =>
    setUploads((prev) => {
      const next = new Map(prev)
      if (patch) next.set(file, patch)
      else next.delete(file)
      return next
    })

  const startUpload = (file: File) => {
    if (!onUpload) return
    const controller = new AbortController()
    controllers.current.set(file, controller)
    patchUpload(file, { status: "uploading", progress: 0 })
    const onProgress = (p: number) => {
      if (controller.signal.aborted) return
      patchUpload(file, { status: "uploading", progress: Math.max(0, Math.min(100, p)) })
    }
    onUpload(file, { onProgress, signal: controller.signal }).then(
      () => {
        if (controller.signal.aborted) return
        controllers.current.delete(file)
        patchUpload(file, { status: "done", progress: 100 })
        setStatus(`${file.name} uploaded.`)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        controllers.current.delete(file)
        const message = err instanceof Error && err.message ? err.message : "Upload failed"
        patchUpload(file, { status: "error", progress: 0, error: message })
        setStatus(`${file.name}: ${message}.`)
      }
    )
  }

  const addFiles = (list: FileList | File[] | null | undefined) => {
    if (disabled || !list) return
    let incoming = Array.from(list)
    if (!incoming.length) return
    if (!multiple) incoming = incoming.slice(0, 1)

    const accepted: File[] = []
    const newlyRejected: Rejected[] = []
    const said: string[] = []
    // A single-file picker replaces its file; a multiple one appends.
    const kept = multiple ? files : []

    for (const file of incoming) {
      let reason: FileRejectReason | null = null
      let message = ""
      if (!accepts(accept, file)) {
        reason = "type"
        message = "File type not allowed"
      } else if (maxSize != null && file.size > maxSize) {
        reason = "size"
        message = `Too large, max ${formatBytes(maxSize)}`
      } else if (maxFiles != null && kept.length + accepted.length >= maxFiles) {
        reason = "count"
        message = `Limit of ${maxFiles} ${maxFiles === 1 ? "file" : "files"} reached`
      }
      if (reason) {
        newlyRejected.push({ id: nextId.current++, file, reason, message })
        onReject?.(file, reason)
        said.push(`${file.name}: ${message}`)
      } else {
        accepted.push(file)
        said.push(`${file.name} added`)
      }
    }

    if (!multiple) {
      files.forEach((f) => controllers.current.get(f)?.abort())
      setRejected(newlyRejected)
    } else if (newlyRejected.length) {
      setRejected((prev) => [...prev, ...newlyRejected])
    }
    if (accepted.length || !multiple) setFiles([...kept, ...accepted])
    accepted.forEach(startUpload)
    setStatus(`${said.join(". ")}.`)
  }

  const removeFile = (file: File, index: number) => {
    controllers.current.get(file)?.abort()
    controllers.current.delete(file)
    patchUpload(file, null)
    setFiles(files.filter((f) => f !== file))
    pendingFocus.current = index
    setStatus(`${file.name} removed.`)
  }

  const removeRejected = (item: Rejected, index: number) => {
    setRejected((prev) => prev.filter((r) => r.id !== item.id))
    pendingFocus.current = index
    setStatus(`${item.file.name} removed.`)
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const dropHandlers = {
    "data-dragging": dragging || undefined,
    onDragEnter: (e: React.DragEvent) => {
      if (disabled) return
      e.preventDefault()
      setDragging(true)
    },
    onDragOver: (e: React.DragEvent) => {
      if (disabled) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
      setDragging(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
    },
    onDrop: (e: React.DragEvent) => {
      if (disabled) return
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      data-slot="file-upload-input"
      hidden
      tabIndex={-1}
      aria-hidden
      multiple={multiple}
      accept={accept?.join(",")}
      disabled={disabled}
      onChange={(e) => {
        addFiles(e.currentTarget.files)
        e.currentTarget.value = ""
      }}
    />
  )

  const statusRegion = (
    <span data-slot="file-upload-status" role="status" className="sr-only">
      {status}
    </span>
  )

  const hintNode =
    hint != null ? (
      <p
        id={hintId}
        data-slot="file-upload-hint"
        className={cn("text-[12.5px] text-muted-foreground/70", variant === "dropzone" && "mt-1")}
      >
        {hint}
      </p>
    ) : null

  const rejectedRows = rejected.map((item, i) => (
    <FileUploadItem
      key={`rejected-${item.id}`}
      name={item.file.name}
      size={item.file.size}
      error={item.message}
      onRemove={() => removeRejected(item, files.length + i)}
    />
  ))

  /* ------------------------------ compact ------------------------------ */
  if (variant === "compact") {
    const file = files[0]
    const rejection = rejected[0]
    const chosen = Boolean(file || rejection)
    return (
      <div
        ref={rootRef}
        data-slot="file-upload"
        data-variant="compact"
        id={id}
        className={cn("flex w-full flex-col gap-1.5 text-left", className)}
        {...props}
      >
        {input}
        {label != null && (
          <span id={labelId} className="flex gap-1 text-[13.5px] font-medium text-foreground">
            {label}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            ref={browseRef}
            variant="secondary"
            leadingIcon={<Upload aria-hidden />}
            disabled={disabled}
            aria-describedby={cn(label != null && labelId, nameId, hint != null && hintId)}
            onClick={openPicker}
          >
            Upload file
          </Button>
          <span id={nameId} className="text-sm [overflow-wrap:anywhere] text-muted-foreground">
            {rejection ? (
              <span className="font-medium text-[color-mix(in_oklab,var(--color-destructive)_80%,var(--color-foreground))]">
                {rejection.file.name}: {rejection.message}
              </span>
            ) : file ? (
              <>
                {file.name} <span className="text-muted-foreground/70">{formatBytes(file.size)}</span>
              </>
            ) : (
              "No file chosen"
            )}
          </span>
          {chosen && (
            <Button
              data-slot="file-upload-remove"
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="Remove chosen file"
              onClick={() => {
                if (file) removeFile(file, 0)
                setRejected([])
                pendingFocus.current = -1
                setStatus("File removed.")
              }}
            >
              <X aria-hidden />
            </Button>
          )}
        </div>
        {hintNode}
        {statusRegion}
      </div>
    )
  }

  /* ------------------------------ images ------------------------------- */
  if (variant === "images") {
    return (
      <div
        ref={rootRef}
        data-slot="file-upload"
        data-variant="images"
        id={id}
        className={cn("flex w-full max-w-[480px] flex-col gap-2.5 text-left", className)}
        {...props}
      >
        {input}
        {label != null && (
          <span id={labelId} className="flex gap-1 text-[13.5px] font-medium text-foreground">
            {label}
          </span>
        )}
        <div
          data-slot="file-upload-grid"
          {...dropHandlers}
          className="flex flex-wrap gap-2.5 rounded-lg border-[1.5px] border-dashed border-input bg-background p-2.5 transition-colors data-dragging:border-primary data-dragging:bg-primary-soft motion-reduce:transition-none"
        >
          <ul aria-label={typeof label === "string" ? label : "Images"} className="contents">
            {files.map((file, i) => (
              <FileUploadTile
                key={`${file.name}-${file.lastModified}-${i}`}
                file={file}
                upload={uploads.get(file)}
                onRemove={() => removeFile(file, i)}
              />
            ))}
          </ul>
          <button
            ref={browseRef}
            type="button"
            data-slot="file-upload-add"
            disabled={disabled}
            aria-describedby={hint != null ? hintId : undefined}
            onClick={openPicker}
            className="flex size-[104px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border bg-muted/50 p-0 text-[12.5px] font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
          >
            <Plus aria-hidden className="size-5" />
            <span>Add images</span>
          </button>
        </div>
        {hintNode}
        {rejected.length > 0 && (
          <ul aria-label="Rejected files" className="flex flex-col gap-2">
            {rejectedRows}
          </ul>
        )}
        {statusRegion}
      </div>
    )
  }

  /* ----------------------------- dropzone ------------------------------ */
  return (
    <div
      ref={rootRef}
      data-slot="file-upload"
      data-variant="dropzone"
      id={id}
      className={cn("flex w-full max-w-[480px] flex-col gap-2.5 text-left", className)}
      {...props}
    >
      {input}
      {label != null && (
        <span id={labelId} className="flex gap-1 text-[13.5px] font-medium text-foreground">
          {label}
        </span>
      )}
      <div
        data-slot="file-upload-dropzone"
        data-disabled={disabled || undefined}
        {...dropHandlers}
        onClick={(e) => {
          if (!(e.target as Element).closest("button,a")) openPicker()
        }}
        className="cursor-pointer rounded-lg border-[1.5px] border-dashed border-input bg-background px-5 py-6 text-center text-sm text-muted-foreground transition-colors hover:border-[color-mix(in_oklab,var(--color-input)_60%,var(--color-muted-foreground))] data-disabled:cursor-not-allowed data-disabled:opacity-60 data-dragging:border-primary data-dragging:bg-primary-soft motion-reduce:transition-none"
      >
        <span
          aria-hidden
          className="mx-auto mb-2.5 grid size-10 place-items-center rounded-full bg-primary-soft text-primary-text"
        >
          <Upload className="size-5" />
        </span>
        <p className="m-0">
          <Button
            ref={browseRef}
            variant="link"
            disabled={disabled}
            aria-describedby={hint != null ? hintId : undefined}
            onClick={openPicker}
          >
            Browse files
          </Button>{" "}
          or drag them here
        </p>
        {hintNode}
      </div>
      {files.length + rejected.length > 0 && (
        <div>
          <ul
            data-slot="file-upload-list"
            aria-label={typeof label === "string" ? label : "Uploads"}
            className="m-0 flex list-none flex-col gap-2 p-0"
          >
            {files.map((file, i) => (
              <FileUploadItem
                key={`${file.name}-${file.lastModified}-${i}`}
                name={file.name}
                size={file.size}
                upload={uploads.get(file)}
                onRemove={() => removeFile(file, i)}
              />
            ))}
            {rejectedRows}
          </ul>
        </div>
      )}
      {statusRegion}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Parts                                                                      */
/* -------------------------------------------------------------------------- */

type FileUploadItemProps = {
  name: string
  size: number
  upload?: UploadState
  error?: string
  onRemove: () => void
}

function FileUploadItem({ name, size, upload, error, onRemove }: FileUploadItemProps) {
  const failure = error ?? (upload?.status === "error" ? upload.error : undefined)
  const uploading = !failure && upload?.status === "uploading"
  const done = !failure && upload?.status === "done"
  const pct = Math.round(upload?.progress ?? 0)

  return (
    <li
      data-slot="file-upload-item"
      data-status={failure ? "error" : (upload?.status ?? "idle")}
      className={cn(
        "m-0 flex items-center gap-3 rounded-lg border bg-background py-2.5 pr-2 pl-3 shadow-xs",
        failure && "border-[color-mix(in_oklab,var(--color-destructive)_35%,var(--color-border))]"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-[34px] flex-none place-items-center rounded-md bg-primary-soft text-primary-text [&_svg]:size-4",
          failure && "bg-destructive-soft text-destructive"
        )}
      >
        {failure ? <CircleAlert /> : <FileIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-[13.5px]">
          <b className="min-w-0 truncate font-medium text-foreground">{name}</b>
          {uploading && (
            <span className="flex-none text-muted-foreground/70 tabular-nums">{pct}%</span>
          )}
          {done && <CircleCheck aria-label="Uploaded" className="size-4 flex-none text-success" />}
        </div>
        <div className={cn("text-[12.5px] text-muted-foreground/70", uploading && "mb-1")}>
          {formatBytes(size)}
          {failure ? (
            <>
              {" · "}
              <span className="font-medium text-[color-mix(in_oklab,var(--color-destructive)_80%,var(--color-foreground))]">
                {failure}
              </span>
            </>
          ) : uploading ? (
            " · Uploading"
          ) : done ? (
            " · Uploaded"
          ) : null}
        </div>
        {uploading && <UploadProgress name={name} value={pct} />}
      </div>
      <Button
        data-slot="file-upload-remove"
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={`Remove ${name}`}
        onClick={onRemove}
      >
        {failure ? <X aria-hidden /> : <Trash2 aria-hidden />}
      </Button>
    </li>
  )
}

function UploadProgress({ name, value, className }: { name: string; value: number; className?: string }) {
  return (
    <div
      data-slot="file-upload-progress"
      role="progressbar"
      aria-label={`Uploading ${name}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("h-[5px] w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-[inherit] bg-primary transition-[width] duration-400 motion-reduce:transition-none"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function FileUploadTile({
  file,
  upload,
  onRemove,
}: {
  file: File
  upload?: UploadState
  onRemove: () => void
}) {
  // One object URL per tile, revoked when the tile goes away.
  const [url, setUrl] = React.useState<string>()
  React.useEffect(() => {
    const next = URL.createObjectURL(file)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [file])

  const failed = upload?.status === "error"

  return (
    <li data-slot="file-upload-tile" className="relative m-0 w-[104px]">
      {url ? (
        <img
          src={url}
          alt={file.name}
          className="block size-[104px] rounded-md bg-muted object-cover shadow-[inset_0_0_0_1px_var(--color-border)]"
        />
      ) : (
        <span className="block size-[104px] rounded-md bg-muted" />
      )}
      {upload?.status === "uploading" && (
        <UploadProgress
          name={file.name}
          value={Math.round(upload.progress)}
          className="absolute inset-x-2 top-[90px] w-auto bg-background/80"
        />
      )}
      <span
        className={cn(
          "mt-1 block truncate text-xs text-muted-foreground",
          failed && "text-destructive"
        )}
      >
        {failed ? upload?.error : file.name}
      </span>
      <button
        type="button"
        data-slot="file-upload-remove"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 grid size-[26px] cursor-pointer place-items-center rounded-full border bg-background p-0 text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </li>
  )
}

export {
  FileUpload,
  formatBytes,
  type FileUploadProps,
  type FileUploadContext,
  type FileRejectReason,
}
