import { z } from "zod";

export const usernameValidator = z.object({
    username: z.string()
        .min(3, { message: "Username must have atleas 3 characters" })
        .max(32).regex(/^[a-zA-Z0-9]+$/)
})

export type UsernameRequest = z.infer<typeof usernameValidator>