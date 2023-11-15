import { ReactNode, useEffect, useState } from 'react';
import SettingsLayout from '@/components/layouts/settings-layout';
import { Separator } from '@/components/ui/separator';
import { useOrganizationList } from '@clerk/nextjs';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { OrganizationMembershipResource } from '@clerk/types';
import { MembershipRole } from '@clerk/types/dist/organizationMembership';

const Page = () => {
    const { userMemberships } = useOrganizationList({
        userMemberships: true
    });

    const [currentMembership, setCurrentMembership] = useState<OrganizationMembershipResource>();
    const [organizationMemberships, setOrganizationMemberships] = useState<OrganizationMembershipResource[]>([]);
    const [role, setRole] = useState<MembershipRole>();

    useEffect(() => {
        const fetchMembers = async (membership: OrganizationMembershipResource) => {
            const memberships = (await membership.organization.getMemberships()).filter((m) => m.id !== membership.id);
            if (memberships.length) {
                setOrganizationMemberships(memberships);
            }
        };

        const membership = userMemberships?.data?.[0];

        if (membership) {
            setCurrentMembership(membership);
            setRole(membership.role);
            fetchMembers(membership);
        }
    }, [userMemberships]);

    return (
        <div className="flex flex-col gap-5">
            <section>
                <header>
                    <h3 className="text-lg font-medium">Your organization</h3>
                    <p className="text-sm text-muted-foreground">Manage your {`organization's`} membership.</p>
                    <div className="py-6">
                        <Separator />
                    </div>
                </header>
                {currentMembership && (
                    <article className="flex flex-col gap-3 rounded-lg border p-4">
                        <header className="flex items-center gap-5">
                            <Avatar>
                                <AvatarImage src={currentMembership.organization.imageUrl} asChild>
                                    <Image src={currentMembership.organization.imageUrl} width={50} height={50} alt="Organization's image" />
                                </AvatarImage>
                            </Avatar>
                            <h4 className="text-lg font-bold">{currentMembership.organization.name}</h4>
                        </header>
                        <footer className="flex items-center justify-between">
                            <div className="text-muted-foreground">
                                {currentMembership.organization.membersCount} {currentMembership.organization.membersCount > 1 ? 'members' : 'member'}
                            </div>
                            {role === 'basic_member' && (
                                <Button type="button" variant="destructive" className="h-6 text-xs" onClick={() => currentMembership.destroy()}>
                                    Leave
                                </Button>
                            )}
                        </footer>
                    </article>
                )}
            </section>
            {role === 'admin' && organizationMemberships.length > 0 && (
                <section>
                    <header>
                        <h3 className="text-lg font-medium">{`Organization's`} members</h3>
                        <p className="text-sm text-muted-foreground">Manage membership of others.</p>
                        <div className="py-6">
                            <Separator />
                        </div>
                        {organizationMemberships.map((m) => (
                            <article key={m.id} className="flex flex-col gap-3 rounded-lg border p-4">
                                {m.publicUserData.firstName} {m.publicUserData.lastName}
                            </article>
                        ))}
                    </header>
                </section>
            )}
        </div>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
