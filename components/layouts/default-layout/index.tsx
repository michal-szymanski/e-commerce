import { ReactNode } from 'react';
import Navbar from '@/components/layouts/navbar';
import CartFooter from '@/components/layouts/cart-footer';
import { env } from '@/env.mjs';
import Head from 'next/head';

type Props = {
    children: ReactNode;
};

const Layout = ({ children }: Props) => (
    <>
        <Head>
            <title>{env.NEXT_PUBLIC_APP_NAME}</title>
        </Head>
        <Navbar />
        <main className="py-12">{children}</main>
        <CartFooter />
    </>
);

export default Layout;
