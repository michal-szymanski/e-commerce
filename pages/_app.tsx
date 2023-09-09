import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '@/components/layouts/navbar';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ClerkProvider } from '@clerk/nextjs';

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ClerkProvider {...pageProps}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <Hydrate state={pageProps.dehydratedState}>
                        <Navbar />
                        <Component {...pageProps} />
                    </Hydrate>
                </QueryClientProvider>
            </Provider>
        </ClerkProvider>
    );
}
