import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db"

import * as z from 'zod'

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const session = await getAuthSession()

        let followedCommunitiesIds: string[] = []

        if (session) {
            const followedCommunities = await db.subscription.findMany({
                where: {
                    userId: session.user.id,
                },
                include: {
                    subreddit: true,
                },
            })
            followedCommunitiesIds = followedCommunities.map((sub) => sub.subreddit.id)
        }

        const { take, cursor, subredditName } = z
            .object({
                take: z.string(),
                cursor: z.string(),
                subredditName: z.string().nullish().optional(),
            })
            .parse({
                take: url.searchParams.get("take"),
                cursor: url.searchParams.get("cursor"),
                subredditName: url.searchParams.get('subredditName')
            })

        let whereClause = {}

        if (subredditName) {
            whereClause = {
                subreddit: {
                    name: subredditName,
                },
            }
        } else if (session) {
            whereClause = {
                subreddit: {
                    id: {
                        in: followedCommunitiesIds,
                    },
                },
            }
        }

        let result = await db.post.findMany({
            take: take ? parseInt(take as string) : 10,
            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor as string,
                }
            }),
            orderBy: {
                createdAt: "desc",
            },
            where: whereClause,
            include: {
                subreddit: true,
                votes: true,
                author: true,
                comments: true,
            },
        });

        if (result.length == 0) {
            return new Response(JSON.stringify({
                data: [],
                metaData: {
                    cursor: null,
                    hasNextPage: false,
                },
            }), { status: 200 });
        }

        const lastPostInResults: any = result[result.length - 1];
        const cursor_: any = lastPostInResults.id;

        const nextPage = await db.post.findMany({
            take: take ? parseInt(take as string) : 7,
            skip: 1,
            cursor: {
                id: cursor_,
            },
        });

        const data = {
            data: result,
            metaData: {
                cursor: cursor_,
                hasNextPage: nextPage.length > 0,
            }
        };
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify(JSON.stringify({ error: error.message })), { status: 403 });
    }
}
