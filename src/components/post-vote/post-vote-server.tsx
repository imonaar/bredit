import { getAuthSession } from "@/lib/auth";
import { VoteType, Vote, User, Post } from "@prisma/client";
import { PostVoteClient } from "./post-vote-client";

interface PostVoteServerProps {
    postId: string;
    initialVotesAmount?: number;
    initialVote?: VoteType | null;
    getData: () => Promise<(Post & {
        votes: Vote[],
        author: User
    }) | null>
}

// const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

const PostVoteServer = async ({
    postId,
    initialVotesAmount,
    initialVote,
    getData
}: PostVoteServerProps) => {
    const session = await getAuthSession()

    let _votesAmt: number = 0
    let _currentVoteType: VoteType | null | undefined = undefined

    if (getData) {
        const post = await getData()

        if (!post) {
            return undefined
        }

        _votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc + 1
            if (vote.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        _currentVoteType = post.votes.find(vote => vote.userId === session?.user.id)?.type
    } else {
        _votesAmt = initialVotesAmount!
        _currentVoteType = initialVote

    }

    return <PostVoteClient
        postId={postId}
        initialVotesAmount={_votesAmt}
        initialVote={_currentVoteType}
    />
}

export { PostVoteServer }