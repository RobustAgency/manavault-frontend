'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

export interface PendingPriceCellProps {
    initialValue?: string;
    isSaving?: boolean;
    placeholder?: string;
    /** Label shown on the confirm button. Defaults to "Add". Pass "Save" for edit mode. */
    buttonLabel?: string;
    /** When true, triggers validation and shows error state if value is invalid (e.g. on Save clicked) */
    forceShowError?: boolean;
    onAdd: (value: string) => void;
    onCancel: () => void;
}

export const PendingPriceCell = ({
    initialValue = '',
    isSaving = false,
    placeholder = '0.00',
    buttonLabel = 'Add',
    forceShowError = false,
    onAdd,
    onCancel,
}: PendingPriceCellProps) => {
    const [value, setValue] = useState(initialValue);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (forceShowError) {
            const parsed = parseFloat(value);
            if (!value.trim() || isNaN(parsed) || parsed <= 0) {
                setHasError(true);
            }
        }
    }, [forceShowError, value]);

    const validate = (): boolean => {
        const parsed = parseFloat(value);
        if (!value.trim() || isNaN(parsed) || parsed <= 0) {
            setHasError(true);
            return false;
        }
        setHasError(false);
        return true;
    };

    const handleConfirm = () => {
        if (validate()) onAdd(value);
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 min-w-[210px]">
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        if (hasError) setHasError(false);
                    }}
                    className={`h-7 w-24 text-sm ${
                        hasError
                            ? 'border-red-500 focus-visible:ring-red-500 bg-red-50 dark:bg-red-950/20'
                            : ''
                    }`}
                    min="0.01"
                    step="0.01"
                    autoFocus
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirm();
                        if (e.key === 'Escape') onCancel();
                    }}
                />
                <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleConfirm}
                    disabled={isSaving}
                >
                    {isSaving ? '...' : buttonLabel}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
            </div>
            {hasError && (
                <p className="text-xs text-red-500 ml-0.5">Price must be greater than 0</p>
            )}
        </div>
    );
};
