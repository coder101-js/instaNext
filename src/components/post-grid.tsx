import type { Post } from "@/lib/data";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

export function PostGrid({ posts }: { posts: Post[] }) {
    if (posts.length === 0) {
        return <p className="text-center text-muted-foreground mt-8">No posts yet.</p>
    }
    
    return (
        <div className="grid grid-cols-3 gap-1 sm:gap-4 mt-4">
            {posts.map(post => (
                <Link key={post.id} href="#" className="group relative aspect-square">
                    <Image
                        src={post.image}
                        alt={`Post by user`}
                        fill
                        className="object-cover"
                        data-ai-hint={post.aiHint}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                        <div className="flex items-center gap-1 font-semibold">
                            <Heart className="w-5 h-5 fill-white" />
                            <span>{post.likes.length}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                            <MessageCircle className="w-5 h-5 fill-white" />
                             <span>{post.comments.length}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
