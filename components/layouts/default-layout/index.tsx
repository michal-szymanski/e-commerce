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
        <main className="absolute bottom-0 left-0 right-0 top-[70px] h-full overflow-y-auto pt-[100px]">{children}</main>
        <CartFooter />
    </>
);

export default Layout;
