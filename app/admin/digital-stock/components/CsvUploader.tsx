'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { File, Upload, X } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react';

export const CSVUploader: React.FC<{ file: File | null; setFile: React.Dispatch<React.SetStateAction<File | null>>; error: string | undefined, }> = ({
    file,
    setFile,
    error
}) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const openFilePicker = () => {
        fileRef.current?.click();
    };

    const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
    };
    const handleRemove = () => {
        setFile(null);

        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    return (
        <div className='flex flex-col'>
        <div className='flex justify-end'><a href="/sample-csv/download-sample-csv" download className='flex text-blue-600! text-[12px] text-decoration-none justify-end pb-2'>Download Sample CSV</a></div>
        <div
            className="p-8 border-2 border-dashed rounded-lg text-center bg-gray-50 cursor-pointer hover:border-black">
            <Input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onClick={openFilePicker}
                onChange={handleUploadCSV}
            />

            {!file ? (
                <div onClick={openFilePicker}>

                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium mb-1">
                        Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Only CSV files are allowed
                    </p>
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>
            ) : (
                <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
                    <div className="flex items-center gap-3">
                        <File className="h-6 w-6 text-muted-foreground" />
                        <div className="text-left">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={openFilePicker}>
                            <Upload className="h-4 w-4 mr-1" />
                            Change
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleRemove}>
                            <X className="h-4 w-4 mr-1" />
                            Remove
                        </Button>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};
