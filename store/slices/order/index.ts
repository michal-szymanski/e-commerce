import { CartItem, ProductWithMedia } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OrderState = {
    cart: CartItem[];
};

const initialState: OrderState = {
    cart: []
};

export const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<ProductWithMedia>) => {
            const existingCartItem = state.cart.find((c) => c.product.id === action.payload.id);

            if (existingCartItem) {
                existingCartItem.quantity += 1;
            } else {
                state.cart.push({
                    product: action.payload,
                    quantity: 1
                });
            }
        },
        removeFromCart: (state, action: PayloadAction<{ productId: number }>) => {
            const existingCartItem = state.cart.find((c) => c.product.id === action.payload.productId);

            if (!existingCartItem) return;

            state.cart = state.cart.filter((c) => c.product.id !== existingCartItem.product.id);
        },
        updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
            const existingCartItem = state.cart.find((c) => c.product.id === action.payload.productId);

            if (!existingCartItem) return;

            existingCartItem.quantity = action.payload.quantity;
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity } = orderSlice.actions;

export default orderSlice.reducer;
