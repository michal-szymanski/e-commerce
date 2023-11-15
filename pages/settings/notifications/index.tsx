import { ReactNode } from 'react';
import SettingsLayout from '@/components/layouts/settings-layout';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const Page = () => {
    return (
        <section>
            <header>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Manage your notifications.</p>
                <div className="py-6">
                    <Separator />
                </div>
                <article className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <h4 className="font-bold">Mandatory notifications</h4>
                        <p className="text-sm text-muted-foreground">Includes security and order processing emails.</p>
                    </div>
                    <Switch checked disabled />
                </article>
            </header>
        </section>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
