"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import * as z from 'zod'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { subredditValidator } from '@/lib/validators/subreddit'
import { toast } from "@/hooks/use-toast"
import { useCustomToast } from "@/hooks/use-custom-tost"


type formData = z.infer<typeof subredditValidator>

export default function CreatePage() {
    const router = useRouter()
    const customToast = useCustomToast()

    const form = useForm<formData>({
        resolver: zodResolver(subredditValidator),
        defaultValues: {
            name: ""
        }
    })

    const mutation = useMutation({
        mutationFn: async (data: formData) => {
            return axios.post('/api/subreddit', data)
        },
        onSuccess: (data) => {
            toast({
                title: `created`,
                description: `r/${data.data} succesfully created`,
                variant: 'default'
            });
            router.push(`/r/${data.data}`);
        },
        onError: (err) => {
            if (err instanceof AxiosError) {

                if (err.response?.status === 401) {
                    return customToast.logInToast()
                }

                if (err.response?.status === 409) {
                    return toast({
                        title: "Subreddit already exists",
                        description: "Please chosee different subreddit name",
                        variant: "destructive"
                    })
                }

                if (err.response?.status === 422) {
                    return toast({
                        title: "Invalid Subreddit name",
                        description: "Please choose a name between 3 and 21 characters",
                        variant: "destructive"
                    })
                }
            }

            toast({
                title: "Error",
                description: "Something Went Wrong",
                variant: "destructive"
            })
        }
    });

    const onSubmit: SubmitHandler<formData> = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className='container flex items-center h-full max-w-3xl mx-auto'>
            <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
                <div className='flex justify-between items-center'>
                    <h1 className="text-xl font-semibold">Create a community</h1>
                </div>

                <hr className='bg-zinc-500' />

                <div className='relative'>
                    {/* hook form shadcn */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <p className='text-lg font-medium '> Name</p>
                                            <p className='text-xs pb-2'>Community names including capitalization cannot be changed</p>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex justify-end gap-4'>
                                <Button type="button" variant="subtle" onClick={() => router.back()}>Cancel</Button>
                                <Button isLoading={mutation.isPending} type="submit">Create Community</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
