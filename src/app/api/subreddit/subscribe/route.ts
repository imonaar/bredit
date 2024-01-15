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

        if (subscriptionExists) {
            return new NextResponse("Subscription exists", {
                status: 400
            }) //400 bad request
        }

        await db.subscription.create({
            data: {
                subredditId,
                userId: session.user.id
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

        return new NextResponse("Could not subscribe try again later", {
            status: 500
        })
    }
}