
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/lib/data";
import { useState, useOptimistic, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

async function followUser(userIdToFollow: string) {
  const userPayload = localStorage.getItem('insta-user');
  const response = await fetch('/api/user/follow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Payload': userPayload || '',
    },
    body: JSON.stringify({ userIdToFollow }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to follow user.');
  }
  return response.json();
}

export function ProfileEditButton({ user }: { user: User }) {
  const { user: currentUser, setUser: setAuthUser } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Optimistic UI for following
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useOptimistic(
    currentUser?.following.includes(user.id),
    (state, isFollowing) => isFollowing as boolean
  );
  
  const handleFollow = async () => {
    startTransition(() => {
      setOptimisticIsFollowing(!optimisticIsFollowing);
    });
    try {
      const { updatedCurrentUser } = await followUser(user.id);
      // Update user in auth context and localStorage
      setAuthUser(updatedCurrentUser);
      localStorage.setItem('insta-user', JSON.stringify(updatedCurrentUser));
      router.refresh(); // Refresh the page to show new follower count
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not follow user." });
      // Revert optimistic update
       setOptimisticIsFollowing(optimisticIsFollowing);
    }
  };

  if (currentUser?.id === user.id) {
    return <EditProfileDialog user={user} open={open} setOpen={setOpen} />;
  }

  return (
    <Button variant={optimisticIsFollowing ? "secondary" : "default"} size="sm" onClick={handleFollow}>
      {optimisticIsFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}


function EditProfileDialog({ user, open, setOpen }: { user: User, open: boolean, setOpen: (o: boolean) => void}) {
  const { setUser: setAuthUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(user.avatar);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setAvatarDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData = { name, bio, avatar: avatarDataUri };
      const userPayload = localStorage.getItem('insta-user');

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Payload": userPayload || '',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile.");
      }

      const updatedUser = await response.json();
      
      // Update user in auth context and localStorage
      setAuthUser(updatedUser);
      localStorage.setItem('insta-user', JSON.stringify(updatedUser));

      toast({ title: "Profile Updated" });
      setOpen(false);
      router.refresh();
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="flex items-center justify-center">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-2">
                        <AvatarImage src={avatarPreview || undefined} alt={name} />
                        <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Label htmlFor="avatar-edit-upload" className="absolute -right-2 -bottom-2 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/80">
                        <Camera className="h-4 w-4"/>
                    </Label>
                    <Input id="avatar-edit-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio || ''}
                onChange={(e) => setBio(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

