'use client'

import * as React from 'react'
import * as Switch from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  id: string
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const ToggleSwitch = ({
  id,
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  className,
}: ToggleSwitchProps) => {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <label
          htmlFor={id}
          className="text-sm leading-none text-black cursor-pointer"
        >
          {label}
        </label>
      )}

      <Switch.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 rounded-full bg-black shadow-2xl drop-shadow-lg outline-none transition-colors',
          'data-[state=checked]:bg-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      > 
        <Switch.Thumb
          className="
            block size-5 translate-x-0.5 rounded-full bg-white shadow
            transition-transform duration-100 will-change-transform
            data-[state=checked]:translate-x-[19px]
          "
        />
      </Switch.Root>
    </div>
  )
}
