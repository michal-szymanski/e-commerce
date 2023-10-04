import CartItem from '@/components/ui/custom/cart-item';
import { useCart } from '@/hooks/queries';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { useOrganization, useUser } from '@clerk/nextjs';

const Page = () => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);

    return (
        <>
            <Head>
                <title>{`Cart | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="flex flex-col items-center gap-5 pb-36">
                {cart?.map(({ quantity, product }) => <CartItem key={product.id} quantity={quantity} product={product} />)}
            </div>
        </>
    );
};

export default Page;
