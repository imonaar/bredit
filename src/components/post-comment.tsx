"use client"

import { Comment, CommentVote, User } from '@prisma/client'
import React, { useRef, useState } from 'react'
import { UserAvatar } from './user-avatar'
import { formatTimeToNow } from '@/lib/utils'
import { CommentVotes } from './post-vote/comment-votes'
import { Button } from './ui/Button'
import { MessageSquare, Reply } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CreateComment } from './create-comment'

type ExtendedComment = (Comment & {
  votes: CommentVote[],
  author: User;
})

interface PostCommentProps {
  comment: ExtendedComment,
  votesAmt: number,
  currentVote: CommentVote | undefined,
  postId: string
}

export function PostComment({ comment, votesAmt, currentVote, postId }: PostCommentProps) {
  const commentRef = useRef<HTMLDivElement>(null)
  const [isReplying, setIsReplying] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  return (
    <div
      ref={commentRef}
      className='flex flex-col'
    >
      <div className='flex items-center'>
        <UserAvatar user={{
          name: comment.author.name || null,
          image: comment.author.image || null
        }}
          className='h-6 w-6'
        />

        <div className='ml-2 flex items-center gap-x-2'>
          <p className='text-sm font-medium text-gray-900'>
            u/{comment.author.username}
          </p>
          <p className='max-h-40 truncate text-xs text-zinc-500'>
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className='text-sm text-zinc-900'>{comment.text}</p>
      <div className='flex gap-2 items-center'>
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmt}
          initialVote={currentVote}
        />
        <Button
          size={"xs"}
          variant={"ghost"}
          aria-label='reply'
          onClick={() => {

            if (!session) {
              router.push('/sign-in')
            }
            setIsReplying(() => !isReplying)
          }}
        >
          <Reply className='h-5 w-5 mr-1.5' />
        </Button>
      </div>

      {
        isReplying ? (
          <div>
            <CreateComment postId={postId} replyToId={comment.replyToId ?? comment.id} />
          </div>
        ) : null
      }
    </div>
  )
}
