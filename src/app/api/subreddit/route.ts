import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subredditValidator } from "@/lib/validators/subreddit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {

    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new NextResponse('Unauthorized', {
                status: 401
            })
        }

        const body = await req.json()

        const { name } = subredditValidator.parse(body)

        const subredditExists = await db.subreddit.findFirst({
            where: {
                name: name
            }
        })

        if (subredditExists) {
            return new NextResponse("Subreddit Exists", {
                status: 409
            })
            //409 - conflict
        }

        //create the subreddit
        const subreddit = await db.subreddit.create({
            data: {
                name,
                creatorId: session.user.id,

            }
        })

        //make the creator subscribe to that subreddit
        await db.subscription.create({
            data: {
                userId: session.user.id,
                subredditId: subreddit.id,
            }
        })
        return new Response(subreddit.name)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(error.message, {
                status: 422
            })
            //422 bad entity
        }

        return new NextResponse("Could not Create a new subreddit", {
            status: 500
        })
    }
}