# Manavault Redux RTK Query Implementation

This directory contains Redux RTK Query API slices for managing backend API calls in the Manavault application.

## 📁 File Structure

```
lib/redux/features/
├── suppliersApi.ts          # Suppliers CRUD operations
├── productsApi.ts           # Products CRUD + third-party products
├── purchaseOrdersApi.ts     # Purchase Orders management
├── vouchersApi.ts           # Voucher import functionality
├── index.ts                 # Centralized exports
├── README.md                # This file
└── USAGE_EXAMPLES.md        # Detailed usage examples
```

## 🎯 Implemented APIs

### 1. **Suppliers API** (`suppliersApi.ts`)

**Endpoints:**
- ✅ `GET /admin/suppliers` - List all suppliers (paginated)
- ✅ `GET /admin/suppliers/:id` - Get single supplier details
- ✅ `POST /admin/suppliers` - Create new supplier
- ✅ `POST /admin/suppliers/:id` - Update supplier
- ✅ `DELETE /admin/suppliers/:id` - Delete supplier

**Hooks:**
```typescript
useGetSuppliersQuery({ page, per_page })
useGetSupplierQuery(supplierId)
useCreateSupplierMutation()
useUpdateSupplierMutation()
useDeleteSupplierMutation()
```

**Types:**
- `Supplier`
- `SupplierType`: "internal" | "external"
- `SupplierStatus`: "active" | "inactive"
- `CreateSupplierData`, `UpdateSupplierData`

---

### 2. **Products API** (`productsApi.ts`)

**Endpoints:**
- ✅ `GET /admin/products` - List products (paginated, filterable)
- ✅ `GET /admin/products/third-party` - Fetch third-party supplier products
- ✅ `GET /admin/products/:id` - Get single product details
- ✅ `POST /admin/products` - Create new product
- ✅ `POST /admin/products/:id` - Update product
- ✅ `DELETE /admin/products/:id` - Delete product

**Hooks:**
```typescript
useGetProductsQuery({ page, per_page, name, status })
useGetThirdPartyProductsQuery({ slug, limit, offset })
useGetProductQuery(productId)
useCreateProductMutation()
useUpdateProductMutation()
useDeleteProductMutation()
```

**Types:**
- `Product`
- `ProductStatus`: "in_active" | "active" | "archived"
- `ThirdPartyProduct`
- `CreateProductData`, `UpdateProductData`

---

### 3. **Purchase Orders API** (`purchaseOrdersApi.ts`)

**Endpoints:**
- ✅ `GET /admin/purchase-orders` - List purchase orders (paginated)
- ✅ `GET /admin/purchase-orders/:id` - Get purchase order details
- ✅ `POST /admin/purchase-orders` - Create purchase order

**Hooks:**
```typescript
useGetPurchaseOrdersQuery({ page, per_page })
useGetPurchaseOrderQuery(orderId)
useCreatePurchaseOrderMutation()
```

**Types:**
- `PurchaseOrder`
- `CreatePurchaseOrderData`

---

### 4. **Vouchers API** (`vouchersApi.ts`)

**Endpoints:**
- ✅ `POST /admin/vouchers/import` - Import vouchers from file

**Hooks:**
```typescript
useImportVouchersMutation()
```

**Types:**
- `ImportVouchersData`
- `ImportVouchersResponse`

**Special Notes:**
- Supports CSV, Excel (.xlsx, .xls), and ZIP files
- Maximum file size: 10MB
- Uses `multipart/form-data` for file upload

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { useGetSuppliersQuery } from '@/lib/redux/features';

function MyComponent() {
  const { data, isLoading, error } = useGetSuppliersQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  
  return (
    <div>
      {data?.data.map(supplier => (
        <div key={supplier.id}>{supplier.name}</div>
      ))}
    </div>
  );
}
```

### Creating Resources

```typescript
import { useCreateSupplierMutation } from '@/lib/redux/features';

