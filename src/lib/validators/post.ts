import * as z from 'zod'

export const postValidator = z.object({
    title: z.string().min(3, {
        message: "Title has to be at least 3 characters."
    }).max(128, {
        message: "Title might be at most 128 characters"
    }),
    subredditId: z.string(),
    content: z.any(),
})

export type PostCreationRequest = z.infer<typeof postValidator>