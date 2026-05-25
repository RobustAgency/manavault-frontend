import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EditProductHeaderProps = {
    onBack: () => void;
};

export const EditProductHeader = ({ onBack }: EditProductHeaderProps) => (
    <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
        </Button>
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
        </div>
    </div>
);
