import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface LowStockProductTypes {
  id: number;
  supplier_id: number;
  name: string;
  brand: string | null;
  description: string | null;
  cost_price: string;
  metadata: any | null;
  created_at: string;
  updated_at: string;
  sku: string;
  last_synced_at: string | null;
  source: string | null;
  supplier_name: string;
  supplier_type: string;
  quantity: string;

}

interface LowStockProductProps {
  data: LowStockProductTypes[];
  isLoading?: boolean;
  length?: number;
  map?: any;


}
const LowStockProductTable: React.FC<LowStockProductProps> = ({ data, isLoading }) => {
  const router = useRouter();
  const columns = [
    { id: "0", label: "Product" },
    { id: "1", label: "SKU" },
    { id: "2", label: "Quantity" },
    { id: "3", label: "Supplier" },
  ];
  return (
      <div className="rounded-xl  w-[full] overflow-hidden shadow-sm bg-card border text-card-foreground animate-slide-up" style={{ animationDelay: "200ms" }}>
        {/* Table Heading */}
        <div className="flex items-center gap-3 border-b border-border p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Low Stock Alerts</h3>
            <p className="text-sm text-muted-foreground">Products requiring attention</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead key={column.id} className="py-3 px-4">{column.label}</TableHead>
                )
                )}

              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24">
                    <div className="flex items-center justify-center w-full">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary mr-2" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No low stock items
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {data.map((item) => (
                        <TableRow key={item.id} className="group">
                          <TableCell className="font-medium text-foreground p-3">{item.name}</TableCell>
                          <TableCell className="p-3"><span className="bg-gray-100 px-2 py-1 rounded">{item.sku}</span></TableCell>
                          <TableCell className="text-center p-3">{item.quantity}</TableCell>
                          <TableCell className="p-3">{item.supplier_name}</TableCell>
                        </TableRow>
                      ))}

                      {/* Separate full-width row with button */}
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={4} className="text-end p-4">
                          <Button
                            className="bg-primary text-white hover: px-4 py-2 cursor-pointer rounded"
                            onClick={() => router.push('/admin/digital-stock?stock=low') }
                          >
                            View All
                          </Button>
                        </TableCell>
                      </TableRow>

                    </>


                  )}

                </>
              )}
            </TableBody>

          </Table>
        </div>
      </div>
  );
};

export default LowStockProductTable;