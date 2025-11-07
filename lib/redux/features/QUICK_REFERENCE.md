# Redux RTK Query - Quick Reference Card

## 🚀 Import Statement

```typescript
import {
  // Suppliers
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  
  // Products
  useGetProductsQuery,
  useGetThirdPartyProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  
  // Purchase Orders
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  
  // Vouchers
  useImportVouchersMutation,
  
  // Types (as needed)
  type Supplier,
  type Product,
  type PurchaseOrder,
} from '@/lib/redux/features';
```

---

## 📖 Query Hooks (GET requests)

### Pattern
```typescript
const { data, isLoading, error, refetch } = useGetXxxQuery(params);
```

### Suppliers
```typescript
// List all
useGetSuppliersQuery({ per_page: 10, page: 1 })

// Get single
useGetSupplierQuery(supplierId)
```

### Products
```typescript
// List all
useGetProductsQuery({ per_page: 10, page: 1, status: 'active', name: 'search' })

// Third-party products
useGetThirdPartyProductsQuery({ slug: 'ez_cards', limit: 15, offset: 0 })

// Get single
useGetProductQuery(productId)
```

### Purchase Orders
```typescript
// List all
useGetPurchaseOrdersQuery({ per_page: 10, page: 1 })

// Get single
useGetPurchaseOrderQuery(orderId)
```

---

## ✏️ Mutation Hooks (POST/PUT/DELETE)

### Pattern
```typescript
const [mutate, { isLoading, error }] = useXxxMutation();

// Call it
await mutate(data).unwrap();
```

### Suppliers
```typescript
// Create
const [create] = useCreateSupplierMutation();
await create({ name, slug, type, status }).unwrap();

// Update
const [update] = useUpdateSupplierMutation();
await update({ id, data: { name, status } }).unwrap();

// Delete
const [del] = useDeleteSupplierMutation();
await del(supplierId).unwrap();
```

### Products
```typescript
// Create
const [create] = useCreateProductMutation();
await create({ 
  supplier_id, name, sku, 
  purchase_price, selling_price, status 
}).unwrap();

// Update
const [update] = useUpdateProductMutation();
await update({ id, data: { name, status } }).unwrap();

// Delete
const [del] = useDeleteProductMutation();
await del(productId).unwrap();
```

### Purchase Orders
```typescript
// Create
const [create] = useCreatePurchaseOrderMutation();
await create({ 
  product_id, supplier_id, 
  purchase_price, quantity 
}).unwrap();
```

### Vouchers
```typescript
// Import
const [importVouchers] = useImportVouchersMutation();
await importVouchers({ 
  file: fileObject, 
  purchase_order_id: 1 
}).unwrap();
```

---

## 🎯 Complete Component Example

```typescript
'use client';
import { useGetSuppliersQuery, useDeleteSupplierMutation } from '@/lib/redux/features';

export default function SuppliersPage() {
  const { data, isLoading } = useGetSuppliersQuery({ per_page: 10 });
  const [deleteSupplier] = useDeleteSupplierMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteSupplier(id).unwrap();
      // Success toast shown automatically
    } catch (error) {
      // Error toast shown automatically
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.data.map((supplier) => (
        <div key={supplier.id}>
          <h3>{supplier.name}</h3>
          <button onClick={() => handleDelete(supplier.id)}>Delete</button>
        </div>
      ))}
      <div>Page {data?.pagination.current_page} of {data?.pagination.last_page}</div>
    </div>
  );
}
```

---

## 📊 Response Structure

### List Queries
```typescript
{
  data: [...],           // Array of items
  pagination: {
    current_page: 1,
    per_page: 10,
    total: 100,
    last_page: 10,
    from: 1,
    to: 10
  }
}
```

### Single Item Queries
```typescript
{
  id: 1,
  name: "...",
  // ... other fields
}
```

---

## 🎛️ Hook Options

```typescript
// Skip query until condition is met
useGetProductQuery(id, { skip: !id })

// Polling (refetch every N milliseconds)
useGetSuppliersQuery(undefined, { pollingInterval: 30000 })

// Manual refetch
const { refetch } = useGetSuppliersQuery();
refetch();
```

---

## 🔍 Loading & Error States

```typescript
const {
  data,           // Response data
  isLoading,      // Initial load
  isFetching,     // Background refetch
  isSuccess,      // Success state
  isError,        // Error state
  error,          // Error object
  refetch,        // Manual refetch function
} = useGetSuppliersQuery();
```

---

## 🎨 Status Types

### Supplier Status
```typescript
type SupplierStatus = "active" | "inactive"
```

### Supplier Type
```typescript
type SupplierType = "internal" | "external"
```

### Product Status
```typescript
type ProductStatus = "in_active" | "active" | "archived"
```

---

## ⚠️ Error Handling

```typescript
try {
  const result = await createSupplier(data).unwrap();
  // Success - toast shown automatically
} catch (error) {
  // Error - toast shown automatically
  
  // Manual error handling (optional)
  if ('status' in error) {
    if (error.status === 422) {
      // Validation errors
      console.log(error.data?.errors);
    }
  }
}
```

---

## 📦 File Upload (Vouchers)

```typescript
const [importVouchers, { isLoading }] = useImportVouchersMutation();
const [file, setFile] = useState<File | null>(null);

const handleImport = async () => {
  if (!file) return;
  
  try {
    const result = await importVouchers({
      file,
      purchase_order_id: 1
    }).unwrap();
    
    console.log(`Imported: ${result.imported_count}`);
    console.log(`Failed: ${result.failed_count}`);
  } catch (error) {
    // Error handled
  }
};

// In JSX:
<input 
  type="file" 
  accept=".csv,.xlsx,.xls,.zip"
  onChange={(e) => setFile(e.target.files?.[0] || null)} 
/>
```

---

## 🔗 API Base URL

Make sure `NEXT_PUBLIC_API_URL` is set in `.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## ✅ Toast Notifications

All mutations show toast automatically:
- ✅ Success messages
- ❌ Error messages
- No manual toast.success() or toast.error() needed!

---

## 🎯 Common Patterns

### List with Pagination
```typescript
const [page, setPage] = useState(1);
const { data } = useGetSuppliersQuery({ per_page: 10, page });

<button onClick={() => setPage(p => p + 1)}>Next</button>
```

### Search/Filter
```typescript
const [search, setSearch] = useState('');
const { data } = useGetProductsQuery({ name: search });

<input onChange={(e) => setSearch(e.target.value)} />
```

### Conditional Loading
```typescript
const shouldFetch = someCondition;
const { data } = useGetProductQuery(id, { skip: !shouldFetch });
```

### Form Submission
```typescript
const [create, { isLoading }] = useCreateSupplierMutation();

const handleSubmit = async (formData) => {
  try {
    await create(formData).unwrap();
    router.push('/suppliers');
  } catch (error) {
    // Handle error
  }
};
```

---

## 📚 Full Documentation

- **README.md** - Overview and features
- **USAGE_EXAMPLES.md** - Comprehensive examples
- **IMPLEMENTATION_CHECKLIST.md** - Testing checklist

---

## 💡 Pro Tips

1. **Always use `.unwrap()`** when you need to handle success/error manually
2. **Use `skip` option** to prevent unnecessary API calls
3. **Destructure only what you need** from hook results
4. **Let RTK Query handle caching** - don't store in local state
5. **Toast notifications are automatic** - no need to add them manually

---

**Version:** 1.0.0  
**Last Updated:** November 7, 2025  
**Status:** Production Ready ✅

