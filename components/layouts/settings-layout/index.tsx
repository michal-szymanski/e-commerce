import DefaultLayout from '@/components/layouts/default-layout';
import { useRouter } from 'next/router';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReactNode } from 'react';
import { BellIcon, BriefcaseIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ShieldCheck } from 'lucide-react';

type SidebarMenuItem = { text: string; href: string; icon: ReactNode };

const items: SidebarMenuItem[] = [
    { text: 'Account', href: '/settings/account', icon: <UserCircleIcon className="h-5 w-5" /> },
    { text: 'Organization', href: '/settings/organization', icon: <BriefcaseIcon className="h-5 w-5" /> },
    { text: 'Notifications', href: '/settings/notifications', icon: <BellIcon className="h-5 w-5" /> },
    { text: 'Security', href: '/settings/security', icon: <ShieldCheck className="h-5 w-5" /> }
];

type Props = {
    children: ReactNode;
};

const SettingsLayout = ({ children }: Props) => {
    const router = useRouter();
    return (
        <DefaultLayout>
            <div className="container">
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-muted-foreground">Manage your account settings.</p>
                <div className="py-6">
                    <Separator />
                </div>
                <div className="flex">
                    <aside className="sticky top-0 flex h-min w-full max-w-min flex-col gap-1 pr-10 md:static">
                        {items.map(({ text, href, icon }) => (
                            <Button
                                key={text}
                                variant={router.asPath === href ? 'secondary' : 'ghost'}
                                className="w-full justify-center lg:justify-start"
                                asChild
                            >
                                <Link href={href}>
                                    <span className="lg:pr-3">{icon}</span>
                                    <span className="hidden lg:inline">{text}</span>
                                </Link>
                            </Button>
                        ))}
                    </aside>
                    <div className="w-full max-w-[400px]">{children}</div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default SettingsLayout;
