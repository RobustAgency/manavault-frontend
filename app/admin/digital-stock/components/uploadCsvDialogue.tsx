'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    useGetSuppliersQuery,
} from '@/lib/redux/features';
import { GlobalSupplierSelector } from './GlobalSupplierSelector';
import { CSVUploader } from './CsvUploader';
import { useCreateCSVUploadMutation } from '@/lib/redux/features/purchaseOrdersApi';
import { useCSVUpload } from './useCSVFileForm';
import { toast } from 'react-toastify';

export interface UploadCsvDialogueProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UploadCsvDialogue = ({
    isOpen,
    onClose,
}: UploadCsvDialogueProps) => {
    const { file, setFile, validateForm, selectedSupplierId, setSelectedSupplierId, resetForm, errors } = useCSVUpload();

    const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100, status: 'active', type: 'internal' });
    const [createCSVUpload, { isLoading: isUploading }] = useCreateCSVUploadMutation();


    const handleSupplierChange = (supplierId: number) => {
        setSelectedSupplierId(supplierId);
    };


    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('supplier_id', selectedSupplierId?.toString() ?? '');
            if (file) {
                formData.append('file', file);
                await createCSVUpload(formData).unwrap();
                toast.success('CSV uploaded successfully');
                resetForm();
                onClose();
            }
        } catch (error) {
            toast.error( 'Failed to upload CSV file');
        }

    };

    const handleClose = () => {
        resetForm();
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV File to add digital stocks
                    </DialogDescription>
                </DialogHeader>
                <div className="py-1 border-b">
                    <GlobalSupplierSelector
                        selectedSupplierId={selectedSupplierId}
                        suppliers={suppliersData?.data || []}
                        error={errors.supplier_id}
                        onSupplierChange={handleSupplierChange}
                        onAddNewSupplier={() => (false)}
                        addNewSupplier={false}
                    />
                </div>
                <CSVUploader
                    file={file}
                    setFile={setFile}
                    error={errors.file}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Add CSV'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
