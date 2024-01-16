"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from 'axios'
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { PostCreationRequest, postValidator } from '@/lib/validators/post'
import type EditorJS from "@editorjs/editorjs"
import { useMutation } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

interface EditorProps {
    subredditId: string
}

export function Editor({ subredditId }: EditorProps) {
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const form = useForm<PostCreationRequest>({
        resolver: zodResolver(postValidator),
        defaultValues: {
            subredditId,
            title: "",
            content: "",
        },
    })

    const errors = form.formState.errors;

    const ref = useRef<EditorJS>()
    const titleRef = useRef<HTMLInputElement>(null)

    //stream in the editor
    const initializeEditor = useCallback(async () => {
        const EditorJs = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const Table = (await import('@editorjs/table')).default
        const List = (await import('@editorjs/list')).default
        const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default

        if (!ref.current) {
            const editor = new EditorJs({
                holder: 'editor',
                onReady() {
                    ref.current = editor
                },
                placeholder: 'Type here to write your post...',
                inlineToolbar: true,
                data: { blocks: [] },
                tools: {
                    header: Header,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: '/api/link',
                        },
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                },
            })
        }
    }, [])

    useEffect(() => {
        if (Object.keys(errors).length) {
            for (const [_key, value] of Object.entries(errors)) {
                value
                toast({
                    title: 'Something went wrong.',
                    description: (value as { message: string }).message,
                    variant: 'destructive',
                })
            }
        }
    }, [errors])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMounted(true)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            await initializeEditor()
            setTimeout(() => {
                titleRef.current?.focus()
            }, 0)
        }

        if (isMounted) {
            init()

            return () => {
                ref.current?.destroy();
                ref.current = undefined;
            }
        }
    }, [isMounted, initializeEditor])

    const { mutate: createPost } = useMutation({
        mutationFn: async ({ title, content, subredditId }: PostCreationRequest) => {
            const payload: PostCreationRequest = {
                title,
                subredditId,
                content
            }
            const { data } = await axios.post('/api/subreddit/post/create', payload);
            return data
        },
        onError: () => {
            return toast({
                title: "error",
                description: "Your post was not published, please try again later",
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            const newPathname = pathname.split('/').slice(0, -1).join('/');
            router.push(newPathname);
            router.refresh();

            return toast({
                description: "Your post has been published"
            })
        }
    })

    async function onSubmit(data: PostCreationRequest) {
        const blocks = await ref.current?.save()
        const payload: PostCreationRequest = {
            title: data.title,
            subredditId: subredditId,
            content: blocks
        }

        console.log(payload)

        createPost(payload)
    }

    if (!isMounted) {
        return null
    }

    return (
        <div className="w-full bg-zinc-50 p-4 rounded-lg border border-zinc-200">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    id="subreddit-post-form"
                    className="space-y-8 "
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl ref={titleRef}>
                                    <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <div id="editor" className="min-h-[500px]" />
        </div>
    )
}
