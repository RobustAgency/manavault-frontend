import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ErrorStateProps = {
    hasError: boolean;
    onBack: () => void;
};

export const ErrorState = ({ hasError, onBack }: ErrorStateProps) => (
    <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
        </Button>
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                    {hasError ? 'Failed to load digital product details' : 'Digital product not found'}
                </p>
            </CardContent>
        </Card>
    </div>
);
