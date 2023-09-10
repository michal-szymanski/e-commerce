import { SignIn } from '@clerk/nextjs';

export default () => (
    <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
            elements: {
                rootBox: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            }
        }}
    />
);
