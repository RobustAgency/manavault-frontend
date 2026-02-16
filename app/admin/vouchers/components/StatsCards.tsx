'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StatsCardsProps {
  totalOrders: number;
}

export const StatsCards = ({ totalOrders }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Supported Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-muted-foreground mt-1">CSV, XLSX, XLS, ZIP</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Max File Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">10 MB</div>
        </CardContent>
      </Card>
    </div>
  );
};

