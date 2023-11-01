import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

const Page = () => {
    return (
        <main className={`container ${inter.className}`}>
            <AspectRatio ratio={16 / 9} className="bg-muted">
                <Image
                    src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                    alt="Photo by Drew Beamer"
                    fill
                    className="rounded-md object-cover"
                    priority
                />
            </AspectRatio>
        </main>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export default Page;
