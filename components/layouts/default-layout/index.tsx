import { ReactNode } from 'react';
import Navbar from '@/components/layouts/navbar';
import CartFooter from '@/components/layouts/cart-footer';

type Props = {
    children: ReactNode;
};

const Layout = ({ children }: Props) => (
    <>
        <Navbar />
        {children}
        <CartFooter />
    </>
);

export default Layout;
