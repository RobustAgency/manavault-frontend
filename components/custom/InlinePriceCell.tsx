'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

export interface PendingPriceCellProps {
    initialValue?: string;
    isSaving?: boolean;
    placeholder?: string;
    variant?: 'price' | 'percentage';
    buttonLabel?: string;
    forceShowError?: boolean;
    onClearError?: () => void;
    onValueChange?: (value: string) => void;
    onAdd: (value: string) => void;
    onCancel: () => void;
}

export const PendingPriceCell = ({
    initialValue = '',
    isSaving = false,
    placeholder,
    variant = 'price',
    buttonLabel = 'Add',
    forceShowError = false,
    onClearError,
    onValueChange,
    onAdd,
    onCancel,
}: PendingPriceCellProps) => {
    const isPercentage = variant === 'percentage';
    const resolvedPlaceholder =
        placeholder ?? (isPercentage ? '0' : '0.00');

    const [value, setValue] = useState(initialValue);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const percentageIsInvalid = (raw: string, parsed: number): boolean => {
        if (!raw.trim() || isNaN(parsed)) return true;
        return parsed > 100;
    };

    useEffect(() => {
        if (forceShowError) {
            const parsed = parseFloat(value);
            const isInvalid = isPercentage
                ? percentageIsInvalid(value, parsed)
                : !value.trim() || isNaN(parsed);
            setHasError(isInvalid);
        }
    }, [forceShowError, value, isPercentage]);

    const validate = (): boolean => {
        const parsed = parseFloat(value);
        if (isPercentage) {
            if (percentageIsInvalid(value, parsed)) {
                setHasError(true);
                return false;
            }
            setHasError(false);
            return true;
        }
        if (!value.trim() || isNaN(parsed) ) {
            setHasError(true);
            return false;
        }
        setHasError(false);
        return true;
    };

    const handleConfirm = () => {
        if (!validate()) return;
        onClearError?.();
        onAdd(value);
    };

    const handleCancelClick = () => {
        setValue(initialValue);
        setHasError(false);
        onCancel();
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 min-w-[210px]">
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        setValue(v);
                        onValueChange?.(v);
                        if (hasError) setHasError(false);
                    }}
                    className={`h-7 w-24 text-sm ${hasError
                        ? 'border-red-500 focus-visible:ring-red-500 bg-red-50 dark:bg-red-950/20'
                        : ''
                        }`}
                    min={isPercentage ? undefined : '0.01'}
                    max={isPercentage ? '100' : undefined}
                    step="0.01"
                    autoFocus
                    placeholder={resolvedPlaceholder}
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
                    onClick={handleCancelClick}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
            </div>
            {hasError && (
                <p className="text-xs text-red-500 ml-0.5">
                    {isPercentage
                        ? 'Enter a valid percentage (100% maximum; negatives allowed)'
                        : 'Price must be greater than 0'}
                </p>
            )}
        </div>
    );
};
