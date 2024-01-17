import { NextResponse } from "next/server";
import * as z from 'zod';

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { postId, voteType } = PostVoteValidator.parse(body)
        const session = await getAuthSession()

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // check if user has already voted on this post
        const existingVote = await db.vote.findFirst({
            where: {
                userId: session.user.id,
                postId,
            },
        })

        const post = await db.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                author: true,
                votes: true,
            },
        })

        if (!post) {
            return new NextResponse('Post not found', { status: 404 })
        }

        if (existingVote) {
            // if vote type is the same as existing vote, delete the vote
            if (existingVote.type === voteType) {

                await db.vote.delete({
                    where: {
                        userId_postId: {
                            postId,
                            userId: session.user.id,
                        },
                    },
                })

                //recount the votes
                const votesAmt = post.votes.reduce((acc, vote) => {
                    if (vote.type === 'UP') return acc + 1
                    if (vote.type === 'DOWN') return acc - 1
                    return acc
                }, 0)

                if (votesAmt > CACHE_AFTER_UPVOTES) {
                    const cachePayload: CachedPost = {
                        id: post.id,
                        authorUsername: post.author.username ?? "",
                        content: JSON.stringify(post.content),
                        title: post.title,
                        currentVote: voteType,
                        createdAt: post.createdAt
                    }
                    await redis.hset(`post:${postId}`, cachePayload)
                }
                return new NextResponse('OK')
            }

            // if vote type is different, update the vote
            await db.vote.update({
                where: {
                    userId_postId: {
                        postId,
                        userId: session.user.id,
                    },
                },
                data: {
                    type: voteType,
                },
            })

            //recount the votes
            const votesAmt = post.votes.reduce((acc, vote) => {
                if (vote.type === 'UP') return acc + 1
                if (vote.type === 'DOWN') return acc - 1
                return acc
            }, 0)

            if (votesAmt > CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedPost = {
                    id: post.id,
                    authorUsername: post.author.username ?? "",
                    content: JSON.stringify(post.content),
                    title: post.title,
                    currentVote: voteType,
                    createdAt: post.createdAt
                }
                await redis.hset(`post:${postId}`, cachePayload)
            }
            return new NextResponse('OK')
        }

        //if not existing, create a new vote type
        await db.vote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                postId,
            },
        })

        // Recount the votes
        const votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc + 1
            if (vote.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        if (votesAmt >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedPost = {
                authorUsername: post.author.username ?? '',
                content: JSON.stringify(post.content),
                id: post.id,
                title: post.title,
                currentVote: voteType,
                createdAt: post.createdAt,
            }

            await redis.hset(`post:${postId}`, cachePayload) // Store the post data as a hash
        }
        return new NextResponse('OK')
    } catch (error) {
        (error)
        if (error instanceof z.ZodError) {
            return new NextResponse(error.message, { status: 400 })
        }

        return new NextResponse(
            'Could not vote at this time. Please try later',
            { status: 500 }
        )
    }
}

