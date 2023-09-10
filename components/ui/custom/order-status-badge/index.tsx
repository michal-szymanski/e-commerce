import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

type Props = {
    status: OrderStatus;
};

const OrderStatusBadge = ({ status }: Props) => {
    return <Badge variant="outline">{status}</Badge>;
};

export default OrderStatusBadge;
