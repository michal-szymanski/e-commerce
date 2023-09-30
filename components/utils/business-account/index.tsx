import { useOrganization } from '@clerk/nextjs';
import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};
const BusinessAccount = ({ children }: Props) => {
    const { organization } = useOrganization();

    return organization ? <>{children}</> : null;
};

export default BusinessAccount;
