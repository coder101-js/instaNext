
import { PostCard } from "@/components/post-card";
import { getFeedPosts, getUser } from "@/lib/data";

export default async function HomePage() {
  const posts = await getFeedPosts();

  const postsWithAuthors = await Promise.all(
    posts.map(async (post) => {
      const author = await getUser(post.userId);
      return { ...post, author };
    })
  );

  return (
    <div className="flex flex-col items-center py-4 sm:py-8">
       <header className="sm:hidden text-center mb-4">
          <h1 className="text-4xl font-headline tracking-wider gradient-text">InstaNext</h1>
      </header>
      <div className="w-full max-w-md space-y-6">
        {postsWithAuthors.length > 0 ? (
          postsWithAuthors.map((post) => (
            post.author && <PostCard key={post.id} post={{...post}} author={post.author} />
          ))
        ) : (
            <div className="text-center py-20">
                <p className="text-muted-foreground">No posts available.</p>
                <p className="text-sm text-muted-foreground">Follow people to see their posts.</p>
            </div>
        )}
      </div>
    </div>
  );
}
