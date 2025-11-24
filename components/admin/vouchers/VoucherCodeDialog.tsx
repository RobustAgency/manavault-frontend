'use client';

import { useEffect, useState } from 'react';
import { Loader2, Eye, XCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetDecryptedVoucherMutation } from '@/lib/redux/features';

interface VoucherCodeDialogProps {
    voucherId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Get user's IP address using a public API
 * Falls back to 'unknown' if the API call fails
 */
async function getUserIPAddress(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'unknown';
    } catch (error) {
        console.error('Failed to fetch IP address:', error);
        return 'unknown';
    }
}

/**
 * Get user agent from browser
 */
function getUserAgent(): string {
    if (typeof window === 'undefined') return '';
    return window.navigator.userAgent || '';
}

export const VoucherCodeDialog = ({
    voucherId,
    isOpen,
    onClose,
}: VoucherCodeDialogProps) => {
    const [getDecryptedVoucher, { data, isLoading, isError, reset }] =
        useGetDecryptedVoucherMutation();
    const [isFetchingClientInfo, setIsFetchingClientInfo] = useState(false);

    useEffect(() => {
        if (isOpen && voucherId) {
            const fetchVoucherCode = async () => {
                setIsFetchingClientInfo(true);
                try {
                    const ipAddress = await getUserIPAddress();
                    const userAgent = getUserAgent();

                    await getDecryptedVoucher({
                        voucherId,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                    }).unwrap();
                } catch (error) {
                    console.error('Failed to get decrypted voucher:', error);
                } finally {
                    setIsFetchingClientInfo(false);
                }
            };

            fetchVoucherCode();
        }
    }, [isOpen, voucherId, getDecryptedVoucher]);

    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const handleClose = () => {
        onClose();
    };

    const isProcessing = isLoading || isFetchingClientInfo;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Voucher Code
                    </DialogTitle>
                    <DialogDescription>
                        This is the decrypted voucher code.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {isProcessing && (
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Decrypting voucher code...</span>
                        </div>
                    )}
                    {isError && !isProcessing && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Failed to decrypt voucher code</p>
                                <p className="text-xs mt-1">Please try again or contact support.</p>
                            </div>
                        </div>
                    )}
                    {!isProcessing && !isError && data && (
                        <div className="space-y-3">
                            <div
                                className="select-none rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center"
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => e.preventDefault()}
                                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                            >
                                <p className="font-bold text-primary break-all">
                                    {data.code}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
