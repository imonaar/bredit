"use client"
import { useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from 'axios'

import { ExtendedPost } from "@/types/db"
import { useIntersection } from "@/hooks/use-intersection"
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../../config"
import Post from "./post"

interface PostFeedProps {
    initialPosts: ExtendedPost[],
    subredditName?: string,
    userId?: string
}
export function PostFeed({ initialPosts, subredditName, userId }: PostFeedProps) {
    const lastPostRef = useRef<HTMLElement>(null)

    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1
    })

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['projects'],
        queryFn: async ({ pageParam }) => {
            const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` + (!!subredditName ? `&subredditName=${subredditName} ` : '')
            const { data } = await axios.get(query)
            return data as ExtendedPost[]
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length === 0) {
                return undefined
            }
            return lastPageParam + 1
        },
        getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
            if (firstPageParam <= 1) {
                return undefined
            }
            return firstPageParam - 1
        },
        initialData: { pages: [initialPosts], pageParams: [1] }
    })

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts

    return (
        <ul className="flex flex-col col-span-2 space-y-6">
            {
                posts.map((post, index) => {
                    const totalVotes = post.votes.reduce((total, vote) => {
                        if (vote.type === 'UP') return total + 1
                        if (vote.type === 'DOWN') return total - 1
                        return total
                    }, 0)

                    const currentVote = post.votes.find(vote => vote.userId === userId)

                    if (index === posts.length - 1) {
                        return (
                            <li key={post.id} ref={ref}>
                                <Post
                                    subredditName={post.subreddit.name}
                                    post={post}
                                    commentAmt={post.comments.length}
                                />
                            </li>
                        )
                    } else {
                        return (
                            <li key={post.id}>
                                <Post
                                    subredditName={post.subreddit.name}
                                    post={post}
                                    commentAmt={post.comments.length}
                                />
                            </li>
                        )
                    }
                })
            }
        </ul>
    )
}
