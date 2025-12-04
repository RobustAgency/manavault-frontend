'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePickerProps {
    value: string | File;
    onChange: (value: string | File) => void;
    label?: string;
    description?: string;
    error?: string;
    disabled?: boolean;
    acceptUrl?: boolean; // Allow pasting URL
}

export const ImagePicker = ({
    value,
    onChange,
    label,
    description,
    error,
    disabled = false,
    acceptUrl = false,
}: ImagePickerProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const openFileDialog = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    const validateFile = (file: File): string | null => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) return 'Only image files are allowed';
        const maxBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxBytes) return 'Maximum file size is 5MB';
        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validation = validateFile(file);
        if (validation) {
            setValidationError(validation);
            return;
        }

        setValidationError(null);

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        // Pass the file object to parent
        onChange(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const validation = validateFile(file);
        if (validation) {
            setValidationError(validation);
            return;
        }

        setValidationError(null);

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Pass the file object to parent
        onChange(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemove = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
        }
        onChange('');
        setValidationError(null);
    };

    // Determine the display image
    const displayImage = React.useMemo(() => {
        if (value instanceof File) {
            return previewUrl;
        }
        return value as string;
    }, [value, previewUrl]);

    console.log(value)

    return (
        <div className="space-y-3">
            {label && <label className="text-sm font-medium">{label}</label>}

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`relative border-2 border-dashed rounded-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
                    } ${validationError || error ? 'border-red-500' : 'border-muted-foreground/25'}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />

                {value ? (
                    <div className="relative group">
                        <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                            <Image
                                src={displayImage}
                                alt="Product preview"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <div className="absolute inset-0 rounded-sm bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className='text-white'
                                onClick={openFileDialog}
                                disabled={disabled}
                            >
                                <Upload className="h-4 w-4 mr-2 " />
                                Change
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={openFileDialog}
                        className="flex flex-col items-center justify-center py-12 px-4 text-center"
                    >
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                    </div>
                )}
            </div>

            {description && !validationError && !error && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {(validationError || error) && (
                <p className="text-sm text-red-500">{validationError || error}</p>
            )}
        </div>
    );
};
