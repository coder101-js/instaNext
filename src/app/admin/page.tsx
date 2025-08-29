
import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminUsers, getPostsForUser } from "@/lib/admin-data";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const users = await getAdminUsers();
  
  const viewPostsForUser = searchParams?.viewPosts as string | undefined;
  const userPosts = viewPostsForUser ? await getPostsForUser(viewPostsForUser) : [];

  return (
    <div className="w-full p-4 sm:p-8">
      <AdminDashboard 
        initialUsers={users} 
        initialPosts={userPosts}
        viewingUser={viewPostsForUser}
       />
    </div>
  );
}
