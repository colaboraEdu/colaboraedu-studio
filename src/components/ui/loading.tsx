/**
 * Loading Overlay Component
 * 
 * Displays a loading spinner overlay for async operations
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
  className?: string
  message?: string
  fullScreen?: boolean
}

export function LoadingOverlay({
  loading,
  children,
  className,
  message = "Loading...",
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!loading) {
    return <>{children}</>
  }

  return (
    <div className={cn("relative", className)}>
      {/* Content (dimmed when loading) */}
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        {children}
      </div>

      {/* Loading overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50",
          fullScreen && "fixed"
        )}
      >
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * Simple loading spinner
 */
interface LoadingSpinnerProps {
  className?: string
  message?: string
}

export function LoadingSpinner({ className, message }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

/**
 * Inline loading state
 */
export function InlineLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Button loading state
 * Use the Button component from shadcn/ui with loading prop instead
 */
interface ButtonLoadingProps {
  loading?: boolean
  message?: string
}

export function ButtonLoading({ loading = true, message }: ButtonLoadingProps) {
  if (!loading) return null
  
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
}
