import * as z from 'zod'

export const subredditValidator = z.object({
    name: z.string().min(3, {
        message: "Name must be atleast 2 characters."
    }).max(21)
})

export const subredditSubscriptionValidator = z.object({
    subredditId: z.string()
})

export type CreateSubredditPayload = z.infer<typeof subredditValidator>
export type SubscribeToRedditPayload = z.infer<typeof subredditSubscriptionValidator>