function CreateSupplierForm() {
  const [createSupplier, { isLoading }] = useCreateSupplierMutation();
  
  const handleSubmit = async (data) => {
    try {
      await createSupplier(data).unwrap();
      // ✅ Success toast shown automatically
    } catch (error) {
      // ❌ Error toast shown automatically
    }
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## 🔧 Features

### 1. **Automatic Caching**
RTK Query automatically caches API responses and manages cache invalidation:

```typescript
// First call - fetches from API
const { data } = useGetSuppliersQuery();

// Second call with same params - uses cache
const { data } = useGetSuppliersQuery();
```

### 2. **Automatic Refetching**
Cache is automatically invalidated and refetched when:
- Creating a new resource → Invalidates LIST
- Updating a resource → Invalidates specific resource + LIST
- Deleting a resource → Invalidates specific resource + LIST

### 3. **Toast Notifications**
All mutations automatically show toast notifications:
- ✅ Success messages on successful operations
- ❌ Error messages on failures
- ⚠️ Validation errors (when applicable)

### 4. **TypeScript Support**
Fully typed API with:
- Request types
- Response types
- Error types
- Status enums

### 5. **Pagination Support**
All list endpoints return pagination metadata:
```typescript
{
  data: [...],
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

### 6. **Error Handling**
Comprehensive error handling with:
- HTTP status codes
- Error messages
- Validation errors (field-specific)

---

## 📝 API Response Structure

All APIs follow a consistent response structure:

### Success Response
```json
{
  "data": { /* resource or array */ },
  "error": false,
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": true,
  "message": "Error message",
  "errors": {
    "field_name": ["Validation error 1", "Validation error 2"]
  }
}
```

---

## 🔐 Authentication

All API calls automatically include the authentication token via the `apiClient` interceptor. No manual token handling required.

---

## 📚 Documentation

- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Comprehensive examples for all endpoints
- **[Postman Collection](../../../Manavault_API_Collection.postman_collection.json)** - API collection for testing

---

## 🎨 Best Practices

1. **Use Skip for Conditional Fetching**
   ```typescript
   useGetProductQuery(id, { skip: !id })
   ```

2. **Handle Loading States**
   ```typescript
   const { data, isLoading, isFetching } = useGetSuppliersQuery();
   ```

3. **Use unwrap() for Error Handling**
   ```typescript
   try {
     const result = await createSupplier(data).unwrap();
   } catch (error) {
     // Handle error
   }
   ```

4. **Leverage Automatic Refetching**
   ```typescript
   const { refetch } = useGetSuppliersQuery();
   // Call refetch() when needed
   ```

---

## 🐛 Troubleshooting

### Issue: "API not working in production"
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify authentication token is being sent

### Issue: "Cache not updating after mutation"
- Check that invalidatesTags is properly configured
- Verify tag IDs match between queries and mutations

### Issue: "TypeScript errors"
- Ensure all types are imported from `@/lib/redux/features`
- Check that data structures match API responses

---

## 🔄 Updates & Maintenance

When the API changes:
1. Update types in respective `*Api.ts` files
2. Update transformResponse functions if response structure changes
3. Update documentation in USAGE_EXAMPLES.md
4. Update Postman collection

---

## 📦 Dependencies

- `@reduxjs/toolkit` - RTK Query core
- `react-redux` - React bindings
- `axios` - HTTP client
- `react-toastify` - Toast notifications

---

## 👥 Contributing

When adding new endpoints:
1. Create new API slice or extend existing one
2. Add types and interfaces
3. Implement query/mutation endpoints
4. Add hooks exports
5. Update store.ts to include new API reducer and middleware
6. Add usage examples to USAGE_EXAMPLES.md
7. Update this README

---

## 📄 License

Part of the Manavault project.

---

## 🆘 Support

For questions or issues, please contact the development team or refer to the main project documentation.

