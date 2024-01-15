"use client"

import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { X } from "lucide-react";

export function CloseModal() {
    const router = useRouter()
    return (
        <Button aria-label="close modal" onClick={() => router.back()} size="sm" variant="subtle" >
            <X className="h-4 w-4" />
        </Button>
    )
}
