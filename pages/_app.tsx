import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from '@/components/layouts/layout';

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ClerkProvider {...pageProps}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <Hydrate state={pageProps.dehydratedState}>
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                        <ReactQueryDevtools initialIsOpen={false} />
                    </Hydrate>
                </QueryClientProvider>
            </Provider>
        </ClerkProvider>
    );
}
