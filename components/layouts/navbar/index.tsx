import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import CartCounter from '@/components/ui/custom/cart-icon';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

const Navbar = () => {
    return (
        <NavigationMenu className="max-w-[100%] justify-between p-3">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                    </Link>
                    <Link href="/products" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Products</NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/cart" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            <CartCounter />
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <NavigationMenuItem>
                        <SignUpButton redirectUrl="/">
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'cursor-pointer')}>Sign Up</NavigationMenuLink>
                        </SignUpButton>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <SignInButton redirectUrl="/">
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'cursor-pointer')}>Sign In</NavigationMenuLink>
                        </SignInButton>
                    </NavigationMenuItem>
                </SignedOut>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

export default Navbar;
