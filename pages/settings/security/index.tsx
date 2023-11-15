import { ReactNode, useEffect, useState } from 'react';
import SettingsLayout from '@/components/layouts/settings-layout';
import { useSession, useSessionList } from '@clerk/nextjs';
import { SessionWithActivitiesResource } from '@clerk/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ComputerDesktopIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/tailwind';

dayjs.extend(relativeTime);

const Page = () => {
    const { sessions } = useSessionList();
    const { session } = useSession();
    const [sessionsWithActivities, setSessionsWithActivities] = useState<SessionWithActivitiesResource[]>([]);

    useEffect(() => {
        if (!sessions || !session) return;

        const fetchSessionsWithActivities = async () => {
            const sessionsWithActivities = (await Promise.all(sessions.filter((s) => s.user !== null).map((s) => s.user!.getSessions())))
                .flatMap((s) => s)
                .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
            setSessionsWithActivities(sessionsWithActivities);
        };

        fetchSessionsWithActivities();
    }, [sessions, session]);

    const handleRevoke = async (sessionWithActivity: SessionWithActivitiesResource) => {
        await sessionWithActivity.revoke();
        setSessionsWithActivities((prev) => prev.filter((s) => s.id !== sessionWithActivity.id));
    };

    return (
        <section>
            <header>
                <h3 className="text-lg font-medium">Active sessions</h3>
                <p className="text-sm text-muted-foreground">Manage your active devices.</p>
                <div className="py-6">
                    <Separator />
                </div>
            </header>
            <div className="flex flex-col gap-5">
                {sessionsWithActivities.map((s) => (
                    <article
                        key={s.id}
                        className={cn('flex flex-col gap-4 rounded-lg border p-4', {
                            'order-first': s.id === session?.id
                        })}
                    >
                        <header>
                            <h3 className="flex justify-between font-bold">
                                <div className="flex items-center gap-2">
                                    {s.latestActivity.isMobile ? <DevicePhoneMobileIcon className="h-5 w-5" /> : <ComputerDesktopIcon className="h-5 w-5" />}
                                    <span>{s.latestActivity.deviceType}</span>
                                </div>
                                {session?.id === s.id && <Badge variant="default">This device</Badge>}
                            </h3>
                        </header>
                        <section>
                            <p>
                                {s.latestActivity.browserName} (version {s.latestActivity.browserVersion})
                            </p>
                            <p>
                                {s.latestActivity.ipAddress} ({s.latestActivity.city}, {s.latestActivity.country})
                            </p>
                        </section>
                        <footer className="flex items-center justify-between">
                            <span className="text-muted-foreground">{dayjs(s.lastActiveAt).fromNow()}</span>
                            {session?.id !== s.id && (
                                <Button type="button" variant="destructive" className="h-6 text-xs" onClick={() => handleRevoke(s)}>
                                    Sign Out
                                </Button>
                            )}
                        </footer>
                    </article>
                ))}
            </div>
        </section>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
