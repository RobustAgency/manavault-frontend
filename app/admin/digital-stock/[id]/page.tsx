'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeftIcon,
    Building2Icon,
    CalendarIcon,
    PackageIcon,
    TagIcon,
    GlobeIcon,
    FileTextIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetDigitalProductQuery } from '@/lib/redux/features';
import { formatCurrency, getStatusColor } from '../components/digitalProductColumns';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

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
        return (
            <div className="container mx-auto py-8">
                <div className="mb-6">
                    <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid gap-6">
                    <div className="h-64 bg-gray-200 rounded animate-pulse" />
                    <div className="h-64 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto py-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            {error ? 'Failed to load digital product details' : 'Digital product not found'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Digital Stock
                </Button>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-muted-foreground mt-1">
                            SKU:{' '}
                            <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                                {product.sku}
                            </code>
                        </p>
                    </div>
                   
                </div>
            </div>

            <div className="grid gap-6">
                {/* Product Overview Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PackageIcon className="h-5 w-5" />
                            Product Overview
                        </CardTitle>
                        <CardDescription>Basic information about this digital product</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Product Name</p>
                                <p className="text-lg font-semibold">{product.name}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">SKU</p>
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-semibold">
                                        {product.sku}
                                    </code>
                                </div>
                                {product.brand && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Brand</p>
                                        <p className="text-lg font-semibold">{product.brand}</p>
                                    </div>
                                )}
                            </div>
                            {product.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                                    <p className="text-sm whitespace-pre-wrap">{product.description}</p>
                                </div>
                            )}
                            {product.image && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Product Image</p>
                                    <div className="relative w-full max-w-md">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="rounded-lg border object-cover w-full h-auto"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="border-t my-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Cost Price</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.cost_price)}</p>
                                </div>
                                
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tags and Regions Card */}
                {(product.tags && product.tags.length > 0) || (product.region) ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TagIcon className="h-5 w-5" />
                                Tags & Regions
                            </CardTitle>
                            <CardDescription>Product categorization and availability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                {product.tags && product.tags.length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                            <TagIcon className="h-4 w-4" />
                                            Tags
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag, idx) => (
                                                <Badge key={idx} variant="outlined">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {product.region && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                            <GlobeIcon className="h-4 w-4" />
                                            Available Regions
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outlined" color="info">
                                                {product.region}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Supplier Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2Icon className="h-5 w-5" />
                            Supplier Information
                        </CardTitle>
                        <CardDescription>Details about the supplier for this product</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {product.supplier ? (
                            <div className="grid gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Supplier Name</p>
                                    <p className="text-lg font-semibold">{product.supplier.name}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.supplier.type && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Type</p>
                                            <Badge variant="outlined" className="capitalize">
                                                {product.supplier.type}
                                            </Badge>
                                        </div>
                                    )}
                                    {product.supplier.status && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                                            <Badge variant="outlined">
                                                {product.supplier.status}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Supplier information not available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Metadata Card */}
                {product.metadata && Object.keys(product.metadata).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileTextIcon className="h-5 w-5" />
                                Metadata
                            </CardTitle>
                            <CardDescription>Additional product metadata</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(product.metadata, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timestamps Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Timestamps
                        </CardTitle>
                        <CardDescription>Creation and update information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Date Created</p>
                                <p className="font-medium flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {formatDate(product.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                                <p className="font-medium flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {formatDate(product.updated_at)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

