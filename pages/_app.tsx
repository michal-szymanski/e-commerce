import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ClerkProvider } from '@clerk/nextjs';
import Layout from '@/components/layouts/default-layout';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextUIProvider } from '@nextui-org/react';

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ClerkProvider {...pageProps}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <Hydrate state={pageProps.dehydratedState}>
                        <NextUIProvider>
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>
                        </NextUIProvider>
                        <ReactQueryDevtools initialIsOpen={false} />
                    </Hydrate>
                </QueryClientProvider>
            </Provider>
        </ClerkProvider>
    );
}
