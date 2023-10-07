import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import NewProductForm from '@/components/ui/custom/forms/new-product-form';
import { useState } from 'react';
import ProductPage from '@/components/ui/custom/product-page';

const Page = () => {
    const [{ id, name, price, description }, setProduct] = useState({ id: '', name: '', price: 0, description: '' });

    return (
        <div>
            <h1 className="pb-10 text-4xl font-bold">New Product</h1>
            <div className="container mx-auto py-10">
                <div className="2xl:grid-cols-add-product-preview lg:grid-rows-add-product-preview grid gap-5">
                    <NewProductForm setProduct={(value) => setProduct(value)} />
                    <ProductPage
                        isPreview
                        id={id}
                        name={name}
                        price={price * 100}
                        currency="pln"
                        images={[
                            'https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80'
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
    const { userId, orgId } = getAuth(context.req);

    if (!userId || !orgId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    return {
        props: {}
    };
};
