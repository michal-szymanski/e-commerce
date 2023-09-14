import { ReactNode } from 'react';
import Navbar from '@/components/layouts/navbar';
import CartFooter from '@/components/layouts/cart-footer';

type Props = {
    children: ReactNode;
};

const Layout = ({ children }: Props) => (
    <>
        <Navbar />
        <main className="py-12">{children}</main>
        <CartFooter />
    </>
);

export default Layout;
