import Link from "next/link"
import { Icons } from "./icons"
import { buttonVariants } from "./ui/Button"
import { getAuthSession } from "@/lib/auth"
import { UserAccountNav } from "./user-account-nav"
import { SearchBar } from "./search-bar"

const Navbar = async () => {
    const session = await getAuthSession()
    return (
        <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2">
            <div className="container mx-auto max-w-7xl h-full flex items-center justify-between gap-2">
                <Link href="/" className="flex gap-2 items-center">
                    <Icons.logo className="h-8 w-8 sm:h-6 sm:w-6" />
                    <p className="hidden text-zinc-700 text-sm font-medium md:block"> Breadit</p>
                </Link>

                {/* TODO:Search Bar */}
                <SearchBar />
                {
                    session?.user ? <UserAccountNav user={session.user} /> : <Link href='/sign-in' className={buttonVariants()} >Sign In</Link>
                }

            </div>
        </div>
    )
}

export { Navbar }