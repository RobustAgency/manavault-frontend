# Redux RTK Query API Usage Examples

This document provides comprehensive examples of how to use the Redux RTK Query APIs implemented for Manavault.

## Table of Contents
- [Suppliers API](#suppliers-api)
- [Products API](#products-api)
- [Purchase Orders API](#purchase-orders-api)
- [Vouchers API](#vouchers-api)

---

## Suppliers API

### 1. List Suppliers

```typescript
import { useGetSuppliersQuery } from '@/lib/redux/features';

function SuppliersPage() {
  const { data, isLoading, error } = useGetSuppliersQuery({ per_page: 10, page: 1 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading suppliers</div>;

  return (
    <div>
      {data?.data.map((supplier) => (
        <div key={supplier.id}>
          <h3>{supplier.name}</h3>
          <p>Type: {supplier.type}</p>
          <p>Status: {supplier.status}</p>
        </div>
      ))}
      
      {/* Pagination info */}
      <div>
        Page {data?.pagination.current_page} of {data?.pagination.last_page}
      </div>
    </div>
  );
}
```

### 2. Get Single Supplier

```typescript
import { useGetSupplierQuery } from '@/lib/redux/features';

function SupplierDetails({ supplierId }: { supplierId: number }) {
  const { data: supplier, isLoading } = useGetSupplierQuery(supplierId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{supplier?.name}</h2>
      <p>Slug: {supplier?.slug}</p>
      <p>Email: {supplier?.contact_email}</p>
      <p>Phone: {supplier?.contact_phone}</p>
    </div>
  );
}
```

### 3. Create Supplier

```typescript
import { useCreateSupplierMutation } from '@/lib/redux/features';

function CreateSupplierForm() {
  const [createSupplier, { isLoading }] = useCreateSupplierMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await createSupplier({
        name: "Supplier Name",
        slug: "supplier_name",
        type: "internal",
        contact_email: "supplier@example.com",
        contact_phone: "+1234567890",
        status: "active"
      }).unwrap();
      
      // Success toast is automatically shown
      // Handle success (e.g., redirect, close modal)
    } catch (error) {
      // Error toast is automatically shown
      // Handle error if needed
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Supplier'}
      </button>
    </form>
  );
}
```

### 4. Update Supplier

```typescript
import { useUpdateSupplierMutation } from '@/lib/redux/features';

function EditSupplierForm({ supplierId }: { supplierId: number }) {
  const [updateSupplier, { isLoading }] = useUpdateSupplierMutation();

  const handleUpdate = async () => {
    try {
      await updateSupplier({
        id: supplierId,
        data: {
          name: "Updated Name",
          status: "inactive"
        }
      }).unwrap();
      
      // Success!
    } catch (error) {
      // Handle error
    }
  };

  return (
    <button onClick={handleUpdate} disabled={isLoading}>
      Update Supplier
    </button>
  );
}
```

### 5. Delete Supplier

```typescript
import { useDeleteSupplierMutation } from '@/lib/redux/features';

function DeleteSupplierButton({ supplierId }: { supplierId: number }) {
  const [deleteSupplier, { isLoading }] = useDeleteSupplierMutation();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(supplierId).unwrap();
        // Success toast shown automatically
      } catch (error) {
        // Error toast shown automatically
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

---

## Products API

### 1. List Products with Filters

```typescript
import { useGetProductsQuery } from '@/lib/redux/features';

function ProductsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    status: 'active' as const,
    name: ''
  });

  const { data, isLoading } = useGetProductsQuery(filters);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name"
        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
      />
      
      <select
        onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
      >
        <option value="active">Active</option>
        <option value="in_active">Inactive</option>
        <option value="archived">Archived</option>
      </select>

      {data?.data.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>SKU: {product.sku}</p>
          <p>Price: ${product.selling_price}</p>
          <p>Supplier: {product.supplier?.name}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Get Third-Party Products

```typescript
import { useGetThirdPartyProductsQuery } from '@/lib/redux/features';

function ThirdPartyProducts() {
  const { data: products, isLoading } = useGetThirdPartyProductsQuery({
    slug: 'ez_cards',
    limit: 15,
    offset: 0
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Create Product

```typescript
import { useCreateProductMutation } from '@/lib/redux/features';

function CreateProductForm() {
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (data: {
    supplier_id: number;
    name: string;
    sku: string;
    purchase_price: number;
    selling_price: number;
  }) => {
    try {
      await createProduct({
        ...data,
        status: 'active',
        description: 'Product description'
      }).unwrap();
    } catch (error) {
      // Error handled
    }
  };

  return <form>{/* Form implementation */}</form>;
}
```

### 4. Update & Delete Product

Similar patterns to suppliers - see suppliers section above.

---

## Purchase Orders API

### 1. List Purchase Orders

```typescript
import { useGetPurchaseOrdersQuery } from '@/lib/redux/features';

function PurchaseOrdersPage() {
  const { data, isLoading } = useGetPurchaseOrdersQuery({ per_page: 10 });

  return (
    <div>
      {data?.data.map((order) => (
        <div key={order.id}>
          <h3>Order #{order.order_number}</h3>
          <p>Product: {order.product?.name}</p>
          <p>Supplier: {order.supplier?.name}</p>
          <p>Quantity: {order.quantity}</p>
          <p>Total: ${order.total_amount}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Get Purchase Order Details

```typescript
import { useGetPurchaseOrderQuery } from '@/lib/redux/features';

function PurchaseOrderDetails({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useGetPurchaseOrderQuery(orderId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Purchase Order #{order?.order_number}</h2>
      <p>Product: {order?.product?.name} (SKU: {order?.product?.sku})</p>
      <p>Supplier: {order?.supplier?.name}</p>
      <p>Purchase Price: ${order?.purchase_price}</p>
      <p>Quantity: {order?.quantity}</p>
      <p>Total Amount: ${order?.total_amount}</p>
      <p>Created: {new Date(order?.created_at || '').toLocaleDateString()}</p>
    </div>
  );
}
```

### 3. Create Purchase Order

```typescript
import { useCreatePurchaseOrderMutation } from '@/lib/redux/features';

function CreatePurchaseOrderForm() {
  const [createPurchaseOrder, { isLoading }] = useCreatePurchaseOrderMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPurchaseOrder({
        product_id: 1,
        supplier_id: 1,
        purchase_price: 22.88,
        quantity: 100
      }).unwrap();
      
      // Success - order number is auto-generated
    } catch (error) {
      // Error handled
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        Create Order
      </button>
    </form>
  );
}
```

---

## Vouchers API

### Import Vouchers from File

```typescript
import { useImportVouchersMutation } from '@/lib/redux/features';

function ImportVouchersForm() {
  const [importVouchers, { isLoading }] = useImportVouchersMutation();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      const result = await importVouchers({
        file,
        purchase_order_id: 1
      }).unwrap();

      console.log('Import result:', result);
      // result.imported_count - number of successfully imported vouchers
      // result.failed_count - number of failed imports
      // result.errors - array of error messages
      
    } catch (error) {
      // Error handled automatically
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.zip"
        onChange={handleFileChange}
      />
      
      <button type="submit" disabled={isLoading || !file}>
        {isLoading ? 'Importing...' : 'Import Vouchers'}
      </button>
    </form>
  );
}
```

---

## Advanced Usage

### 1. Conditional Fetching

Skip queries until certain conditions are met:

```typescript
function ProductDetails({ productId }: { productId?: number }) {
  const { data, isLoading } = useGetProductQuery(productId!, {
    skip: !productId, // Don't fetch until we have an ID
  });

  return <div>{/* ... */}</div>;
}
```

### 2. Polling for Real-time Updates

```typescript
function LivePurchaseOrders() {
  const { data } = useGetPurchaseOrdersQuery(undefined, {
    pollingInterval: 30000, // Refetch every 30 seconds
  });

  return <div>{/* ... */}</div>;
}
```

### 3. Manual Refetch

```typescript
function ProductsWithRefresh() {
  const { data, refetch, isLoading } = useGetProductsQuery();

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {/* ... */}
    </div>
  );
}
```

### 4. Accessing Loading & Error States

```typescript
function DetailedLoadingExample() {
  const {
    data,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetSuppliersQuery();

  if (isLoading) return <div>Initial load...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (isFetching) return <div>Updating...</div>;

  return <div>{/* Success state */}</div>;
}
```

### 5. Optimistic Updates

```typescript
function OptimisticSupplierUpdate({ supplierId }: { supplierId: number }) {
  const [updateSupplier] = useUpdateSupplierMutation();

  const handleUpdate = async (newStatus: 'active' | 'inactive') => {
    try {
      // Optimistic update - UI updates immediately before API responds
      await updateSupplier({
        id: supplierId,
        data: { status: newStatus }
      }).unwrap();
    } catch (error) {
      // If it fails, RTK Query will automatically roll back
    }
  };

  return <div>{/* ... */}</div>;
}
```

---

## Error Handling

All mutations automatically show toast notifications for success and error states. However, you can handle errors manually if needed:

```typescript
try {
  await createSupplier(data).unwrap();
} catch (error) {
  if ('status' in error) {
    // Handle specific status codes
    if (error.status === 422) {
      // Validation errors
      const validationErrors = error.data?.errors;
      // Display field-specific errors
    }
  }
}
```

---

## TypeScript Support

All hooks are fully typed. Import types as needed:

```typescript
import {
  type Supplier,
  type CreateSupplierData,
  type Product,
  type PurchaseOrder,
} from '@/lib/redux/features';

const supplier: Supplier = {
  id: 1,
  name: 'Test Supplier',
  slug: 'test_supplier',
  type: 'internal',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

