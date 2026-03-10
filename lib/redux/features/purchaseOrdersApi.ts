import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import { createDigitalProductOrder, CreatePurchaseOrderData, CSVUploadData, MutationError, PaginationMeta, PurchaseOrder, PurchaseOrderFilters } from "@/types";

export const purchaseOrdersApi = createApi({
  reducerPath: "purchaseOrdersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PurchaseOrder"],
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<
      { data: PurchaseOrder[]; pagination: PaginationMeta },
      PurchaseOrderFilters | void
    >({
      query: (filters) => ({
        url: "/purchase-orders",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({
              type: "PurchaseOrder" as const,
              id: String(id),
            })),
            { type: "PurchaseOrder", id: "LIST" },
          ]
          : [{ type: "PurchaseOrder", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: any[]; // Raw API response - will be transformed
          current_page: number;
          per_page: number;
          total: number;
          last_page: number;
          from: number;
          to: number;
        };
        error?: boolean;
        message?: string;
      }) => {
        if (response.data?.data && Array.isArray(response.data.data)) {
          // Transform the data to map API fields to expected interface
          const transformedData = response.data.data.map((order: any) => {
            // API returns total_price as string, convert to number for total_amount
            const totalPrice = parseFloat(String(order.total_price || "0"));
            const quantity = order.quantity || 1;
            // Calculate unit price from total_price / quantity, or use product.purchase_price if available
            const unitPrice = order.product?.purchase_price
              ? parseFloat(String(order.product.purchase_price))
              : quantity > 0
                ? totalPrice / quantity
                : 0;

            return {
              ...order,
              total_amount: totalPrice,
              purchase_price: unitPrice,
            } as PurchaseOrder;
          });

          return {
            data: transformedData,
            pagination: {
              current_page: response.data.current_page,
              per_page: response.data.per_page,
              total: response.data.total,
              last_page: response.data.last_page,
              from: response.data.from,
              to: response.data.to,
            },
          };
        }
        return {
          data: [],
          pagination: {
            current_page: 1,
            per_page: 10,
            total: 0,
            last_page: 1,
            from: 0,
            to: 0,
          },
        };
      },
    }),

    getPurchaseOrder: builder.query<PurchaseOrder, number>({
      query: (id) => ({
        url: `/purchase-orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "PurchaseOrder", id: String(id) },
      ],
      transformResponse: (response: {
        data: any; // Raw API response - will be transformed
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          const order = response.data;
          // API returns total_price as string, convert to number for total_amount
          const totalPrice = parseFloat(String(order.total_price || "0"));

          // Calculate quantity and unit price from items if available
          let quantity = 0;
          let unitPrice = 0;
          const suppliers = Array.isArray(order.suppliers) ? order.suppliers : [];
          const supplierItems = suppliers.flatMap((supplierEntry: any) => {
            const supplierMeta = supplierEntry?.supplier;
            if (!Array.isArray(supplierEntry?.items)) {
              return [];
            }

            return supplierEntry.items.map((item: any) => {
              const digitalProduct =
                item?.digital_product ??
                {
                  id: item.digital_product_id,
                  name:
                    item.digital_product_name ||
                    `Product ${item.digital_product_id}`,
                  sku: item.digital_product_sku || "",
                  brand: item.digital_product_brand || null,
                  supplier: supplierMeta
                    ? {
                      id: supplierMeta.id,
                      name: supplierMeta.name,
                      type: supplierMeta.type,
                      contact_email: supplierMeta.contact_email,
                      contact_phone: supplierMeta.contact_phone,
                      status: supplierMeta.status,
                    }
                    : undefined,
                };

              return {
                ...item,
                currency: item.currency ?? order.currency,
                digital_product: digitalProduct,
              };
            });
          });
          const fallbackItems = Array.isArray(order.items)
            ? order.items.map((item: any) => ({
              ...item,
              currency: item.currency ?? order.currency,
            }))
            : [];
          const orderItems =
            supplierItems.length > 0
              ? supplierItems
              : fallbackItems;

          if (orderItems.length > 0) {
            // Calculate total quantity from all available items
            quantity = orderItems.reduce((sum: number, item: any) => {
              return sum + (item.quantity || 0);
            }, 0);

            // Calculate average unit price from items
            const totalCost = orderItems.reduce((sum: number, item: any) => {
              const subtotal = parseFloat(String(item.subtotal || "0"));
              if (!Number.isNaN(subtotal) && subtotal > 0) {
                return sum + subtotal;
              }
              const unitCost = parseFloat(String(item.unit_cost || "0"));
              return sum + unitCost * (item.quantity || 0);
            }, 0);
            unitPrice = quantity > 0 ? totalCost / quantity : 0;
          } else {
            // Fallback to old structure
            quantity = order.quantity || 1;
            unitPrice = order.product?.purchase_price
              ? parseFloat(String(order.product.purchase_price))
              : quantity > 0
                ? totalPrice / quantity
                : 0;
          }

          return {
            ...order,
            total_amount: totalPrice,
            purchase_price: unitPrice,
            quantity: quantity,
            items: orderItems,
            suppliers,
          } as PurchaseOrder;
        }
        return response as unknown as PurchaseOrder;
      },
    }),

    createPurchaseOrder: builder.mutation<
      PurchaseOrder,
      CreatePurchaseOrderData
    >({
      query: (data) => {
        const currency =
          data.currency ?? data.items?.[0]?.currency ?? undefined;
        const items = (data.items ?? []).map(({ currency: itemCurrency, ...rest }) => rest);

        return {
        url: "/purchase-orders",
        method: "POST",
          data: {
            ...data,
            currency,
            items,
          },
        };
      },
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create purchase order";
            console.error(errorMessage);
          }
        }
      },
    }),

    createDigitalProductOrder: builder.mutation<
      PurchaseOrder,
      createDigitalProductOrder
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}/digital-products/priority`,
        method: "POST",
        data: {
          digital_products: data,
        },
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create purchase order";
            console.error(errorMessage);
          }
        }
      },
    }),

    createCSVUpload: builder.mutation<
      CSVUploadData, FormData
    >({
      query: (data) => ({
        url: "/digital-products/batch-import",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to upload CSV file";
            console.error(errorMessage);
          }
        }
      },
    }),

   UpdatePurchaseOrder: builder.mutation<
    { message: string, error: boolean }, number
  >({
    query: (id: number) => ({
      url: `/purchase-orders/${id}/vouchers`,
      method: "POST",
      data: {
        message: "Purchase order updated successfully",
        error: false,
      },
    }),
    invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    async onQueryStarted(_, { queryFulfilled }) {
      try {
        await queryFulfilled;
      } catch (error) {
        const mutationError = error as MutationError;
        if (!mutationError?.error?.data?.errors) {
          const errorMessage =
            mutationError?.error?.data?.message ||
            "Failed to update purchase order";
          console.error(errorMessage);
        }
      }
    },
  }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useCreateCSVUploadMutation,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useCreateDigitalProductOrderMutation,
  useUpdatePurchaseOrderMutation
} = purchaseOrdersApi;
