import { useOrganization } from '@clerk/nextjs';
import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};
const PersonalAccount = ({ children }: Props) => {
    const { organization } = useOrganization();

    return organization ? null : <>{children}</>;
};

export default PersonalAccount;
