"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth-actions";
import SignInWithGoogleButton from "./SignInWithGoogleButton";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="animate-spin" />
                    Creating account...
                </>
            ) : (
                "Create an account"
            )}
        </Button>
    );
}

export function SignUpForm() {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [state, formAction] = useActionState(
        async (_prevState: unknown, formData: FormData) => {
            const result = await signup(formData);
            return result;

        },
        null as null | { success: boolean; message?: string }
    );

    useEffect(() => {
        if (!state) return;
        if (state.success) {
            toast.success("A verification email has been sent.");
            formRef.current?.reset();
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <Card className="min-w-sm mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Sign Up</CardTitle>
                <CardDescription>
                    Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full-name">Full name</Label>
                            <Input
                                name="full-name"
                                id="full-name"
                                placeholder="Max Robinson"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                name="email"
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput name="password" id="password" />
                        </div>
                        <SubmitButton />
                    </div>
                </form>
                <div className="mt-4">
                    {/* <SignInWithGoogleButton /> */}
                </div>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
