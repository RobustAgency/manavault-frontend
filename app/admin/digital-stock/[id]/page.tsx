'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useGetDigitalProductQuery } from '@/lib/redux/features';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import {
    MetadataCard,
    ProductOverviewCard,
    SupplierInformationCard,
    TagsRegionsCard,
    TimestampsCard,
} from '../components/DigitalProductDetailCards';
import { DigitalProductHeader } from '../components/DigitalProductHeader';



export default function DigitalProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const productId = parseInt(id, 10);

    const {
        data: product,
        isLoading,
        error,
    } = useGetDigitalProductQuery(productId, {
        skip: !productId || isNaN(productId),
    });

    if (isLoading) {
        return <LoadingState />;
    }

    if (error || !product) {
        return <ErrorState hasError={Boolean(error)} onBack={() => router.back()} />;
    }

    return (
        <div className="container mx-auto py-8">
            <DigitalProductHeader
                name={product.name}
                sku={product.sku}
                onBack={() => router.back()}
            />

            <div className="grid gap-6">
                <ProductOverviewCard product={product} />
                <TagsRegionsCard product={product} />
                <SupplierInformationCard product={product} />
                <MetadataCard product={product} />
                <TimestampsCard product={product} />
            </div>
        </div>
    );
}

