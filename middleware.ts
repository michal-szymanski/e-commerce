import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
    publicRoutes: ['/', '/products', '/products/:id/:name', '/cart', '/api/products', '/api/webhook']
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
};
