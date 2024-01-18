import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostComment } from "./post-comment";
import { CreateComment } from "./create-comment";

interface CommentsSectionProps {
    postId: string;
}

export async function CommentsSection({ postId }: CommentsSectionProps) {
    const session = await getAuthSession()
    const comments = await db.comment.findMany({
        where: {
            postId,
            replyToId: null
        },
        include: {
            author: true,
            votes: true,
            replies: {
                include: {
                    author: true,
                    votes: true
                }
            }
        }
    })
    return (
        <div className="flex flex-col gap-y-4 mt-4">
            <hr className="w-full h-px my-6" />
            <CreateComment postId={postId} />
            <div className="flex flex-col gap-y-6 mt-p">
                {
                    comments
                        .filter(comment => !comment.replyToId)
                        .map(comment => {
                            const topLevelCommentVotes = comment.votes.reduce((acc, vote) => {
                                if (vote.type === 'UP') return acc + 1
                                if (vote.type === 'DOWN') return acc - 1

                                return acc
                            }, 0)

                            const topLevelCommentVote = comment.votes.find(vote => vote.userId == session?.user.id)

                            return (
                                <div
                                    key={comment.id}
                                    className="flex flex-col"
                                >
                                    <div className="mb-2">
                                        <PostComment comment={comment} />
                                    </div>
                                </div>
                            )
                        })
                }
            </div>
        </div>
    )
}
