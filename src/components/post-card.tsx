
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send } from "lucide-react";
import type { Post, User, Comment as CommentType } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "./ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { formatDistanceToNow } from "date-fns";
import { VerifiedBadge } from "./verified-badge";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  author: User;
}

export function PostCard({ post, author }: PostCardProps) {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(currentUser ? post.likes.includes(currentUser.id) : false);
  const [isSaved, setIsSaved] = useState(currentUser ? currentUser.saved.includes(post.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comments, setComments] = useState<CommentType[]>(post.comments);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    // In real app, you would also make an API call here.
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
     // In real app, you would also make an API call here.
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && currentUser) {
      const commentToAdd: CommentType = {
        id: `c${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        text: newComment,
        createdAt: new Date(),
      };
      setComments([commentToAdd, ...comments]);
      setNewComment("");
    }
  };

  return (
    <Card className={cn(
      "rounded-none sm:rounded-lg border-x-0 sm:border-x",
       author.isVerified && "border-0 sm:border-2 sm:border-transparent sm:gradient-ring"
      )}>
      <CardHeader className="flex flex-row items-center gap-3 p-3">
        <Link href={`/profile/${author.username}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex items-center gap-1.5">
            <Link href={`/profile/${author.username}`} className="font-semibold text-sm hover:underline">
            {author.username}
            </Link>
            {author.isVerified && <VerifiedBadge className="w-4 h-4" />}
        </div>
         <span className="text-muted-foreground text-xs">· {formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </CardHeader>
      
        <Image
          src={post.image}
          alt={`Post by ${author.username}`}
          width={600}
          height={600}
          className="w-full aspect-square object-cover"
          data-ai-hint={post.aiHint}
        />
      
      <CardContent className="p-3">
        <div className="flex items-center gap-0">
          <Button variant="ghost" size="icon" onClick={handleLike} className="h-10 w-10 -ml-2">
            <Heart className={`h-6 w-6 transition-all ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="sr-only">Like</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Comment</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Send className="h-6 w-6" />
            <span className="sr-only">Share</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-10 w-10 ml-auto -mr-2">
            <Bookmark className={`h-6 w-6 transition-all ${isSaved ? "fill-foreground" : ""}`} />
            <span className="sr-only">Save</span>
          </Button>
        </div>
        
        <p className="text-sm font-semibold">{likesCount.toLocaleString()} likes</p>

        <p className="text-sm mt-2">
            <Link href={`/profile/${author.username}`} className="font-semibold hover:underline">
                {author.username}
            </Link>{" "}
            {post.caption}
        </p>

        {comments.length > 0 && (
            <div className="mt-2 space-y-1">
                {comments.slice(0, 2).map(comment => (
                     <p key={comment.id} className="text-sm">
                        <Link href={`/profile/${comment.userId}`} className="font-semibold hover:underline">
                            {comment.username}
                        </Link>{" "}
                        {comment.text}
                    </p>
                ))}
                {comments.length > 2 && (
                    <p className="text-sm text-muted-foreground cursor-pointer">View all {comments.length} comments</p>
                )}
            </div>
        )}

      </CardContent>
      <CardFooter className="p-3 pt-0">
        <form onSubmit={handleAddComment} className="flex w-full items-center gap-2">
            <Input 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..." 
                className="h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-1" />
            <Button type="submit" variant="ghost" size="sm" disabled={!newComment.trim()}>Post</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
