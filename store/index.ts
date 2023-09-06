import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import orderReducer from '@/store/slices/order';

const logger = createLogger({});

export const store = configureStore({
    reducer: {
        order: orderReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
