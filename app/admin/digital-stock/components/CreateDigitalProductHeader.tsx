import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CreateDigitalProductHeaderProps = {
    productCount: number;
    onBack: () => void;
};

export const CreateDigitalProductHeader = ({
    productCount,
    onBack,
}: CreateDigitalProductHeaderProps) => (
    <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
        </Button>
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
                Create Digital Product{productCount > 1 ? `s (${productCount})` : ''}
            </h1>
            <p className="text-muted-foreground">
                {productCount > 1
                    ? 'Add multiple digital products from external suppliers'
                    : 'Add a new digital product from external suppliers'}
            </p>
        </div>
    </div>
);
