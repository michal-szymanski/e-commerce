import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { ElementRef, HTMLAttributes, useEffect, useState } from 'react';

const SearchBar = (props: HTMLAttributes<ElementRef<'div'>>) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        console.log(value);
    }, [value]);

    return (
        <Command {...props} shouldFilter={false}>
            <CommandInput placeholder="What are you looking for?" value={value} onValueChange={setValue} />
            <CommandList>
                {/*<CommandEmpty>No results found.</CommandEmpty>*/}
                {value && (
                    <>
                        <CommandGroup heading="Suggestions">
                            <CommandItem>Calendar</CommandItem>
                            <CommandItem>Search Emoji</CommandItem>
                            <CommandItem>Calculator</CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Settings">
                            <CommandItem>Profile</CommandItem>
                            <CommandItem>Billing</CommandItem>
                            <CommandItem>Settings</CommandItem>
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </Command>
    );
};

export default SearchBar;
