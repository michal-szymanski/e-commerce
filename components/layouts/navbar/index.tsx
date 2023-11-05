import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import CartCounter from '@/components/ui/custom/cart-icon';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import SearchBar from '@/components/ui/custom/search-bar';
import { useRouter } from 'next/router';
import { z } from 'zod';
import UserDropdown from '@/components/ui/custom/user-dropdown';
import PersonalAccount from '@/components/utils/personal-account';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const links: { text: string; href: string }[] = [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' }
];

const Navbar = () => {
    const router = useRouter();
    const querySearch = z.string().min(1).safeParse(router.query.name);

    return (
        <NavigationMenu className="fixed top-0 h-[120px] w-full min-w-full flex-wrap items-center justify-between bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 md:h-[70px] md:px-5">
            <NavigationMenuList className="space-x-0">
                <NavigationMenuItem className="hidden md:flex">
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="hidden md:flex">
                    <Link href="/products" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Products</NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button type="button" variant="outline">
                                <Bars3Icon className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetTitle>Menu</SheetTitle>
                            <div className="flex flex-col gap-5 pt-10">
                                {links.map(({ text, href }) => (
                                    <SheetClose key={href} asChild>
                                        <Button variant="secondary" asChild>
                                            <Link href={href}>{text}</Link>
                                        </Button>
                                    </SheetClose>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </NavigationMenuItem>
            </NavigationMenuList>
            <SearchBar key={router.asPath} initialSearch={querySearch.success ? querySearch.data : ''} />
            <NavigationMenuList>
                <PersonalAccount>
                    <NavigationMenuItem>
                        <Link href="/cart" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                <CartCounter />
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </PersonalAccount>
                <SignedIn>
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
