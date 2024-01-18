import * as z from 'zod'

export const CommentValidator = z.object({
    postId: z.string(),
    replyToId: z.string().optional(),
    text: z.string(),
})

export type CommentRequest = z.infer<typeof CommentValidator>