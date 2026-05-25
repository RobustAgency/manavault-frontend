import { Button } from '@/components/ui/button';

type CreateDigitalProductFormActionsProps = {
    isLoading: boolean;
    productCount: number;
    onCancel: () => void;
};

export const CreateDigitalProductFormActions = ({
    isLoading,
    productCount,
    onCancel,
}: CreateDigitalProductFormActionsProps) => (
    <div className="flex items-center justify-between pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
        </Button>
        <Button type="submit" disabled={isLoading} size="lg" className="min-w-[150px]">
            {isLoading ? 'Creating...' : `Create Digital Product${productCount > 1 ? 's' : ''}`}
        </Button>
    </div>
);
