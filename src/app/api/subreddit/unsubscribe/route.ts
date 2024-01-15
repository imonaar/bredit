import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { NextResponse } from "next/server";
import * as z from 'zod'

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()

        const { subredditId } = subredditSubscriptionValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id
            }
        })

        if (!subscriptionExists) {
            return new NextResponse("You are not subsscribe to this subreddit.", {
                status: 400
            }) //400 bad request
        }
        //check if user is the creator of the subreddit
        const subreddit = await db.subreddit.findFirst({
            where: {
                id: subredditId,
                creatorId: session.user.id
            }
        })
        if (subreddit) {
            return new NextResponse("You cannot unsubscribe from your own subreddit.", {
                status: 400
            }) //400 bad request
        }
        await db.subscription.delete({
            where: {
                userId_subredditId: {
                    subredditId,
                    userId: session.user.id
                }
            }
        })
        return new NextResponse(subredditId)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data passed", {
                status: 422
            })
            //422 bad entity
        }

        return new NextResponse("Could not unsubscribe please try again later", {
            status: 500
        })
    }
}