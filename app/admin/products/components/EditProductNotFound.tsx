import { Button } from '@/components/ui/button';

type EditProductNotFoundProps = {
    onGoBack: () => void;
};

export const EditProductNotFound = ({ onGoBack }: EditProductNotFoundProps) => (
    <div className="container mx-auto py-8 max-w-3xl">
        <div className="text-center">
            <p className="text-muted-foreground">Product not found</p>
            <Button onClick={onGoBack} className="mt-4">
                Go to Products
            </Button>
        </div>
    </div>
);
