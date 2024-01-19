import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { CommentVoteValidator, PostVoteValidator } from '@/lib/validators/vote'
import { CachedPost } from '@/types/redis'
import { z } from 'zod'

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { commentId, voteType } = CommentVoteValidator.parse(body)

        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        // check if user has already voted on this post
        const existingVote = await db.commentVote.findFirst({
            where: {
                userId: session.user.id,
                commentId,
            },
        })

        if (existingVote) {
            if (existingVote.type === voteType) {
                await db.commentVote.delete({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id,
                        },
                    },
                })
                return new Response('OK')
            } else {
                await db.commentVote.update({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id,
                        },
                    },
                    data: {
                        type: voteType,
                    },
                })
                return new Response('OK')
            }
        }

        await db.commentVote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                commentId,
            },
        })
        return new Response('OK')
    } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 400 })
        }

        return new Response(
            'Could vote on the comment this time    . Please try later',
            { status: 500 }
        )
    }
}