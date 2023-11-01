import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useClerk, useOrganization, useUser } from '@clerk/nextjs';
import { ArrowRightOnRectangleIcon, Cog8ToothIcon, HomeIcon, PlusSmallIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ChartBarIcon } from '@heroicons/react/24/solid';
import { useQueryClient } from '@tanstack/react-query';
import BusinessAccount from '@/components/utils/business-account';
import PersonalAccount from '@/components/utils/personal-account';

const UserDropdown = () => {
    const { user } = useUser();
    const { signOut, setActive } = useClerk();
    const { organization } = useOrganization();
    const queryClient = useQueryClient();
    const router = useRouter();

    const removeAllQueries = () => {
        queryClient.removeQueries(['order']);
        queryClient.removeQueries(['organization-products']);
        queryClient.removeQueries(['products']);
    };

    if (!user) return null;

    const isUserInDashboard = router.asPath.startsWith('/dashboard');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                    <AvatarImage src={user.imageUrl} />
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <div className="text-lg">{user.fullName}</div>
                    <div className="text-sm font-normal text-muted-foreground">{organization ? 'Business' : 'Personal'} Account</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <BusinessAccount>
                    {isUserInDashboard ? (
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/')}>
                            <HomeIcon className="h-5 w-5" />
                            <span className="pl-2">Home</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <ChartBarIcon className="h-5 w-5" />
                            <span className="pl-2">Dashboard</span>
                        </DropdownMenuItem>
                    )}
                </BusinessAccount>
                <PersonalAccount>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/orders')}>
                        <TruckIcon className="h-5 w-5" />
                        <span className="pl-2">Orders</span>
                    </DropdownMenuItem>
                </PersonalAccount>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/user-profile')}>
                    <Cog8ToothIcon className="h-5 w-5" />
                    <span className="pl-2">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Accounts</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setActive({ organization: null })}
                    className={cn('cursor-pointer', {
                        'text-muted-foreground': organization
                    })}
                >
                    <CheckIcon
                        className={cn('h-5 w-5', {
                            invisible: organization
                        })}
                    />
                    <span className="pl-2">Personal</span>
                </DropdownMenuItem>
                {user.organizationMemberships.map((m) => (
                    <DropdownMenuItem
                        key={m.id}
                        onClick={() => {
                            setActive({ organization: m.organization });
                            removeAllQueries();
                        }}
                        className={cn('cursor-pointer', {
                            'text-muted-foreground': organization?.id !== m.organization.id
                        })}
                    >
                        <CheckIcon
                            className={cn('h-5 w-5', {
                                invisible: organization?.id !== m.organization.id
                            })}
                        />
                        <span className="pl-2">{m.organization.name}</span>
                    </DropdownMenuItem>
                ))}
                <PersonalAccount>
                    {!user.organizationMemberships.length && (
                        <DropdownMenuItem onClick={() => router.push('/create-organization')} className="cursor-pointer">
                            <PlusSmallIcon className="h-5 w-5" />
                            <span className="pl-2">Create Organization</span>
                        </DropdownMenuItem>
                    )}
                </PersonalAccount>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        signOut();
                        removeAllQueries();
                    }}
                    className="cursor-pointer"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span className="pl-2">Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;
