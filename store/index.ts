import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import uiReducer from '@/store/slices/ui';

export const store = configureStore({
    reducer: {
        ui: uiReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
