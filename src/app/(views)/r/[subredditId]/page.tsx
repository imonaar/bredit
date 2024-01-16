import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../../../../../config";
import { notFound } from "next/navigation";
import { MiniCreatePost } from "@/components/mini-create-post";
import { PostFeed } from "@/components/post-feed";

export default async function page({ params }: {
    params: {
        subredditId: string
    }
}) {
    const subredditId = params.subredditId;
    const session = await getAuthSession()

    const subreddit = await db.subreddit.findFirst({
        where: {
            name: subredditId
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true,
                }
            }
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
    })

    if (!subreddit) {
        return notFound()
    }


    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl h-14 ">
                r/{subreddit.name}
            </h1>
            <MiniCreatePost session={session} />
            {/* TODO: show posts in user feed */}
            <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} userId={session?.user.id} />
        </>
    )
}
