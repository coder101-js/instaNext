
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import type { User as UserType } from "@/lib/data";

interface UserCardProps {
    id: string;
    username: string;
    name: string;
    avatar: string;
}

const UserResultCard = ({ user }: { user: UserCardProps }) => {
    return (
        <Link href={`/profile/${user.username}`}>
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
            </div>
        </Link>
    );
};

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (debouncedSearchTerm && debouncedSearchTerm.length > 1) {
            setIsLoading(true);
            const fetchUsers = async () => {
                try {
                    const response = await fetch(`/api/user/search?q=${debouncedSearchTerm}`);
                    if (response.ok) {
                        const data = await response.json();
                        setResults(data);
                    } else {
                        setResults([]);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUsers();
        } else {
            setResults([]);
            setIsLoading(false);
        }
    }, [debouncedSearchTerm]);

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-2rem)] sm:m-4">
            <header className="text-center mb-4 pt-4 sm:pt-0">
                <h1 className="text-4xl font-headline tracking-wider gradient-text sm:hidden">InstaNext</h1>
                <h1 className="text-2xl sm:text-3xl font-bold hidden sm:block">Search</h1>
            </header>
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for users..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1 px-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map(user => <UserResultCard key={user.id} user={user} />)}
                        </div>
                    ) : (
                         <div className="text-center py-10 text-muted-foreground">
                           {debouncedSearchTerm.length > 1 ? <p>No users found for &quot;{debouncedSearchTerm}&quot;.</p> : <p>Search for people on InstaNext.</p> }
                        </div>
                    )}
                </ScrollArea>
            </Card>
        </div>
    );
}
