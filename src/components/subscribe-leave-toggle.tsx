"use client"
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'


import { Button } from "./ui/Button";
import { SubscribeToRedditPayload } from '@/lib/validators/subreddit';
import { toast } from '@/hooks/use-toast';
import { useCustomToast } from "@/hooks/use-custom-tost"
import { startTransition } from 'react';
import { useRouter } from 'next/navigation';


const SubscribeLeaveToggle = ({ subredditId, subredditName, isSubscribed }: {
    subredditId: string,
    subredditName: string,
    isSubscribed: boolean
}) => {
    const router = useRouter()
    const customToast = useCustomToast()

    const { mutate: subscribe, isPending: isSubLoading } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToRedditPayload = {
                subredditId
            }
            const { data } = await axios.post(`/api/subreddit/subscribe`, payload)
            return data as string
        },
        onSuccess: (data) => {
            startTransition(() => {
                router.refresh()
            })

            toast({
                title: `Subscribed`,
                description: `You are now subscribed to r/${subredditName}`,
                variant: 'default'
            });
        },
        onError: (err) => {
            if (err instanceof AxiosError) {

                if (err.response?.status === 401) {
                    return customToast.logInToast()
                }
            }
            toast({
                title: "Error",
                description: "Something Went Wrong, please try again",
                variant: "destructive"
            })
        }

    })

    const { mutate: unsubscribe, isPending: isUnsubLoading } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToRedditPayload = {
                subredditId
            }
            const { data } = await axios.post(`/api/subreddit/unsubscribe`, payload)
            return data as string
        },
        onSuccess: (data) => {
            startTransition(() => {
                router.refresh()
            })

            toast({
                title: `Unsubscribed`,
                description: `You are now unsubscribed to r/${subredditName}`,
                variant: 'default'
            });
        },
        onError: (err) => {
            if (err instanceof AxiosError) {

                if (err.response?.status === 401) {
                    return customToast.logInToast()
                }
            }
            toast({
                title: "Error",
                description: "Something Went Wrong, please try again",
                variant: "destructive"
            })
        }

    })


    return isSubscribed ? (
        <Button isLoading={isUnsubLoading} className="w-full mt-1 mb-4 " onClick={() => unsubscribe()}>
            Leave Community
        </Button>
    ) : (
        <Button isLoading={isSubLoading} className="w-full mt-1 mb-4 " onClick={() => subscribe()}>
            Join to post
        </Button>
    );
}

export { SubscribeLeaveToggle };