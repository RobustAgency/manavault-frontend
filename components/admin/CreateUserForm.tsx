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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useAssignUserRoleMutation,
    useCreateUserMutation,
    useGetRolesQuery,
} from "@/lib/redux/features";
import { Loader2, UserPlus } from "lucide-react";

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const formRef = useRef<HTMLFormElement | null>(null);
    const [createUser, { isLoading }] = useCreateUserMutation();
    const [assignUserRole, { isLoading: isAssigningRole }] = useAssignUserRoleMutation();
    const { data: rolesData, isLoading: isRolesLoading } = useGetRolesQuery(
        { per_page: 100 },
        { skip: !open }
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedRoleId) {
            toast.error("Please select a role");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const payload = {
            name: String(formData.get("full-name") || ""),
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
            role_id: Number(selectedRoleId) || 0,
        };


        try {
            const result = await createUser(payload).unwrap();
            const createdUserId = result?.data?.id;
            if (!createdUserId) {
                throw new Error("User created but user id is missing");
            }
            await assignUserRole({
                userId: String(createdUserId),
                roleId: Number(selectedRoleId),
            }).unwrap();
            toast.success(result?.message || "User created successfully");
            formRef.current?.reset();
            setSelectedRoleId("");
            setOpen(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create user or assign role");
        }
    };

    // Reset form when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setSelectedRoleId("");
        }
        if (!newOpen && formRef.current) {
            formRef.current.reset();
        }
    };

    const roles = rolesData?.data ?? [];
    const isSubmitting = isLoading || isAssigningRole;
    const hasRoles = roles.length > 0;

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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 6 characters long
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={selectedRoleId}
                                onValueChange={setSelectedRoleId}
                                disabled={isSubmitting || isRolesLoading || !hasRoles}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue
                                        placeholder={
                                            isRolesLoading
                                                ? "Loading roles..."
                                                : hasRoles
                                                  ? "Select a role"
                                                  : "No roles available"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!isRolesLoading && !hasRoles && (
                                <p className="text-xs text-destructive">
                                    No roles found. Create a role before creating users.
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || !selectedRoleId || !hasRoles}
                        >
                            {isSubmitting ? (
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

