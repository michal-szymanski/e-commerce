import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ElementRef, HTMLAttributes, useCallback, useEffect, useState, KeyboardEvent } from 'react';
import { useProducts } from '@/hooks/queries';
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
    const { data: products } = useProducts(debouncedValue, 10, 0, !!value);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setValue(initialSearch);
    }, [initialSearch]);

    const handleSearch = useCallback(
        () => debounce(async (value: string) => {
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

    const isSearchResult = !!products?.length;

    return (
        <Command className={className} shouldFilter={false}>
            <CommandInput placeholder="What are you looking for?" value={value} onValueChange={setValue} onKeyDown={handleKeyDown} {...passwordManagersProps} />

            {isVisible && (
                <CommandList>
                    {!isSearchResult && <CommandEmpty>No results found.</CommandEmpty>}
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
