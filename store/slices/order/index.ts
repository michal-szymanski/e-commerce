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
        addToCart: (state, action: PayloadAction<{ product: ProductWithMedia; quantity: number }>) => {
            const existingCartItem = state.cart.find((c) => c.product.id === action.payload.product.id);

            if (existingCartItem) {
                existingCartItem.quantity += action.payload.quantity;
            } else {
                state.cart.push(action.payload);
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
        },
        clearCart: (state) => {
            state.cart = [];
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = orderSlice.actions;

export default orderSlice.reducer;
