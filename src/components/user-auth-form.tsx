"use client"

import { signIn } from 'next-auth/react'
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Icons } from "./icons"
import { Button } from "./ui/Button"
import { useToast } from '@/hooks/use-toast'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()


    const loginWithGoogle = async () => {
        setIsLoading(true)
        try {
            await signIn('google')
        } catch (error) {
            toast({
                title: "Something went wrong",
                description: "Error logging in with google",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className={cn("flex justify-center", className)}{...props}>
            <Button
                size="sm"
                className="w-full"
                onClick={loginWithGoogle}
                isLoading={isLoading}
            >
                {isLoading ? null : <Icons.google className="h-4 w-4 mr-2" />}
                Google
            </Button>
        </div>
    )
}
