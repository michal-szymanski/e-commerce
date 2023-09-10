import { SignUp } from '@clerk/nextjs';

export default () => (
    <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        appearance={{
            elements: {
                rootBox: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            }
        }}
    />
);
