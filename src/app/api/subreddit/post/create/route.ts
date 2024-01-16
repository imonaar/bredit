import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { postValidator } from "@/lib/validators/post";
import { NextResponse } from "next/server";
import * as z from 'zod';

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()

        const { subredditId, title, content } = postValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id
            }
        })

        if (!subscriptionExists) {
            return new NextResponse("Subscribe to be able to post", {
                status: 400
            }) //400 bad request
        }

        await db.post.create({
            data: {
                title,
                content,
                subredditId,
                authorId: session.user.id
            }
        })

        return new NextResponse('OK')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data passed", {
                status: 422
            })
            //422 bad entity
        }

        return new NextResponse("Could not post, try again later", {
            status: 500
        })
    }
}