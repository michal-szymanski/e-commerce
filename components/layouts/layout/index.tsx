import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import DefaultLayout from '@/components/layouts/default-layout';

type Props = {
    children: ReactNode;
};

const Layout = ({ children }: Props) => {
    const router = useRouter();
    return router.asPath.startsWith('/dashboard') ? <DashboardLayout>{children}</DashboardLayout> : <DefaultLayout>{children}</DefaultLayout>;
};

export default Layout;
