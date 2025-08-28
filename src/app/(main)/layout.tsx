
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainSidebar, MobileNav } from "@/components/main-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-card sm:flex">
            <div className="flex flex-col items-center gap-4 px-2 py-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col items-center gap-4 mt-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </div>
        </aside>
         <main className="flex flex-1 flex-col sm:ml-20 pb-16 sm:pb-0 bg-secondary/40">
            <div className="flex justify-center py-4 sm:py-8">
                <div className="w-full max-w-md space-y-6">
                    <div className="p-3 flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="w-full aspect-square" />
                </div>
            </div>
         </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
        <MainSidebar />
        <main className="flex flex-1 flex-col sm:ml-20 pb-16 sm:pb-0 bg-secondary/40">
            {children}
        </main>
        <MobileNav />
    </div>
  );
}
