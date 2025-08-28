
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, PlusSquare, MessageCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/#", icon: Search, label: "Search" }, // Search functionality not implemented
  { href: "/create", icon: PlusSquare, label: "Create" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
];

export function MainSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-card sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
            <span className="font-headline text-2xl">I</span>
            <span className="sr-only">InstaNext</span>
        </Link>
        <TooltipProvider>
            {navItems.map((item) => (
                <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                        <Link href={item.href} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname === item.href ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
            ))}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <button className="rounded-full h-9 w-9 md:h-8 md:w-8" onClick={() => router.push(`/profile/${user?.username}`)}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Profile</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                     <Button variant="ghost" size="icon" onClick={logout} className="rounded-lg h-9 w-9 md:h-8 md:w-8 text-muted-foreground hover:text-foreground">
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}

export function MobileNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-card sm:hidden">
            <div className="flex justify-around h-16 items-center">
                 {navItems.map((item) => (
                    <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center rounded-lg transition-colors w-1/5 p-2 ${pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        <item.icon className="h-6 w-6" />
                        <span className="sr-only">{item.label}</span>
                    </Link>
                ))}
                 <button onClick={() => router.push(`/profile/${user?.username}`)} className={`flex flex-col items-center justify-center rounded-lg transition-colors w-1/5 p-2 ${pathname.startsWith('/profile') ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Profile</span>
                </button>
            </div>
        </div>
    )
}
