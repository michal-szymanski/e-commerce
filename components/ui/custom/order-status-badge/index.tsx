import { orderStatusSchema } from '@/types';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

type Props = {
    status: z.infer<typeof orderStatusSchema>;
};

const OrderStatusBadge = ({ status }: Props) => {
    return <Badge variant="outline">{status}</Badge>;
};

export default OrderStatusBadge;
