import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const HeroImage = () => (
    <div>
        <AspectRatio ratio={16 / 9} className="relative bg-muted">
            <Image
                src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                alt="Photo by Drew Beamer"
                fill
                className="rounded-md object-cover"
                priority
            />
            <div className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 p-5 xl:right-0 xl:-translate-x-1/4">
                <h1 className="whitespace-nowrap bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-5xl font-extrabold text-transparent md:text-8xl">
                    E-commerce
                </h1>
                <h2 className="text-md pl-0.5 pt-1 font-bold text-muted-foreground md:pl-1 md:text-2xl">Shop our sale, it's so epic, it should be illegal.</h2>
            </div>
        </AspectRatio>
    </div>
);

export default HeroImage;
