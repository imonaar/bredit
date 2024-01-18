import { PostVoteServer } from '@/components/post-vote/post-vote-server'
import { buttonVariants } from '@/components/ui/Button'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { CachedPost } from '@/types/redis'
import { Post, User, Vote } from '@prisma/client'
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface PageProps {
    params: {
        postId: string
    }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function PostPage({ params }: PageProps) {
    const cachedPost = await redis.hgetall(`post:${params.postId}`) as CachedPost

    let post: (Post & {
        votes: Vote[],
        author: User
    }) | null = null

    if (!cachedPost) {
        post = await db.post.findFirst({
            where: {
                id: params.postId,
            },
            include: {
                votes: true,
                author: true
            }
        })
    }

    if (!post && !cachedPost) return notFound()

    return (
        <div>
            <div className='h-full flex flex-col sm:flex-row items-center sm:items-start'>
                <Suspense fallback={<PostVoteShell />}>
                    <PostVoteServer
                        postId={post?.id ?? cachedPost.id}
                        getData={async () => {
                            return db.post.findUnique({
                                where: {
                                    id: params.postId,
                                },
                                include: {
                                    votes: true,
                                    author: true
                                }
                            })
                        }}
                    />
                </Suspense>
            </div>
        </div>
    )
}

function PostVoteShell() {
    return <div className='flex items-center flex-col pr-6 w-20'>
        <div className={buttonVariants({ variant: 'ghost' })}>
            <ArrowBigUp className='h-5 w-5 text-zinc-900' />
            <div className='text-center py-2 font-medium text-sm text-zinc-900'>
                <Loader2 className='h-3 w-3 animate-spin' />
            </div>
            <ArrowBigDown className='h-5 w-5 text-zinc-900' />
        </div>
    </div>
}
