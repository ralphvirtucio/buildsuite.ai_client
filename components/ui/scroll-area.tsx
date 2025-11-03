"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Lightweight ScrollArea substitute without Radix dependency
export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-muted", className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

ScrollArea.displayName = "ScrollArea"

