import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { ChartBarIcon, CubeIcon, ShoppingCartIcon, UsersIcon } from '@heroicons/react/20/solid';
import { ReactNode } from 'react';
import UserDropdown from '@/components/ui/custom/user-dropdown';

type SidebarMenuItem = { text: string; href: string; icon: ReactNode };

const items: SidebarMenuItem[] = [
    { text: 'Overview', href: '/dashboard', icon: <ChartBarIcon className="h-5 w-5" /> },
    { text: 'Orders', href: '/dashboard/orders', icon: <ShoppingCartIcon className="h-5 w-5" /> },
    { text: 'Products', href: '/dashboard/products', icon: <CubeIcon className="h-5 w-5" /> },
    { text: 'Customers', href: '/dashboard/customers', icon: <UsersIcon className="h-5 w-5" /> }
];

type Props = {
    children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
    const router = useRouter();

    return (
        <div className="grid h-full grid-cols-dashboard overflow-y-auto">
            <aside className="flex flex-col gap-1 px-3 pt-80">
                {items.map(({ text, href, icon }) => (
                    <Button key={text} variant={router.asPath === href ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
                        <Link href={href}>
                            <span className="pr-3">{icon}</span>
                            <span>{text}</span>
                        </Link>
                    </Button>
                ))}
            </aside>
            <main className="grid grid-rows-[70px_1fr] bg-gray-100">
                <div className="flex items-center justify-end px-10 py-3">
                    <UserDropdown />
                </div>
                <div className="p-10">{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;