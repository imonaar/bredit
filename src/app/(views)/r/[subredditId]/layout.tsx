import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { format } from 'date-fns'
import { SubscribeLeaveToggle } from "@/components/subscribe-leave-toggle"

export default async function SubredditLayout({ children, params }:
    {
        children: React.ReactNode
        params: {
            subredditId: string
        }
    }
) {
    const session = await getAuthSession()
    const name = params.subredditId;

    const subreddit = await db.subreddit.findFirst({
        where: {
            name: params.subredditId
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                }
            }
        }
    })

    const subscription = !session?.user ? undefined : await db.subscription.findFirst({
        where: {
            subreddit: {
                name: params.subredditId
            },
            user: {
                id: session.user.id
            }
            //check if an entry exists in the subscriptions table
        },

    })

    const isSubscribed = !!subscription  // double exl turns subscription into a boolean

    if (!subreddit) return notFound()

    const memberCount = await db.subscription.count({
        where: {
            subreddit: {
                name: params.subredditId
            }
        },
    })

    return (

        <div className="sm:container max-w-7xl mx-auto h-full pt-12">

            <div>
                {/* TODO: button to take us back to feed */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
                    <div className="flex flex-col col-span-2 space-y-6">
                        {children}
                    </div>
                    {/* Info sites bar */}
                    <div className="hidden md:block overflow-hiddenh-fit rounded-lg border-gray-200 order-first md:order-last">
                        <div className="px-6 py-4 ">
                            <p className="font-semibold py-3">
                                About r/{name}
                            </p>
                        </div>

                        <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-gray-500">Created</dt>
                                <dd className="text-gray-700">
                                    <time dateTime={subreddit.createdAt.toDateString()} >
                                        {format(subreddit.createdAt, 'MMMM d, yyyy')}
                                    </time>
                                </dd>
                            </div>

                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-gray-500">Members</dt>
                                <dd className="text-gray-700">
                                    <div className="text-gray-900">
                                        {memberCount}
                                    </div>
                                </dd>
                            </div>

                            {subreddit.creatorId === session?.user.id ? (
                                <div className="flex justify-between gap-x-4 py-3 ">
                                    <p className="text-gray-500">You created this Community</p>
                                </div>
                            ) : null}

                            {subreddit.creatorId !== session?.user.id ? (
                                <SubscribeLeaveToggle
                                    subredditId={subreddit.id}
                                    subredditName={subreddit.name}
                                    isSubscribed={isSubscribed}
                                />
                            ) : null}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
