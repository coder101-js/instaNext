
"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchUsers(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchUsers]);
  
  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Search</h1>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-base"
        />
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && (
          <>
            <UserSkeleton />
            <UserSkeleton />
            <UserSkeleton />
          </>
        )}
        {!isLoading && results.length > 0 &&
          results.map((user) => <UserResultCard key={user.id} user={user} />)
        }
        {!isLoading && results.length === 0 && searchTerm.length > 1 && (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No users found for &quot;{searchTerm}&quot;.</p>
            </div>
        )}
         {!isLoading && searchTerm.length <= 1 && (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Search for friends by their name or username.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function UserResultCard({ user }: { user: User }) {
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
}

function UserSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

