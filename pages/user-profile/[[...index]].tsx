import { UserProfile } from '@clerk/nextjs';

export default () => (
    <UserProfile
        path="/user-profile"
        routing="path"
        appearance={{
            elements: {
                rootBox: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            }
        }}
    />
);
