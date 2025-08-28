import { getUserByUsername, getPostsForUser, getSavedPosts, getUser } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark } from "lucide-react";
import { PostGrid } from "@/components/post-grid";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await getUserByUsername(params.username);
  if (!user) {
    notFound();
  }

  const userPosts = await getPostsForUser(user.id);
  const savedPosts = await getSavedPosts(user.id);
  
  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 mb-8">
        <Avatar className="w-24 h-24 sm:w-36 sm:h-36 border-2">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-4 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <h1 className="text-2xl font-light">{user.username}</h1>
            <Button variant="secondary" size="sm">Edit Profile</Button>
          </div>
          <div className="flex gap-8 text-sm justify-center sm:justify-start">
            <p><span className="font-semibold">{userPosts.length}</span> posts</p>
            <p><span className="font-semibold">{user.followers.toLocaleString()}</span> followers</p>
            <p><span className="font-semibold">{user.following.toLocaleString()}</span> following</p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          </div>
        </div>
      </header>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex mx-auto border-b sm:border-none rounded-none">
          <TabsTrigger value="posts" className="gap-2 uppercase text-xs tracking-widest"><Grid3x3 className="w-4 h-4"/> Posts</TabsTrigger>
          <TabsTrigger value="saved" className="gap-2 uppercase text-xs tracking-widest"><Bookmark className="w-4 h-4"/> Saved</TabsTrigger>
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
