'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditPriceCellProps, PendingPriceCellProps } from '@/types';

export const PendingPriceCell = ({
    isSaving = false,
    placeholder = '0.00',
    onAdd,
    onCancel,
}: PendingPriceCellProps) => {
    const [value, setValue] = useState('');

    return (
        <div className="flex items-center gap-1 min-w-[210px]">
            <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-7 w-24 text-sm"
                min="0"
                autoFocus
                placeholder={placeholder}
            />
            <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onAdd(value)}
                disabled={isSaving}
            >
                {isSaving ? '...' : 'Add'}
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
    );
};

export const EditPriceCell = ({
    initialValue,
    isSaving = false,
    onSave,
    onCancel,
}: EditPriceCellProps) => {
    const [value, setValue] = useState(initialValue);

    return (
        <div className="flex items-center gap-1 min-w-[210px]">
            <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-7 w-24 text-sm"
                min="0"
                autoFocus
            />
            <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onSave(value)}
                disabled={isSaving}
            >
                {isSaving ? '...' : 'Save'}
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
    );
};
