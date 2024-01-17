import { redis } from '@/lib/redis'
import { CachedPost } from '@/types/redis'
import React from 'react'


interface PageProps {
    params: {
        postId: {

        }
    }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function PostPage({ params }: PageProps) {
    const cachedPost = await redis.hgetall(`post:${params.postId}`) as  CachedPost
    return (
        <div>page</div>
    )
}
