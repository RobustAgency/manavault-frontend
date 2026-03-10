"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import Spinner from "@/components/ui/spinner"

export type ConfirmationType = "danger" | "warning" | "info" | "success"

interface ConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    type?: ConfirmationType
    isLoading?: boolean
    loadingText?: string
}

const ConfirmationDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description, 
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    isLoading = false,
    loadingText = "Loading..."
}: ConfirmationDialogProps) => {
    
    const getIcon = () => {
        switch (type) {
            case "danger":
                return <AlertTriangle className="h-5 w-5 text-red-500" />
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case "info":
                return <Info className="h-5 w-5 text-blue-500" />
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            default:
                return <AlertTriangle className="h-5 w-5 text-red-500" />
        }
    }

    const getConfirmButtonVariant = () => {
        switch (type) {
            case "danger":
                return "destructive"
            case "warning":
                return "destructive"
            case "info":
                return "default"
            case "success":
                return "default"
            default:
                return "destructive"
        }
    }

    const getConfirmButtonClassName = () => {
        switch (type) {
            case "danger":
                return "bg-destructive hover:bg-destructive/90"
            case "warning":
                return "bg-destructive hover:bg-destructive/90"
            case "info":
                return "bg-primary hover:bg-primary/90"
            case "success":
                return "bg-green-600 hover:bg-green-700"
            default:
                return "bg-destructive hover:bg-destructive/90"
        }
    }

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm()
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex text-lg font-semibold items-center gap-2">
                        {getIcon()}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant={getConfirmButtonVariant() as "destructive" | "default"}
                        className={getConfirmButtonClassName()}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Spinner size="sm" className="mr-2" />
                                {loadingText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmationDialog
