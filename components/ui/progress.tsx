"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  color?: "default" | "green" | "blue" | "orange" | "red" | "yellow"
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, color = "default", ...props }, ref) => {
    const getColorClasses = (color: string) => {
      switch (color) {
        case "green":
          return "bg-green-500"
        case "blue":
          return "bg-blue-500"
        case "orange":
          return "bg-orange-500"
        case "red":
          return "bg-red-500"
        case "yellow":
          return "bg-yellow-500"
        default:
          return "bg-primary"
      }
    }

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full flex-1 transition-all", getColorClasses(color))}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    )
  },
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
