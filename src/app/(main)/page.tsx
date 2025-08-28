
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
    <div className="flex justify-center py-4 sm:py-8">
      <div className="w-full max-w-md space-y-6">
        {postsWithAuthors.length > 0 ? (
          postsWithAuthors.map((post) => (
            post.author && <PostCard key={post.id} post={{...post}} author={post.author} />
          ))
        ) : (
            <div className="text-center py-20">
                <p className="text-muted-foreground">No posts available.</p>
                <p className="text-sm text-muted-foreground">Follow some users to see their posts here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
