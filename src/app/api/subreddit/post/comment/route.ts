import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { CommentValidator } from "@/lib/validators/comment"
import * as z from 'zod'

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        const { text, postId, replyToId } = CommentValidator.parse(body)
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response("Unathorized", { status: 401 })
        }

        await db.comment.create({
            data: {
                text,
                postId,
                replyToId,
                authorId: session?.user.id
            }
        })

        return new Response('OK')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data passed", {
                status: 422
            })
            //422 bad entity
        }

        return new Response("Could not post, try again later", {
            status: 500
        })
    }
}