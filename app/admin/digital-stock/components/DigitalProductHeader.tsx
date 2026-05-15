import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DigitalProductHeaderProps = {
    name: string;
    sku: string;
    onBack: () => void;
};

export const DigitalProductHeader = ({ name, sku, onBack }: DigitalProductHeaderProps) => (
    <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Digital Stock
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold">{name}</h1>
                <p className="text-muted-foreground mt-1">
                    SKU:{' '}
                    <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                        {sku}
                    </code>
                </p>
            </div>
        </div>
    </div>
);
