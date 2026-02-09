"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TableUser } from "@/hooks/admin/useUsers"
import ConfirmationDialog from "@/components/custom/ConfirmationDialog"
import { deleteUser } from "@/lib/admin-actions"
import { toast } from "react-toastify"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAssignUserRoleMutation, useGetRolesQuery } from "@/lib/redux/features"
import { userInfoApi } from "@/lib/redux/features/userInfoApi"
import { useAppDispatch } from "@/lib/redux/hooks"
import { usePermissions } from "@/hooks/usePermissions"
import { getModulePermission, hasPermission } from "@/lib/permissions"

interface ActionCellProps {
    user: TableUser
    onRefresh?: () => void
}

const ActionCell = ({ user, onRefresh }: ActionCellProps) => {
    const { permissionSet } = usePermissions()
    const dispatch = useAppDispatch()
    const [showDialog, setShowDialog] = useState(false)
    const [showAssignDialog, setShowAssignDialog] = useState(false)
    const [currentAction, setCurrentAction] = useState<"approve" | "delete" | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

    const { data: rolesData, isLoading: isRolesLoading } = useGetRolesQuery(
        { per_page: 100 },
        { skip: !showAssignDialog }
    )
    const [assignUserRole, { isLoading: isAssigning }] = useAssignUserRoleMutation()

    const handleActionClick = (action: "approve" | "delete") => {
        setCurrentAction(action)
        setShowDialog(true)
    }

    const handleClose = () => {
        if (!isLoading) {
            setShowDialog(false)
            setCurrentAction(null)
        }
    }

    const handleAssignClose = () => {
        if (!isAssigning) {
            setShowAssignDialog(false)
            setSelectedRoleId(null)
        }
    }

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            // Since users are auto-confirmed when created, approve action might not be needed
            // But keeping it for now in case you want to implement approval logic later
            toast.info("Users are automatically approved when created")
            handleClose()
            onRefresh?.()
        } catch {
            toast.error("Error approving user")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const result = await deleteUser(user.id.toString())
            if (!result.success) {
                toast.error(result.message || "Failed to delete user")
            } else {
                toast.success(result.message || "User deleted successfully")
                handleClose()
                onRefresh?.()
            }
        } catch (error) {
            toast.error("Error deleting user")
            console.error("Delete error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssignSubmit = async () => {
        if (!selectedRoleId) {
            toast.error("Please select a role")
            return
        }
        try {
            await assignUserRole({ userId: user.id.toString(), roleId: selectedRoleId }).unwrap()
            toast.success("Role assigned successfully")
            handleAssignClose()
            dispatch(userInfoApi.util.invalidateTags([{ type: "UserInfo", id: "LIST" }]))
            onRefresh?.()
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to assign role")
        }
    }

    const handleConfirm = () => {
        if (currentAction === "approve") {
            handleApprove()
        } else if (currentAction === "delete") {
            handleDelete()
        }
    }

    const isApproved = user.status === "approved"

    const getDialogConfig = () => {
        if (currentAction === "approve") {
            return {
                title: "Approve User",
                description: `Are you sure you want to approve ${user.full_name}?`,
                confirmText: "Approve",
                type: "success" as const
            }
        } else if (currentAction === "delete") {
            return {
                title: "Delete User",
                description: `Are you sure you want to delete ${user.full_name}? This action cannot be undone.`,
                confirmText: "Delete",
                type: "danger" as const
            }
        }
        return {
            title: "",
            description: "",
            confirmText: "",
            type: "danger" as const
        }
    }

    const dialogConfig = getDialogConfig()
    const canAssignRole = hasPermission(getModulePermission("edit", "user"), permissionSet)
    const canDelete = hasPermission(getModulePermission("delete", "user"), permissionSet)

    if (!canAssignRole && !canDelete) {
        return null
    }

    return (
        <>
            <div className="flex gap-2">
                {canAssignRole && (
                    <Button
                        variant="outline"
                        onClick={() => setShowAssignDialog(true)}
                    >
                        Assign Role
                    </Button>
                )}
                {canDelete && (
                    <Button
                        color="red"
                        onClick={() => handleActionClick("delete")}
                    >
                        Delete
                    </Button>
                )}
            </div>
            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                     <DropdownMenuItem
                        onClick={() => handleActionClick("approve")}
                        disabled={isApproved}
                        className={`${!isApproved && 'cursor-pointer'}`}
                    >
                        {isApproved ? "Approved" : "Approve"}
                    </DropdownMenuItem> 
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => handleActionClick("delete")}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>  */}

            {currentAction && (
                <ConfirmationDialog
                    isOpen={showDialog}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    title={dialogConfig.title}
                    description={dialogConfig.description}
                    confirmText={dialogConfig.confirmText}
                    type={dialogConfig.type}
                    isLoading={isLoading}
                />
            )}

            <Dialog open={showAssignDialog} onOpenChange={(open) => !open && handleAssignClose()}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Assign Role</DialogTitle>
                        <DialogDescription>
                            Select a role to assign to {user.full_name}.
                        </DialogDescription>
                    </DialogHeader>

                    {isRolesLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                            Loading roles...
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor={`role-select-${user.id}`}>Role</Label>
                            <Select
                                value={selectedRoleId ? selectedRoleId.toString() : undefined}
                                onValueChange={(value) => setSelectedRoleId(Number(value))}
                            >
                                <SelectTrigger id={`role-select-${user.id}`}>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(rolesData?.data ?? []).map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(rolesData?.data ?? []).length === 0 && (
                                <p className="text-xs text-muted-foreground">No roles available.</p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleAssignClose} disabled={isAssigning}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignSubmit} disabled={isAssigning || isRolesLoading}>
                            {isAssigning ? "Assigning..." : "Assign Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ActionCell