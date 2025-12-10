'use client';
import {Truck, ShoppingCartIcon, FileTextIcon } from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    useGetSuppliersQuery,
    useGetProductsQuery,
    useGetPurchaseOrdersQuery,
} from '@/lib/redux/features';
import { StatCard } from './components/stat-card';
import LowStackTable from './components/low-stock-table';
import { useGetLowStockProductQuery } from '@/lib/redux/features/digitalProductsApi';
import { SupplierPerformanceChart } from './components/supplier-performance-chart';
import { useGetSupplierKpiQuery } from '@/lib/redux/features/suppliersApi';

export default function AdminDashboard() {
    const router = useRouter();
    const { data: suppliersData } = useGetSuppliersQuery({ per_page: 1 });
    const { data: productsData } = useGetProductsQuery({ per_page: 1 });
    const { data: purchaseOrdersData } = useGetPurchaseOrdersQuery({ per_page: 1 });
    const { data: lowStockProductData, isLoading: stockLoading } = useGetLowStockProductQuery();
    const { data: supplerKpiData, isLoading: supplierLoading  } = useGetSupplierKpiQuery();


    const stats = [
        {
            title: 'Total Suppliers',
            value: suppliersData?.pagination.total || 0,
            icon: Truck,
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
                    return (
                        <Card
                            key={stat.title}
                            className="cursor-pointer hover:shadow-lg transition-shadow gap-0 p-0"
                            onClick={() => router.push(stat.href)}
                        >
                            <StatCard
                                title={stat.title}
                                value={stat.value}
                                description={stat.description}
                                icon={stat.icon}
                                bgColor={stat.bgColor}
                                color={stat.color}
                                delay={0}
                            />
                        </Card>
                    );
                })}
            </div>

            <div className="w-full grid gap-4 lg:grid-cols-2 grid-col-1 mb-8">
                {/* Low Stock Table */}
                <SupplierPerformanceChart isLoading= {supplierLoading} data={supplerKpiData?.slice(0,5) ?? []} />
                <LowStackTable isLoading = {stockLoading} data={lowStockProductData?.slice(0, 5) ?? []} />
            </div>
        </div>
    );
}
