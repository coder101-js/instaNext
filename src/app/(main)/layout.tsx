
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainSidebar, MobileNav } from "@/components/main-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
         <div className="w-full max-w-md mx-auto p-4 space-y-8">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                </div>
            </div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
         </div>
      </div>
    );
  }
  
  if (!user.profileSetupComplete) {
      return (
           <div className="flex min-h-screen items-center justify-center bg-background">
               <div className="text-center p-8">
                   <h1 className="text-3xl font-bold mb-2">Welcome to InstaNext!</h1>
                   <p className="text-muted-foreground mb-6">Let's set up your profile to get started.</p>
                   <Button asChild>
                       <Link href={`/profile/${user.username}`}>Go to Profile</Link>
                   </Button>
               </div>
           </div>
      )
  }


  return (
    <div className="flex min-h-screen w-full">
        <MainSidebar />
        <main className="flex flex-1 flex-col sm:ml-20 pb-16 sm:pb-0 bg-background">
            {children}
        </main>
        <MobileNav />
    </div>
  );
}
