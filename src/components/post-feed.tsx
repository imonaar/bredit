"use client"

import axios from 'axios';
import { useEffect } from "react";

import { useSession } from 'next-auth/react'
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from 'lucide-react';
import { useInView } from "react-intersection-observer";

import { ExtendedPost } from "@/types/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../../config";
import Post from "./post";

interface PostFeedProps {
    initialPosts: ExtendedPost[],
    subredditName?: string,
    userId?: string
}

type UserQueryParams = {
    take?: number;
    cursor?: string;
    subredditName?: string;
};

export function PostFeed({ initialPosts, subredditName, userId }: PostFeedProps) {
    const { ref, inView } = useInView();
    const { data: session } = useSession()

    const fetchPosts = async ({ take, cursor, subredditName }: UserQueryParams) => {
        const response = await axios.get(`/api/posts`, {
            params: { take, cursor, subredditName }
        })
        return response?.data;
    }

    const {
        data,
        hasNextPage,
        fetchNextPage,
        isSuccess,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: ({ pageParam = "" }) => fetchPosts({ take: INFINITE_SCROLLING_PAGINATION_RESULTS, cursor: pageParam, subredditName }),
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
            return lastPage?.metaData.cursor;
        },
    })

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, inView, fetchNextPage]);

    const posts = (data?.pages.flatMap((page) => page.data) as ExtendedPost[]) ?? initialPosts

    return (
        <ul className="flex flex-col col-span-2 space-y-6">
            {
                posts?.map((post, index: number) => {
                    const totalVotes = post?.votes.reduce((total, vote) => {
                        console.log(vote.type)
                        if (vote.type === 'UP') return total + 1
                        if (vote.type === 'DOWN') return total - 1
                        return total
                    }, 0)

                    const currentVote = post.votes.find(
                        (vote) => vote.userId === session?.user.id
                    )

                    if (index === posts.length - 1) {
                        return (
                            <li key={post.id} ref={ref} >
                                <Post
                                    subredditName={post.subreddit.name}
                                    post={post}
                                    commentAmt={post.comments.length}
                                    votesAmt={totalVotes}
                                    currentVote={currentVote}
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
                                    votesAmt={totalVotes}
                                    currentVote={currentVote}
                                />
                            </li>
                        )
                    }
                })
            }

            {isFetchingNextPage && (
                <li className='flex justify-center'>
                    <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
                </li>
            )}
        </ul>
    )
}
