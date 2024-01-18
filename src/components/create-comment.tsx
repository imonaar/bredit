"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"


import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useCustomToast } from "@/hooks/use-custom-tost"
import { toast } from "@/hooks/use-toast"
import { CommentRequest } from "@/lib/validators/comment"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { Button } from "./ui/Button"

const CommentFormSchema = z.object({
    comment: z.string()
})

export function CreateComment({ postId, replyToId }: { postId: string, replyToId?: string }) {
    const customToast = useCustomToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof CommentFormSchema>>({
        resolver: zodResolver(CommentFormSchema),
    })

    const { reset } = form;

    const { mutate } = useMutation({
        mutationFn: async ({ text, postId, replyToId }: CommentRequest) => {
            const payload: CommentRequest = {
                text,
                postId,
                replyToId,
            }

            const { data } = await axios.patch('/api/subreddit/post/comment', payload)
            return data

        },
        onError: (err) => {
            if (err instanceof AxiosError) {

                if (err.response?.status === 401) {
                    return customToast.logInToast()
                }
            }

            toast({
                title: "Error",
                description: "Something Went Wrong",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            router.refresh()
        }
    })

    function onSubmit(data: z.infer<typeof CommentFormSchema>) {
        mutate({
            text: data.comment,
            postId,
            replyToId
        })

        reset({ comment: "" }, {
            keepValues: false,
        })
    }

    return (
        <div className="grid w-full gap-1.5">
            <div className="mt-2">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Comment</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="comment"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="mt-2 flex justify-end">
                            <Button type="submit" >Post</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
