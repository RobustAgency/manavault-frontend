import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DigitalProduct } from '@/types';
import { RootState } from '../store';

interface SelectedDigitalProductsState {
  products: DigitalProduct[];
}

const initialState: SelectedDigitalProductsState = {
  products: [],
};

const selectedDigitalProductsSlice = createSlice({
  name: 'selectedDigitalProducts',
  initialState,
  reducers: {
    setSelectedProducts(state, action: PayloadAction<DigitalProduct[]>) {
      state.products = action.payload;
    },
    clearSelectedProducts(state) {
      state.products = [];
    },
    removeSelectedProduct(state, action: PayloadAction<number>) {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    updateSelectedProduct(
      state,
      action: PayloadAction<{ id: number; selling_price: number }>
    ) {
      const { id, selling_price } = action.payload;
      const product = state.products.find((p) => p.id === id);
      if (product) {
        product.selling_price = selling_price;
      }
    },
  },
});

export const {
  setSelectedProducts,
  clearSelectedProducts,
  removeSelectedProduct,
  updateSelectedProduct,
} = selectedDigitalProductsSlice.actions;

export const selectSelectedProducts = (state: RootState) =>
  state.selectedDigitalProducts.products;

export const selectSelectedProductIds = (state: RootState) =>
  state.selectedDigitalProducts.products.map((p) => p.id);

export default selectedDigitalProductsSlice.reducer;
