import { orderStatusSchema } from '@/types';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

type Props = {
    status: z.infer<typeof orderStatusSchema>;
};

type Variant = 'default' | 'blue' | 'yellow' | 'green' | 'red';

const statusVariantMap: Record<z.infer<typeof orderStatusSchema>, Variant> = {
    Pending: 'default',
    New: 'blue',
    'In Progress': 'yellow',
    Completed: 'green',
    Cancelled: 'red'
};

const OrderStatusBadge = ({ status }: Props) => {
    const variant = statusVariantMap[status];
    return <Badge variant={variant}>{status}</Badge>;
};

export default OrderStatusBadge;
