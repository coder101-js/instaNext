
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, Bot } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
    role: "user" | "model";
    content: any[]; // Can be string for user, or more complex for model
}

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
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
       if (scrollAreaRef.current) {
            const scrollableView = scrollAreaRef.current.children[0].children[0];
             if (scrollableView) {
                scrollableView.scrollTop = scrollableView.scrollHeight;
            }
       }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Set initial greeting from the AI
    useEffect(() => {
        setMessages([
            {
                role: "model",
                content: [{ text: `Hi ${user?.name || ''}! I'm InstaNext AI. How can I help you today? You can ask me to find users, like "search for chohanspace".` }]
            }
        ]);
    }, [user]);

    const handleSend = async () => {
        if (input.trim() === "") return;

        const userMessage: Message = { role: "user", content: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Prepare history for the API call
        const historyForApi = messages.map(msg => ({
            role: msg.role,
            content: msg.content.filter(c => typeof c.text === 'string') // only send text parts to history
        }));
        
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    history: historyForApi
                }),
            });

            if (!response.body) {
                 throw new Error("No response body");
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let modelResponse: Message = { role: 'model', content: [] };

            setMessages(prev => [...prev, modelResponse]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    try {
                        const parsedChunk = JSON.parse(line);
                        
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            
                             if (parsedChunk.content) {
                                // This is a new way Genkit streams. The content part might be a tool call or final text.
                                for (const part of parsedChunk.content) {
                                    if (part.text) {
                                         const existingTextPart = lastMessage.content.find(p => p.text !== undefined);
                                         if (existingTextPart) {
                                            existingTextPart.text += part.text;
                                         } else {
                                            lastMessage.content.push({ text: part.text });
                                         }
                                    } else if (part.toolRequest) {
                                        // We don't display the tool request, but we could if we wanted to show the AI's "thinking" process.
                                        // The tool's output will be streamed back as a separate content part.
                                    } else if (part.toolResponse) {
                                        lastMessage.content.push({ toolResponse: part.toolResponse });
                                    }
                                }
                            }
                            return newMessages;
                        });

                    } catch (e) {
                         console.error("Error parsing chunk:", e, "Chunk:", line);
                    }
                }
            }
            
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { role: "model", content: [{ text: "Sorry, I encountered an error. Please try again." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-2rem)] sm:m-4">
             <header className="text-center mb-4 pt-4 sm:pt-0">
                <h1 className="text-4xl font-headline tracking-wider gradient-text sm:hidden">InstaNext</h1>
                <h1 className="text-2xl sm:text-3xl font-bold hidden sm:block">InstaNext AI</h1>
             </header>
             <Card className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                                {message.role === 'model' && (
                                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center">
                                        <Bot className="w-5 h-5" />
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg px-3 py-2 max-w-sm prose", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                     {message.content.map((part, partIndex) => {
                                        if(part.text) {
                                            return <p key={partIndex} className="text-sm">{part.text}</p>
                                        }
                                        if(part.toolResponse && part.toolResponse.name === 'searchUsers') {
                                           const users = part.toolResponse.output as UserCardProps[];
                                           if (users.length === 0) {
                                               return <p key={partIndex} className="text-sm">I couldn't find any users matching that search.</p>
                                           }
                                           return (
                                               <div key={partIndex} className="space-y-2 mt-2">
                                                    {users.map(u => <UserResultCard key={u.id} user={u}/>)}
                                               </div>
                                           )
                                        }
                                        return null;
                                     })}
                                </div>
                                {message.role === 'user' && user && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                 <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center">
                                     <Bot className="w-5 h-5" />
                                 </Avatar>
                                 <div className="rounded-lg px-3 py-2 max-w-sm bg-secondary">
                                      <Skeleton className="h-4 w-10 animate-bounce" />
                                 </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <CardContent className="p-4 border-t">
                     <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message InstaNext AI..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

