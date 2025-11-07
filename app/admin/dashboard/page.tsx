'use client';

import { PackageIcon, ShoppingCartIcon, FileTextIcon, UploadIcon } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    useGetSuppliersQuery,
    useGetProductsQuery,
    useGetPurchaseOrdersQuery,
} from '@/lib/redux/features';

export default function AdminDashboard() {
    const router = useRouter();

    const { data: suppliersData } = useGetSuppliersQuery({ per_page: 1 });
    const { data: productsData } = useGetProductsQuery({ per_page: 1 });
    const { data: purchaseOrdersData } = useGetPurchaseOrdersQuery({ per_page: 1 });

    const stats = [
        {
            title: 'Total Suppliers',
            value: suppliersData?.pagination.total || 0,
            icon: PackageIcon,
            description: 'Active suppliers in system',
            href: '/admin/suppliers',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total Products',
            value: productsData?.pagination.total || 0,
            icon: ShoppingCartIcon,
            description: 'Products in inventory',
            href: '/admin/products',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Purchase Orders',
            value: purchaseOrdersData?.pagination.total || 0,
            icon: FileTextIcon,
            description: 'Total purchase orders',
            href: '/admin/purchase-orders',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    const recentActivity = [
        {
            title: 'Quick Access',
            items: [
                { label: 'Manage Suppliers', href: '/admin/suppliers' },
                { label: 'Manage Products', href: '/admin/products' },
                { label: 'Purchase Orders', href: '/admin/purchase-orders' },
                { label: 'Import Vouchers', href: '/admin/vouchers' },
            ],
        },
    ];

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Manage suppliers, products, orders, and vouchers
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => router.push(stat.href)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Links */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {recentActivity[0].items.map((item) => (
                                <Button
                                    key={item.label}
                                    variant="outline"
                                    className="h-auto py-4"
                                    onClick={() => router.push(item.href)}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                        <CardDescription>Current system health</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">API Connection</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                                    <span className="text-sm font-medium text-green-600">Active</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Database</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                                    <span className="text-sm font-medium text-green-600">Connected</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Cache</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                                    <span className="text-sm font-medium text-green-600">Operational</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Tips</CardTitle>
                        <CardDescription>Get the most out of the admin panel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>Use filters and search to find items quickly</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>All changes are saved automatically with notifications</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>Import vouchers in CSV, Excel, or ZIP format</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>View third-party products from external suppliers</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
