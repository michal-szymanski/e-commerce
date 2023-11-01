import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ElementRef, HTMLAttributes, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useSearchProducts } from '@/hooks/queries';
import { debounce } from '@/lib/utils';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type Props = {
    initialSearch: string;
} & HTMLAttributes<ElementRef<'div'>>;

const passwordManagersProps = {
    'data-np-intersection-state': '',
    'data-np-disabled': 'true',
    'data-lpignore': 'true'
};

const SearchBar = ({ initialSearch, className }: Props) => {
    const router = useRouter();
    const [value, setValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const isSearchEnabled = debouncedValue.length > 2;
    const { data: products } = useSearchProducts({ name: debouncedValue, enabled: isSearchEnabled });
    const isSearchResult = !!products?.length;

    useEffect(() => {
        if (router.route === '/products/[id]/[name]') return;
        setValue(initialSearch);
    }, [initialSearch, router]);

    const handleSearch = useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedValue(value);
                setIsVisible(true);
            }, 500),
        []
    );

    useEffect(() => {
        if (!value || initialSearch === value) return;

        handleSearch(value);
    }, [value, handleSearch, initialSearch]);

    const handleSelect = async (name: string) => {
        const url = `/products${name ? '?name=' + encodeURIComponent(name) : ''}`;

        if (url === router.asPath) {
            setValue(name);
            setIsVisible(false);
            return;
        }

        await router.push(url);
    };

    const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            await handleSelect(value);
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start gap-3 rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12"
                onClick={() => setOpen((prev) => !prev)}
                disabled={open}
            >
                <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" />
                <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">{value ? value : 'Search for product...'}</div>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search for product..."
                    value={value}
                    onValueChange={setValue}
                    onKeyDown={handleKeyDown}
                    {...passwordManagersProps}
                    onClick={() => setOpen((prev) => !prev)}
                />

                {isVisible && (
                    <CommandList>
                        {!isSearchResult && isSearchEnabled && <CommandEmpty>No results found.</CommandEmpty>}
                        {isSearchResult && (
                            <CommandGroup>
                                {products.map((p) => (
                                    <CommandItem key={p.id} onSelect={() => handleSelect(p.name)} onClick={() => handleSelect(p.name)}>
                                        {p.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                )}
            </CommandDialog>
        </>
    );
};

export default SearchBar;
