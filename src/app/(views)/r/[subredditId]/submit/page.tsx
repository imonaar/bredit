import { Editor } from "@/components/editor";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

//poor naming of subredditId params. i should have used slug. Too late to change.

export default async function Create({ params }: {
    params: {
        subredditId: string
    }
}) {
    const name = params.subredditId;
    const subreddit = await db.subreddit.findFirst({
        where: {
            name: name
        }
    })

    if (!subreddit) return notFound()

    return (
        <div className="flex flex-col items-start gap-6">
            <div className="border-b border-gray-200">
                <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
                    <h3 className="ml-2 mt-2 font-semibold leading-6 text-gray-900">Create Post</h3>
                    <p className="ml-2 mt-1 truncate text-sm text-gray-500">In r/{params.subredditId}</p>   
                </div>
            </div>

            {/* form */}

            <Editor subredditId={subreddit.id} />

            <div className="w-full flex justify-end">
                <Button type="submit" className="w-full" form="subreddit-post-form">Post</Button>
            </div>
        </div>
    )
}
