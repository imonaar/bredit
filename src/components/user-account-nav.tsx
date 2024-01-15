"use client"

import { User } from 'next-auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { UserAvatar } from './user-avatar'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface UserAccountNavProps {
    user: Pick<User, 'name' | 'image' | 'email'>
}

export function UserAccountNav({ user }: UserAccountNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar user={{ name: user.name || null, image: user.image || null }} className='h-8 w-8' />
            </DropdownMenuTrigger>

            <DropdownMenuContent className='bg-white' align='end'>
                <div className='flex items-center gap-2 justify-start p-2'>
                    <div className='flex flex-col space-y-1 leading-none'>
                        {
                            user.name ? <p className='font-medium'>{user.name}</p> : null
                        }
                        {
                            user.name ? <p className='w-[200px] truncate text-sm text-zinc-700'>{user.email}</p> : null
                        }
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/">
                        Feed
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/r/create">
                        Create Community
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className='cursor-pointer'
                    onSelect={(e) => {
                        e.preventDefault()
                        signOut({
                            callbackUrl: `${window.location.origin}/sign-in`
                        })
                    }}
                >
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
