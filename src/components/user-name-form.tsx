"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { UsernameRequest, usernameValidator } from "@/lib/validators/username"
import { User } from "@prisma/client"
import { Button } from "./ui/Button"
import { Card, CardContent } from "./ui/card"


interface UsernameFormProps {
    user: Pick<User, 'username' | 'id'>
}

const UserNameForm = ({ user }: UsernameFormProps) => {
    const router = useRouter()
    const form = useForm<UsernameRequest>({
        resolver: zodResolver(usernameValidator),
        defaultValues: {
            username: user.username || "",
        },
    })

    const { mutate } = useMutation({
        mutationFn: async ({ username }: UsernameRequest) => {
            const payload: UsernameRequest = {
                username
            }
            const { data } = await axios.patch('api/username', payload)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409) {
                    return toast({
                        title: "USERNAME already taken.",
                        description: "Please chosee different username",
                        variant: "destructive"
                    })
                }
            }
            toast({
                title: "Error",
                description: "Something Went Wrong",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            toast({
                description: "Your username has been updated",
            })
            router.refresh()
        }
    })

    function onSubmit(values: UsernameRequest) {
        mutate(values)
    }
    return (
        <Card className="pt-4">
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormDescription className="mb-4">
                                        Please enter a display name you are comfortable with.
                                    </FormDescription>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="New username" className="w-[400px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Change Name</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export { UserNameForm }
