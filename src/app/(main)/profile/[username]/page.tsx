
"use client"

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark, Moon, Sun } from "lucide-react";
import { PostGrid } from "@/components/post-grid";
import { ProfileEditButton } from "./edit-profile-button";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, User } from "@/lib/data";

function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}


export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [user, setUser] = useState<User | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/user/profile/${username}`);
                if (!res.ok) {
                    notFound();
                    return;
                }
                const { user, posts, savedPosts } = await res.json();
                setUser(user);
                setUserPosts(posts);
                setSavedPosts(savedPosts);

            } catch (error) {
                console.error("Failed to fetch profile data", error);
                // Optionally redirect to an error page or show a message
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchData();
        }
    }, [username]);

    if (isLoading) {
        return <ProfilePageSkeleton />;
    }

    if (!user) {
        return notFound();
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 mb-8">
                <div className="sm:hidden w-full text-center">
                    <h1 className="text-4xl font-headline tracking-wider gradient-text">InstaNext</h1>
                </div>
                <Avatar className="w-24 h-24 sm:w-36 sm:h-36 border-2">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center gap-4 justify-center sm:justify-start">
                        <h1 className="text-2xl font-light">{user.username}</h1>
                        <ProfileEditButton user={user} />
                        <ThemeToggle />
                    </div>
                    <div className="flex gap-8 text-sm justify-center sm:justify-start">
                        <p><span className="font-semibold">{userPosts.length}</span> posts</p>
                        <p><span className="font-semibold">{(user.followers as number).toLocaleString()}</span> followers</p>
                        <p><span className="font-semibold">{(user.following as number).toLocaleString()}</span> following</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">{user.bio}</p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex mx-auto border-b sm:border-none rounded-none">
                    <TabsTrigger value="posts" className="gap-2 uppercase text-xs tracking-widest"><Grid3x3 className="w-4 h-4" /> Posts</TabsTrigger>
                    <TabsTrigger value="saved" className="gap-2 uppercase text-xs tracking-widest"><Bookmark className="w-4 h-4" /> Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                    <PostGrid posts={userPosts} />
                </TabsContent>
                <TabsContent value="saved">
                    <PostGrid posts={savedPosts} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ProfilePageSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 mb-8">
                <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 rounded-full" />
                <div className="space-y-4 text-center sm:text-left w-full sm:w-auto">
                    <div className="flex items-center gap-4 justify-center sm:justify-start">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="flex gap-8 text-sm justify-center sm:justify-start">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </header>
            <Skeleton className="h-10 w-full sm:w-64" />
        </div>
    );
}
