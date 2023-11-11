import { ReactNode } from 'react';
import SettingsLayout from '@/components/layouts/settings-layout';

const Page = () => {
    return <div>Notifications</div>;
};

Page.getLayout = (page: ReactNode) => {
    return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
