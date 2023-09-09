import { SignIn } from '@clerk/nextjs';

export default () => (
    <SignIn
        appearance={{
            elements: {
                rootBox: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            }
        }}
    />
);
