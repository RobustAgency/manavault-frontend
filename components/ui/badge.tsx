import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-200",
  {
    variants: {
      variant: {
        filled: "border-transparent",
        outlined: "bg-transparent",
        light: "border-transparent",
      },
      color: {
        default: "",
        success: "",
        warning: "",
        error: "",
        info: "",
      },
    },
    compoundVariants: [
      {
        variant: "light",
        color: "success",
        class: "bg-green-50 text-green-700 border-green-200",
      },
      {
        variant: "light",
        color: "warning",
        class: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      {
        variant: "light",
        color: "error",
        class: "bg-red-50 text-red-700 border-red-200",
      },
      {
        variant: "light",
        color: "info",
        class: "bg-blue-50 text-blue-700 border-blue-200",
      },
      {
        variant: "light",
        color: "default",
        class: "bg-gray-50 text-gray-700 border-gray-200",
      },
      {
        variant: "filled",
        color: "success",
        class: "bg-green-600 text-white border-green-600",
      },
      {
        variant: "filled",
        color: "warning",
        class: "bg-warning text-white border-warning",
      },
      {
        variant: "filled",
        color: "error",
        class: "bg-red-600 text-white border-red-600",
      },
      {
        variant: "filled",
        color: "info",
        class: "bg-blue-600 text-white border-blue-600",
      },
      {
        variant: "filled",
        color: "default",
        class: "bg-gray-600 text-white border-gray-600",
      },
      {
        variant: "outlined",
        color: "success",
        class: "text-green-700 border-green-300 hover:bg-green-50",
      },
      {
        variant: "outlined",
        color: "warning",
        class: "text-yellow-700 border-yellow-300 hover:bg-yellow-50",
      },
      {
        variant: "outlined",
        color: "error",
        class: "text-red-700 border-red-300 hover:bg-red-50",
      },
      {
        variant: "outlined",
        color: "info",
        class: "text-blue-700 border-blue-300 hover:bg-blue-50",
      },
      {
        variant: "outlined",
        color: "default",
        class: "text-gray-700 border-gray-300 hover:bg-gray-50",
      },
    ],
    defaultVariants: {
      variant: "light",
      color: "info",
    },
  }
)

export interface BadgeProps
  extends Omit<React.ComponentProps<"span">, "color">,
  VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({
  className,
  variant,
  color,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }