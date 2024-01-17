import { db } from "@/lib/db"
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../../../config"
import { PostFeed } from "../post-feed"

export async function GeneralFeed() {

    const posts = await db.post.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            author: true,
            votes: true,
            comments: true,
            subreddit: true
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
    })

    return <PostFeed initialPosts={posts} />
}