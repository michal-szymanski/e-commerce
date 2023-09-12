import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ElementRef, HTMLAttributes, useCallback, useEffect, useState, KeyboardEvent } from 'react';
import { useSearchProducts } from '@/hooks/queries';
import { debounce } from '@/lib/utils';
import { useRouter } from 'next/router';

type Props = {
    initialSearch: string;
} & HTMLAttributes<ElementRef<'div'>>;

const SearchBar = ({ initialSearch, className }: Props) => {
    const router = useRouter();
    const [value, setValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const { data } = useSearchProducts(debouncedValue);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setValue(initialSearch);
    }, [initialSearch]);

    const handleSearch = useCallback(
        debounce(async (value: string) => {
            setDebouncedValue(value);
            setIsVisible(true);
        }, 500),
        []
    );

    useEffect(() => {
        if (!value || initialSearch === value) return;

        handleSearch(value);
    }, [value, handleSearch, initialSearch]);

    const handleSelect = async (search: string) => {
        const url = `/products${search ? '?search=' + encodeURIComponent(search) : ''}`;

        if (url === router.asPath) {
            setValue(search);
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

    const isSearchResult = !!data?.length;

    return (
        <Command className={className} shouldFilter={false}>
            <CommandInput placeholder="What are you looking for?" value={value} onValueChange={setValue} onKeyDown={handleKeyDown} />
            {isVisible && (
                <CommandList>
                    {!isSearchResult && <CommandEmpty>No results found.</CommandEmpty>}
                    {isSearchResult && (
                        <CommandGroup>
                            {data.map((item) => (
                                <CommandItem key={item.id} onSelect={() => handleSelect(item.name)} onClick={() => handleSelect(item.name)}>
                                    {item.name}
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
