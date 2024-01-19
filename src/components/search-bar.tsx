"use client"

import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { useCallback, useState } from "react";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import debounce from 'lodash.debounce'

export function SearchBar() {
    const [input, setInput] = useState("")
    const router = useRouter()

    const request = debounce(() => refetch(), 300)

    const debounceRequest = useCallback(() => {
        request()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { data: queryResults, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            if (!input) {
                return []
            }

            const { data } = await axios.get(`/api/search?q=${input}`)
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[]
        },
        queryKey: ['search-query'],
        enabled: false
    })

    return (
        <Command
            className='relative rounded-lg border max-w-lg z-50 overflow-visible'>
            <CommandInput
                onValueChange={(text) => {
                    setInput(text)
                    debounceRequest()
                }}
                value={input}
                className='outline-none border-none focus:border-none focus:outline-none ring-0'
                placeholder='Search communities...'
            />

            {input.length > 0 && (
                <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
                    {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
                    {(queryResults?.length ?? 0) > 0 ? (
                        <CommandGroup heading='Communities'>
                            {queryResults?.map((subreddit) => (
                                <CommandItem
                                    onSelect={(e) => {
                                        router.push(`/r/${e}`)
                                        router.refresh()
                                    }}
                                    key={subreddit.id}
                                    value={subreddit.name}>
                                    <Users className='mr-2 h-4 w-4' />
                                    <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            )}
        </Command>
    )
}
