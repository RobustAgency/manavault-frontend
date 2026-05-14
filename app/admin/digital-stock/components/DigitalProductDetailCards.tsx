import {
    Building2Icon,
    CalendarIcon,
    FileTextIcon,
    GlobeIcon,
    PackageIcon,
    TagIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatCurrency';

type SupplierInfo = {
    name: string;
    type?: string | null;
    status?: string | null;
};

type DigitalProductDetail = {
    name: string;
    sku: string;
    brand?: string | null;
    description?: string | null;
    image_url?: string | null;
    cost_price: number | string;
    selling_price?: number | string | null;
    currency?: string | null;
    tags?: string[] | string | null;
    region?: string | null;
    supplier?: SupplierInfo | null;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
};

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const ProductOverviewCard = ({ product }: { product: DigitalProductDetail }) => (
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
                {product.image_url && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Product Image</p>
                        <div className="relative w-full max-w-md">
                            <img
                                src={product.image_url}
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
                        <p className="text-2xl font-bold text-primary">
                            {formatCurrency(Number(product.cost_price), product.currency ?? 'USD')}
                        </p>
                    </div>
                    {product.selling_price && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Selling Price</p>
                            <p className="text-2xl font-bold text-primary">
                                {formatCurrency(Number(product.selling_price), product.currency ?? 'USD')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
);

export const TagsRegionsCard = ({ product }: { product: DigitalProductDetail }) => {
    const tags = Array.isArray(product.tags) ? product.tags : product.tags ? [product.tags] : [];

    if (tags.length === 0 && !product.region) {
        return null;
    }

    return (
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
                    {tags.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                <TagIcon className="h-4 w-4" />
                                Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, idx) => (
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
    );
};

export const SupplierInformationCard = ({ product }: { product: DigitalProductDetail }) => (
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
                                    {product.supplier.type === 'internal' ? 'API Supplier' : 'Supplier'}
                                </Badge>
                            </div>
                        )}
                        {product.supplier.status && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Status</p>
                                <Badge variant="outlined">{product.supplier.status}</Badge>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-muted-foreground">Supplier information not available</p>
            )}
        </CardContent>
    </Card>
);

export const MetadataCard = ({ product }: { product: DigitalProductDetail }) => {
    if (!product.metadata || Object.keys(product.metadata).length === 0) {
        return null;
    }

    return (
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
    );
};

export const TimestampsCard = ({ product }: { product: DigitalProductDetail }) => (
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
);
