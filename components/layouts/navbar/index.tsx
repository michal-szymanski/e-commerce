import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import CartCounter from '@/components/ui/custom/cart-icon';
import { OrganizationSwitcher, SignedIn, SignedOut } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import SearchBar from '@/components/ui/custom/search-bar';
import { useRouter } from 'next/router';
import { z } from 'zod';
import UserDropdown from '@/components/ui/custom/user-dropdown';

const Navbar = () => {
    const router = useRouter();
    const querySearch = z.string().nonempty().safeParse(router.query.name);

    return (
        <NavigationMenu className="fixed h-[70px] min-w-full justify-between px-10 py-3 shadow-sm">
            <SearchBar
                key={router.asPath}
                initialSearch={querySearch.success ? querySearch.data : ''}
                className="absolute left-1/2 top-1/2 h-auto w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg border shadow-md"
            />
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
                    <NavigationMenuItem>
                        <Link href="/orders" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'cursor-pointer')}>Orders</NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <OrganizationSwitcher createOrganizationMode="navigation" createOrganizationUrl="/create-organization" />
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <UserDropdown />
                    </NavigationMenuItem>
                </SignedIn>
                <SignedOut>
                    <NavigationMenuItem>
                        <Link href="/sign-up" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'cursor-pointer')}>Sign Up</NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/sign-in" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'cursor-pointer')}>Sign In</NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </SignedOut>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

export default Navbar;
