"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import { useFormStatus } from "react-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { updatePassword } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="cursor-pointer min-w-[100px] w-max min-h-[40px] text-white" disabled={pending}>
      {pending ? "Updating..." : "Update password"}
    </Button>
  )
}

export default function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const [state, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await updatePassword(formData);
    },
    null as null | { success: boolean; message?: string }
  )

  useEffect(() => {
    if (!state) return
    if (state.success) {
      toast.success("Password updated")
      formRef.current?.reset()
    } else if (state.message) {
      toast.error(state.message)
    }
    if (state?.success === false) {
      sessionStorage.setItem("returnUrl", "/settings");
      router.push("/verify-mfa");
    }
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Change password</CardTitle>
        <CardDescription>Enter your current password to set a new one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current_password">Current password</Label>
            <PasswordInput id="current_password" name="current_password" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new_password">New password</Label>
            <PasswordInput id="new_password" name="new_password" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <PasswordInput id="confirm_password" name="confirm_password" required />
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


