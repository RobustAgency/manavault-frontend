"use client";

import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { createUser } from "@/lib/admin-actions";
import { Loader2, UserPlus } from "lucide-react";

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createUser(formData);

        if (result.success) {
            toast.success(result.message || "User created successfully");
            formRef.current?.reset();
            setOpen(false);
            onSuccess?.();
        } else {
            toast.error(result.message || "Failed to create user");
        }

        setIsLoading(false);
    };

    // Reset form when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen && formRef.current) {
            formRef.current.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create New User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account. The user will receive login credentials and will be required to set up MFA on first login.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input
                                id="full-name"
                                name="full-name"
                                placeholder="John Doe"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 6 characters long
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating user...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

