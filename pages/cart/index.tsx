import CartItem from '@/components/ui/custom/cart-item';
import { useCart } from '@/hooks/queries';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { useUser } from '@clerk/nextjs';

export default () => {
    const { isSignedIn } = useUser();
    const { data: cart } = useCart(!!isSignedIn);

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
