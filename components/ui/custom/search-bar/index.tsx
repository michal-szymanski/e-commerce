import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { ElementRef, HTMLAttributes, useCallback, useEffect, useState, FocusEvent } from 'react';
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
    const { data, isFetched } = useSearchProducts(debouncedValue);
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

    const handleSelect = async (item: { id: number; name: string }) => {
        const url = `/products?search=${encodeURIComponent(item.name)}`;

        if (url === router.asPath) {
            setValue(item.name);
            setIsVisible(false);
            return;
        }

        await router.push(url);
    };

    return (
        <Command className={className} shouldFilter={false}>
            <CommandInput placeholder="What are you looking for?" value={value} onValueChange={setValue} />
            {isVisible && isFetched && (
                <CommandList>
                    {!data?.length && <CommandEmpty>No results found.</CommandEmpty>}
                    {data?.length && (
                        <CommandGroup>
                            {data.map((item) => (
                                <CommandItem key={item.id} onSelect={() => handleSelect(item)} onClick={() => handleSelect(item)} role="button">
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
