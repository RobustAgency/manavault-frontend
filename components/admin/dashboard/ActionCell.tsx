"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TableUser } from "@/hooks/admin/useUsers"
import ConfirmationDialog from "@/components/custom/ConfirmationDialog"
import { deleteUser } from "@/lib/admin-actions"
import { toast } from "react-toastify"

interface ActionCellProps {
    user: TableUser
    onRefresh?: () => void
}

const ActionCell = ({ user, onRefresh }: ActionCellProps) => {
    const [showDialog, setShowDialog] = useState(false)
    const [currentAction, setCurrentAction] = useState<"approve" | "delete" | null>(null)
    const [isLoading, setIsLoading] = useState(false)

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
            const result = await deleteUser(user.id)
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

    return (
        <>
            <Button
                color="red"
                onClick={() => handleActionClick("delete")}
            >Delete</Button>
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
        </>
    )
}

export default ActionCell