import '@/styles/globals.css';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextComponentType, NextPageContext } from 'next';
import { AppProps } from 'next/app';

type NextLayoutComponentType<P = {}> = NextComponentType<NextPageContext, any, P> & {
    getLayout?: (page: ReactNode) => ReactNode;
};

type AppLayoutProps = AppProps & {
    Component: NextLayoutComponentType;
};

export default function App({ Component, pageProps }: AppLayoutProps) {
    const [queryClient] = useState(() => new QueryClient());
    const getLayout = Component.getLayout || ((page) => page);

    return (
        <ClerkProvider {...pageProps}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <Hydrate state={pageProps.dehydratedState}>
                        {getLayout(<Component {...pageProps} />)}
                        <ReactQueryDevtools initialIsOpen={false} />
                    </Hydrate>
                </QueryClientProvider>
            </Provider>
        </ClerkProvider>
    );
}
