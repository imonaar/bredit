import Link from "next/link";
import { Icons } from "./icons";
import { UserAuthForm } from "./user-auth-form";

export default function SignIn() {
    return (
        <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center ">
                <Icons.logo className="h-6 w-6 mx-auto" />
                <h1 className="text-2xl font-semibold tracking-tight"> Welcome back</h1>
                <p className="text-sm max-w-xs mx-auto">
                    By continuing you are setting up a Breadit account and agreeing to our user terms and conditions.
                </p>
                {/* sign in form */}
                <UserAuthForm />

                <p className="px-8 text-center text-sm text-zinc-700">
                    New to Breadit ?{' '}
                    <Link href="/sign-up" className="hover:text-zinc-800 text-sm underline underline-offset-4"> Sign up</Link>
                </p>
            </div>
        </div>
    )
}
