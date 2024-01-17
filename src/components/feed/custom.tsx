import { db } from "@/lib/db"
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../../../config"
import { PostFeed } from "../post-feed"
import { getAuthSession } from "@/lib/auth"

export async function CustomFeed() {
    const session = await getAuthSession()

    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id,
        },
        include: {
            subreddit: true
        }
    })

    const posts = await db.post.findMany({
        where: {
            subreddit: {
                name: {
                    in: followedCommunities.map(({ subreddit }) => subreddit.id)
                }
            }
        },
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
