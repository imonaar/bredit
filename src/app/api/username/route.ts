import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { usernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
    try {

        const session = await getAuthSession()
        if (!session?.user) {
            return new Response('unauthorized', { status: 401 })
        }
        const body = await req.json()

        const { username } = usernameValidator.parse(body)

        const username_ = await db.user.findFirst({
            where: {
                username
            }
        })

        if (username_) {
            return new Response("Username already exists", { status: 409 }) //naming conflict
        }

        await db.user.update({
            where: {
                id: session.user.id
            },
            data: {
                username
            }
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request data passed', {
                status: 422
            })
            //422 bad entity
        }

        return new Response("Could not update username, Please try again later.", {
            status: 500
        })
    }
}