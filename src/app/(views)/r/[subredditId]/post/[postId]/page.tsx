import React from 'react'


interface PageProps {
    params: {
        postId: {

        }
    }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export function PostPage({ params }: PageProps) {
    
    return (
        <div>page</div>
    )
}
