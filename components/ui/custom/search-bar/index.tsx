import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ElementRef, HTMLAttributes, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useSearchProducts } from '@/hooks/queries';
import { debounce } from '@/lib/utils';
import { useRouter } from 'next/router';

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
        <Command className={className} shouldFilter={false}>
            <CommandInput placeholder="What are you looking for?" value={value} onValueChange={setValue} onKeyDown={handleKeyDown} {...passwordManagersProps} />

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
        </Command>
    );
};

export default SearchBar;
