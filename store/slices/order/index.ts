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
        removeFromCart: (state, action: PayloadAction<ProductWithMedia>) => {
            const existingCartItem = state.cart.find((c) => c.product.id === action.payload.id);

            if (!existingCartItem) return;

            if (existingCartItem.quantity > 1) {
                existingCartItem.quantity -= 1;
            } else {
                state.cart = state.cart.filter((c) => c.product.id !== existingCartItem.product.id);
            }
        }
    }
});

export const { addToCart } = orderSlice.actions;

export default orderSlice.reducer;
