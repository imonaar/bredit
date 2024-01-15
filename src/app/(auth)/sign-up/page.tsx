import {SignUp} from "@/components/sign-up";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div className="absolute inset-0">
            <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20" >
                <Link href='/' className={cn('self-start -mt-20', buttonVariants({ variant: 'ghost' }))} >
                    <ChevronLeft className="mr-2 h-6" />   Home
                </Link>
                <SignUp />
            </div>
        </div>
    )
}
