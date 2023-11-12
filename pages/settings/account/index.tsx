import { ReactNode } from 'react';
import SettingsLayout from '@/components/layouts/settings-layout';
import ProfileForm from '@/components/ui/custom/forms/settings/profile-form';
import PasswordForm from '@/components/ui/custom/forms/settings/password-form';
import { Separator } from '@/components/ui/separator';
import DeleteAccountDialog from '@/components/ui/custom/delete-account-dialog';

const Page = () => {
    return (
        <div className="flex flex-col gap-20">
            <section>
                <header>
                    <h3 className="text-lg font-medium">Profile</h3>
                    <p className="text-sm text-muted-foreground">Set basic information about yourself.</p>
                    <div className="py-6">
                        <Separator />
                    </div>
                </header>
                <ProfileForm />
            </section>
            <section>
                <header className="pb-5">
                    <h3 className="text-lg font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">Secure your account with a new password.</p>
                    <div className="py-6">
                        <Separator />
                    </div>
                </header>
                <PasswordForm />
            </section>
            <section>
                <header className="pb-5">
                    <h3 className="text-lg font-medium">Danger</h3>
                    <p className="text-sm text-muted-foreground">Delete your account and all its associated data.</p>
                    <div className="py-6">
                        <Separator />
                    </div>
                </header>
                <DeleteAccountDialog />
            </section>
        </div>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
