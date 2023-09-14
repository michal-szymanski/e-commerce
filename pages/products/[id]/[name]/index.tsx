import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { getProduct } from '@/sql-service';

export default ({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return <div>{JSON.stringify(product)}</div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const parsedId = z.coerce.number().parse(context.query.id);
        const product = await getProduct(parsedId);

        return {
            props: {
                product
            }
        };
    } catch {
        return {
            notFound: true
        };
    }
};
