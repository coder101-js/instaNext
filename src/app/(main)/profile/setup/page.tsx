
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Tag, X, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfileSetupPage() {
  const { user, login, logout, setUser: setAuthUser } = useAuth(); // Get setUser from context
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(user?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    // Should be handled by layout, but as a fallback
    router.push('/login');
    return null;
  }

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
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          const newTag = currentTag.trim().replace(/#/g, "");
          if(newTag && !hashtags.includes(newTag)){
              setHashtags([...hashtags, newTag]);
          }
          setCurrentTag("");
      }
  }
  
  const removeTag = (tagToRemove: string) => {
      setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
       // In a real implementation, you would first upload the avatarFile to a storage service
       // and get back a URL. For this example, we'll just pass the data URI.
       const avatarUrl = avatarDataUri;
       
       const profileData = {
           name,
           username,
           bio,
           hashtags,
           avatar: avatarUrl,
           profileSetupComplete: true
       }
      
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

      toast({ title: "Profile Setup Complete!", description: "Welcome to InstaNext!" });
      router.push("/");
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
         <Card className="w-full max-w-md">
            <form onSubmit={handleSubmit}>
                <CardHeader className="relative">
                    <CardTitle>Set Up Your Profile</CardTitle>
                    <CardDescription>
                        Complete your profile to start sharing and connecting.
                    </CardDescription>
                    <Button variant="ghost" size="icon" onClick={logout} className="absolute top-4 right-4">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                    <div className="relative">
                        <Avatar className="w-24 h-24 border-2">
                            <AvatarImage src={avatarPreview || undefined} alt={name} />
                            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Label htmlFor="avatar-upload" className="absolute -right-2 -bottom-2 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/80">
                           <Camera className="h-4 w-4"/>
                        </Label>
                        <Input id="avatar-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="hashtags">Profile Hashtags</Label>
                     <div className="flex flex-wrap gap-2 rounded-md border p-2">
                        {hashtags.map(tag => (
                            <Badge key={tag} variant="secondary">
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/50">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        <div className="relative flex-grow">
                             <Tag className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input 
                                id="hashtags" 
                                placeholder="Add tags..." 
                                value={currentTag} 
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                className="pl-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                            />
                        </div>
                     </div>
                     <p className="text-xs text-muted-foreground">Press Enter or Space to add a tag.</p>
                </div>

                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? "Saving..." : "Save and Continue"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </main>
  );
}
