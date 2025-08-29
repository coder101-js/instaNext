
"use client";

import { useState, useMemo } from "react";
import { AdminUser, Post } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Verified, ShieldOff, MoreVertical, Eye, X, MessageSquare, Heart, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { Input } from "./ui/input";

type DeletionTarget = {
    type: 'user' | 'comment' | 'post';
    id: string;
    parentId?: string; // For comments, this will be postId
}

export function AdminDashboard({ initialUsers, initialPosts, viewingUser }: { initialUsers: AdminUser[], initialPosts: Post[], viewingUser?: string }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [deletionTarget, setDeletionTarget] = useState<DeletionTarget | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowercasedQuery = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(lowercasedQuery) ||
      user.username.toLowerCase().includes(lowercasedQuery)
    );
  }, [users, searchQuery]);


  const handleToggleVerify = async (userId: string, isVerified: boolean) => {
    try {
        const response = await fetch(`/api/admin/users/${userId}/verify`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isVerified: !isVerified })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status.');
        }
        setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !isVerified } : u));
        toast({ title: "Success", description: "User verification status updated." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "An unknown error occurred." });
    }
  };
  
  const handleDelete = async () => {
    if (!deletionTarget) return;

    let url = '';
    if (deletionTarget.type === 'user') {
        url = `/api/admin/users/${deletionTarget.id}`;
    } else if (deletionTarget.type === 'comment') {
        url = `/api/admin/posts/${deletionTarget.parentId}/comments/${deletionTarget.id}`;
    } else if (deletionTarget.type === 'post') {
        url = `/api/admin/posts/${deletionTarget.id}`;
    }
    
    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete.');
        }
        
        if (deletionTarget.type === 'user') {
            setUsers(users.filter(u => u.id !== deletionTarget.id));
        } else if (deletionTarget.type === 'comment') {
            setPosts(posts.map(p => {
                if (p.id === deletionTarget.parentId) {
                    return { ...p, comments: p.comments.filter(c => c.id !== deletionTarget.id) };
                }
                return p;
            }));
        } else if (deletionTarget.type === 'post') {
            setPosts(posts.filter(p => p.id !== deletionTarget.id));
        }

        toast({ title: "Success", description: `${deletionTarget.type.charAt(0).toUpperCase() + deletionTarget.type.slice(1)} deleted.` });
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "An unknown error occurred." });
    } finally {
        setDeletionTarget(null);
    }
  }
  
  const viewingUserDetails = users.find(u => u.id === viewingUser);

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
         {viewingUser && (
             <Button onClick={() => router.push('/admin')}>
                 <X className="mr-2 h-4 w-4" /> Back to All Users
             </Button>
         )}
      </header>

      {viewingUser ? (
        <PostManagementView 
            posts={posts} 
            user={viewingUserDetails} 
            onDeleteComment={(postId, commentId) => setDeletionTarget({ type: 'comment', id: commentId, parentId: postId })}
            onDeletePost={(postId) => setDeletionTarget({ type: 'post', id: postId })}
        />
      ) : (
        <UserManagementView 
            users={filteredUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onToggleVerify={handleToggleVerify}
            onDeleteUser={(userId) => setDeletionTarget({ type: 'user', id: userId })}
            onViewPosts={(userId) => router.push(`/admin?viewPosts=${userId}`)}
        />
      )}
      
       <AlertDialog open={!!deletionTarget} onOpenChange={(open) => !open && setDeletionTarget(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the {deletionTarget?.type}.
                     {deletionTarget?.type === 'user' && " This will remove all their data including posts, comments, and followers."}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}


function UserManagementView({ users, searchQuery, setSearchQuery, onToggleVerify, onDeleteUser, onViewPosts }: {
    users: AdminUser[],
    searchQuery: string,
    setSearchQuery: (q: string) => void,
    onToggleVerify: (userId: string, isVerified: boolean) => void,
    onDeleteUser: (userId: string) => void,
    onViewPosts: (userId: string) => void,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>App Users</CardTitle>
                <CardDescription>A list of all the users in your application.</CardDescription>
                <div className="relative pt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search users by name or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <p>{user.postCount} posts</p>
                            <p>{user.followers} followers</p>
                            <p>{user.following} following</p>
                        </TableCell>
                        <TableCell>{format(new Date(user.createdAt), "PPP")}</TableCell>
                        <TableCell>
                            {user.isVerified ? (
                                <Badge variant="secondary" className="text-blue-500"><Verified className="mr-1 h-4 w-4" /> Verified</Badge>
                            ) : (
                                <Badge variant="outline">Not Verified</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onViewPosts(user.id)}>
                                        <Eye className="mr-2 h-4 w-4" /> View Posts
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onToggleVerify(user.id, user.isVerified)}>
                                        {user.isVerified ? <ShieldOff className="mr-2 h-4 w-4" /> : <Verified className="mr-2 h-4 w-4" />}
                                        {user.isVerified ? 'Remove Verification' : 'Grant Verification'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDeleteUser(user.id)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function PostManagementView({ posts, user, onDeleteComment, onDeletePost }: {
    posts: Post[],
    user?: AdminUser,
    onDeleteComment: (postId: string, commentId: string) => void,
    onDeletePost: (postId: string) => void,
}) {
    if (!user) return <p>User not found.</p>;

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>Posts by {user.name}</CardTitle>
                            <CardDescription>@{user.username}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
             </Card>

            {posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">This user has no posts.</p>
            ) : (
                posts.map(post => (
                    <Card key={post.id} className="grid md:grid-cols-2 gap-0 overflow-hidden">
                        <div className="relative aspect-square">
                           <Image src={post.image} alt="Post image" fill className="object-cover"/>
                        </div>
                        <div className="flex flex-col">
                            <div className="p-4 border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm">{post.caption}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(post.createdAt), "PPP p")}</p>
                                    </div>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDeletePost(post.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <div className="flex gap-4 text-sm mt-2">
                                    <span className="flex items-center gap-1"><Heart className="h-4 w-4"/> {post.likes.length}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4"/> {post.comments.length}</span>
                                </div>
                            </div>
                            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96">
                                <h4 className="font-semibold text-sm">Comments</h4>
                                {post.comments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                                ) : (
                                    post.comments.map(comment => (
                                        <div key={comment.id} className="flex items-start gap-2 text-sm group">
                                            <div className="flex-1">
                                                <span className="font-semibold">{comment.username}</span>
                                                <p className="text-muted-foreground">{comment.text}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={() => onDeleteComment(post.id, comment.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    )
}

    