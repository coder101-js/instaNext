
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
    return (
        <div className={cn("inline-block", className)}>
            <BadgeCheck className="w-5 h-5 text-white fill-primary" />
        </div>
    );
}
